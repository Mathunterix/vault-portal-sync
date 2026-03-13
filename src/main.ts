import { Notice, Plugin, TFile } from "obsidian";
import {
  AudienceFolderConfig,
  CollabAudience,
  CollabMe,
  DEFAULT_SETTINGS,
  PluginSettings,
  settingsSchema,
} from "./types";
import { PortalApi } from "./api";
import { SyncEngine, SyncStats } from "./sync/engine";
import { ScopeResolver } from "./sync/scope-resolver";
import { VaultWatcher } from "./sync/watcher";
import { VaultPortalSyncSettingTab } from "./settings";

interface StoredData extends PluginSettings {
  audienceConfigs?: AudienceFolderConfig[];
}

export default class VaultPortalSync extends Plugin {
  settings: StoredData = { ...DEFAULT_SETTINGS, audienceConfigs: [] };
  api: PortalApi = new PortalApi("", "");
  connectionInfo: CollabMe | null = null;
  lastSyncTime: Date | null = null;
  lastSyncStats: SyncStats | null = null;

  private syncEngine: SyncEngine | null = null;
  private scopeResolver: ScopeResolver | null = null;
  private watcher: VaultWatcher | null = null;
  private intervalId: number | null = null;
  private statusBarEl: HTMLElement | null = null;
  private audiences: CollabAudience[] = [];

  async onload(): Promise<void> {
    await this.loadSettings();
    this.api = new PortalApi(this.settings.portalUrl, this.settings.token);

    this.addSettingTab(new VaultPortalSyncSettingTab(this.app, this));

    // Status bar
    this.statusBarEl = this.addStatusBarItem();
    this.updateStatusBar("idle");

    // Commands
    this.addCommand({
      id: "vault-portal-sync-now",
      name: "Synchroniser maintenant",
      callback: () => this.runFullSync(),
    });

    this.addCommand({
      id: "vault-portal-sync-status",
      name: "Afficher le statut",
      callback: () => this.showStatus(),
    });

    // Ribbon icon
    this.addRibbonIcon("upload-cloud", "Vault Portal Sync", () => {
      this.runFullSync();
    });

    // Start sync if configured
    if (
      this.settings.enabled &&
      this.settings.portalUrl &&
      this.settings.token
    ) {
      // Delay startup to let Obsidian fully load metadataCache
      if (this.app.workspace.layoutReady) {
        this.startSync();
      } else {
        this.app.workspace.onLayoutReady(() => {
          this.startSync();
        });
      }
    }
  }

  onunload(): void {
    this.stopSync();
  }

  getScopeResolver(): ScopeResolver {
    if (!this.scopeResolver) {
      this.scopeResolver = new ScopeResolver(this.app);
    }
    return this.scopeResolver;
  }

  async loadSettings(): Promise<void> {
    const raw = await this.loadData();
    const merged = { ...DEFAULT_SETTINGS, audienceConfigs: [], ...(raw ?? {}) };
    const result = settingsSchema.safeParse(merged);
    if (result.success) {
      this.settings = {
        ...result.data,
        audienceConfigs: merged.audienceConfigs ?? [],
      };
    } else {
      this.settings = { ...DEFAULT_SETTINGS, audienceConfigs: [] };
    }
  }

  async saveSettings(restartSync = false): Promise<void> {
    await this.saveData(this.settings);
    this.api.updateConfig(this.settings.portalUrl, this.settings.token);

    if (restartSync) {
      this.stopSync();
      if (
        this.settings.enabled &&
        this.settings.portalUrl &&
        this.settings.token
      ) {
        this.startSync();
      }
    }
  }

  async runFullSync(silent = false): Promise<void> {
    if (!this.settings.portalUrl || !this.settings.token) {
      new Notice("Vault Portal: configure l'URL et le token d'abord");
      return;
    }

    this.updateStatusBar("syncing");

    try {
      // Refresh audiences
      this.audiences = await this.api.getAudiences();

      // Run sync
      if (!this.syncEngine) {
        this.syncEngine = new SyncEngine(this.app, this.api);
      }

      const stats = await this.syncEngine.fullSync(
        this.audiences,
        this.settings.audienceConfigs ?? [],
      );

      this.lastSyncTime = new Date();
      this.lastSyncStats = stats;

      const hasChanges = stats.created + stats.updated + stats.deleted > 0;
      const hasErrors = stats.errors.length > 0;

      if (hasErrors) {
        const total = stats.created + stats.updated;
        new Notice(
          `Vault Portal: ${total} synces, ${stats.deleted} supprimes, ${stats.errors.length} erreur(s)`,
        );
        this.updateStatusBar("error");
      } else if (!silent || hasChanges) {
        new Notice(
          `Vault Portal: ${stats.created} crees, ${stats.updated} maj, ${stats.deleted} supprimes`,
        );
        this.updateStatusBar("synced");
      } else {
        // Silent + no changes: just update status bar, no notification
        this.updateStatusBar("synced");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(`Vault Portal: erreur sync — ${msg}`);
      this.updateStatusBar("error");
    }
  }

  private async startSync(): Promise<void> {
    try {
      // Fetch connection info + audiences
      this.connectionInfo = await this.api.getMe();
      this.audiences = await this.api.getAudiences();
    } catch {
      this.updateStatusBar("error");
      return;
    }

    this.syncEngine = new SyncEngine(this.app, this.api);

    // Watcher (sync on save)
    if (this.settings.syncOnSave) {
      this.watcher = new VaultWatcher(
        this.app,
        (files: TFile[], _deleted: string[]) => {
          this.handleWatcherFlush(files);
        },
      );
      this.watcher.start();
    }

    // Periodic sync (silent: only notify when there are actual changes)
    const intervalMs = this.settings.syncIntervalMinutes * 60 * 1000;
    this.intervalId = this.registerInterval(
      window.setInterval(() => {
        this.runFullSync(true);
      }, intervalMs),
    ) as unknown as number;

    this.updateStatusBar("synced");
  }

  private stopSync(): void {
    if (this.watcher) {
      this.watcher.stop();
      this.watcher = null;
    }
    if (this.intervalId != null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async handleWatcherFlush(files: TFile[]): Promise<void> {
    if (!this.syncEngine || files.length === 0) return;

    this.updateStatusBar("syncing");
    try {
      const stats = await this.syncEngine.incrementalSync(
        files,
        this.audiences,
        this.settings.audienceConfigs ?? [],
      );
      this.lastSyncTime = new Date();
      this.lastSyncStats = stats;
      this.updateStatusBar(stats.errors.length > 0 ? "error" : "synced");
    } catch {
      this.updateStatusBar("error");
    }
  }

  private showStatus(): void {
    const parts: string[] = [];
    if (this.connectionInfo) {
      parts.push(`Connecte: ${this.connectionInfo.vaultSlug}`);
      parts.push(`Espaces: ${this.audiences.length}`);
    } else {
      parts.push("Non connecte");
    }
    if (this.lastSyncTime) {
      parts.push(`Dernier sync: ${this.lastSyncTime.toLocaleTimeString()}`);
    }
    if (this.lastSyncStats) {
      const s = this.lastSyncStats;
      parts.push(
        `${s.created} crees, ${s.updated} maj, ${s.deleted} supprimes`,
      );
    }
    new Notice(parts.join("\n"), 8000);
  }

  private updateStatusBar(
    state: "idle" | "syncing" | "synced" | "error",
  ): void {
    if (!this.statusBarEl) return;
    switch (state) {
      case "idle":
        this.statusBarEl.setText("VP: idle");
        break;
      case "syncing":
        this.statusBarEl.setText("VP: syncing...");
        break;
      case "synced":
        this.statusBarEl.setText("VP: synced");
        break;
      case "error":
        this.statusBarEl.setText("VP: error");
        break;
    }
  }
}
