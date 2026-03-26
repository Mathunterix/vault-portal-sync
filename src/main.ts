import { Notice, Plugin, TFile } from "obsidian";
import {
  AudienceFolderConfig,
  CollabAudience,
  CollabMe,
  DEFAULT_SETTINGS,
  DryRunResult,
  PluginSettings,
  StatusResponse,
  settingsSchema,
} from "./types";
import { PortalApi } from "./api";
import { SyncEngine, SyncStats } from "./sync/engine";
import { ScopeResolver } from "./sync/scope-resolver";
import { VaultWatcher } from "./sync/watcher";
import { HttpTrigger } from "./http-trigger";
import { VaultPortalSyncSettingTab } from "./settings";
import { logger } from "./logger";

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
  private httpTrigger: HttpTrigger | null = null;
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

    // Start HTTP trigger if enabled
    if (this.settings.httpEnabled && this.settings.httpToken) {
      this.startHttpTrigger();
    }
  }

  onunload(): void {
    this.stopSync();
    this.stopHttpTrigger();
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

  async saveSettings(restartSync = false, restartHttp = false): Promise<void> {
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

    if (restartHttp) {
      this.stopHttpTrigger();
      if (this.settings.httpEnabled && this.settings.httpToken) {
        this.startHttpTrigger();
      }
    }
  }

  startHttpTrigger(): void {
    if (!this.settings.httpToken) {
      this.settings.httpToken = Array.from(
        crypto.getRandomValues(new Uint8Array(32)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      this.saveData(this.settings);
    }

    this.httpTrigger = new HttpTrigger({
      port: this.settings.httpPort,
      token: this.settings.httpToken,
      onSync: () => this.runFullSyncForHttp(),
      onDryRun: () => this.dryRunForHttp(),
      getStatus: () => this.getStatusForHttp(),
    });
    this.httpTrigger.start();
  }

  stopHttpTrigger(): void {
    if (this.httpTrigger) {
      this.httpTrigger.stop();
      this.httpTrigger = null;
    }
  }

  getHttpTrigger(): HttpTrigger | null {
    return this.httpTrigger;
  }

  private async runFullSyncForHttp(): Promise<SyncStats> {
    if (!this.settings.portalUrl || !this.settings.token) {
      throw new Error("Plugin not configured");
    }
    this.updateStatusBar("syncing");
    this.audiences = await this.api.getAudiences();
    if (!this.syncEngine) {
      this.syncEngine = new SyncEngine(this.app, this.api);
    }
    const stats = await this.syncEngine.fullSync(
      this.audiences,
      this.settings.audienceConfigs ?? [],
    );
    this.lastSyncTime = new Date();
    this.lastSyncStats = stats;
    this.updateStatusBar(
      stats.errors.length > 0 ? "error" : "synced",
      stats.errors.length,
    );
    return stats;
  }

  private async dryRunForHttp(): Promise<DryRunResult> {
    if (!this.settings.portalUrl || !this.settings.token) {
      throw new Error("Plugin not configured");
    }
    this.audiences = await this.api.getAudiences();
    if (!this.syncEngine) {
      this.syncEngine = new SyncEngine(this.app, this.api);
    }
    return this.syncEngine.dryRun(
      this.audiences,
      this.settings.audienceConfigs ?? [],
    );
  }

  private getStatusForHttp(): StatusResponse {
    return {
      connected: this.connectionInfo !== null,
      syncing: false,
      lastSyncTime: this.lastSyncTime?.toISOString() ?? null,
      lastSyncStats: this.lastSyncStats ?? null,
      audiences: this.audiences.map((a) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
      })),
    };
  }

  async runFullSync(silent = false): Promise<void> {
    if (!this.settings.portalUrl || !this.settings.token) {
      new Notice("Vault Portal: configure l'URL et le token d'abord");
      return;
    }

    const mode = silent ? "auto" : "manual";
    logger.info(`Sync demarree (full, ${mode})`, "sync");
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
        this.updateStatusBar("error", stats.errors.length);

        if (silent) {
          // Silent + partial: show first error detail
          const firstErr = stats.errors[0] ?? "erreur inconnue";
          const ok = stats.created + stats.updated;
          new Notice(
            `VP: ${ok} OK, ${stats.errors.length} echec — ${firstErr}`,
            10000,
          );
        } else {
          // Manual + partial
          new Notice(
            `VP: ${stats.created} crees, ${stats.updated} maj — ${stats.errors.length} echec (voir logs)`,
            10000,
          );
        }
      } else if (!silent || hasChanges) {
        new Notice(
          `VP: ${stats.created} crees, ${stats.updated} maj, ${stats.deleted} supprimes`,
          5000,
        );
        this.updateStatusBar("synced");
      } else {
        // Silent + no changes: just update status bar, no notification
        this.updateStatusBar("synced");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Sync echouee: ${msg}`, "sync");
      new Notice(`VP: erreur sync — ${msg}`, 10000);
      this.updateStatusBar("error");
    }
  }

  private async startSync(): Promise<void> {
    try {
      // Fetch connection info + audiences
      this.connectionInfo = await this.api.getMe();
      this.audiences = await this.api.getAudiences();
      logger.info(
        `Connecte: ${this.connectionInfo.vaultSlug} (${this.audiences.length} audiences)`,
        "plugin",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Connexion echouee: ${msg}`, "plugin");
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
      logger.info("Watcher demarre (sync a la modification)", "plugin");
    }

    // Periodic sync (silent: only notify when there are actual changes)
    const intervalMs = this.settings.syncIntervalMinutes * 60 * 1000;
    this.intervalId = this.registerInterval(
      window.setInterval(() => {
        this.runFullSync(true);
      }, intervalMs),
    ) as unknown as number;
    logger.info(
      `Sync periodique: toutes les ${this.settings.syncIntervalMinutes} min`,
      "plugin",
    );

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

    logger.info(`Watcher: ${files.length} fichiers modifies`, "watcher");
    this.updateStatusBar("syncing");
    try {
      const stats = await this.syncEngine.incrementalSync(
        files,
        this.audiences,
        this.settings.audienceConfigs ?? [],
      );
      this.lastSyncTime = new Date();
      this.lastSyncStats = stats;
      if (stats.errors.length > 0) {
        this.updateStatusBar("error", stats.errors.length);
      } else {
        this.updateStatusBar("synced");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Watcher sync echouee: ${msg}`, "watcher");
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
    errorCount?: number,
  ): void {
    if (!this.statusBarEl) return;

    // Remove old click handler by replacing the element content
    this.statusBarEl.empty();

    switch (state) {
      case "idle":
        this.statusBarEl.setText("VP \u2713");
        break;
      case "syncing":
        this.statusBarEl.setText("VP \u21bb sync...");
        break;
      case "synced":
        this.statusBarEl.setText("VP \u2713");
        break;
      case "error": {
        const label =
          errorCount && errorCount > 0
            ? `VP \u26a0 ${errorCount} echec${errorCount > 1 ? "s" : ""}`
            : "VP \u2717 erreur";
        this.statusBarEl.setText(label);
        break;
      }
    }

    // Click opens settings (which now includes logs tab)
    if (state !== "syncing") {
      this.statusBarEl.style.cursor = "pointer";
      this.statusBarEl.addEventListener(
        "click",
        () => {
          // Open plugin settings
          const setting = (this.app as unknown as Record<string, unknown>)
            .setting as
            | { open(): void; openTabById(id: string): void }
            | undefined;
          if (setting) {
            setting.open();
            setting.openTabById(this.manifest.id);
          }
        },
        { once: true },
      );
    } else {
      this.statusBarEl.style.cursor = "default";
    }
  }
}
