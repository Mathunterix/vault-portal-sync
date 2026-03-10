import { App, TFile } from "obsidian";

const DEBOUNCE_MS = 5_000;

/**
 * Watches vault events (create, modify, delete, rename)
 * and collects changed files with debouncing.
 */
export class VaultWatcher {
  private pendingFiles = new Map<string, TFile>();
  private pendingDeletes = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onFlush: (files: TFile[], deleted: string[]) => void;

  constructor(
    private app: App,
    onFlush: (files: TFile[], deleted: string[]) => void,
  ) {
    this.onFlush = onFlush;
  }

  start(): void {
    this.app.vault.on("modify", this.handleFileEvent);
    this.app.vault.on("create", this.handleFileEvent);
    this.app.vault.on("delete", this.handleDeleteEvent);
    this.app.vault.on("rename", this.handleRenameEvent);
  }

  stop(): void {
    this.app.vault.off("modify", this.handleFileEvent);
    this.app.vault.off("create", this.handleFileEvent);
    this.app.vault.off("delete", this.handleDeleteEvent);
    this.app.vault.off("rename", this.handleRenameEvent);

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private handleFileEvent = (...args: unknown[]): void => {
    const file = args[0];
    if (file instanceof TFile && file.extension === "md") {
      this.pendingFiles.set(file.path, file);
      this.scheduleFlush();
    }
  };

  private handleDeleteEvent = (...args: unknown[]): void => {
    const file = args[0];
    if (file instanceof TFile && file.extension === "md") {
      this.pendingFiles.delete(file.path);
      this.pendingDeletes.add(file.path);
      this.scheduleFlush();
    }
  };

  private handleRenameEvent = (...args: unknown[]): void => {
    const file = args[0];
    const oldPath = args[1];
    if (
      file instanceof TFile &&
      file.extension === "md" &&
      typeof oldPath === "string"
    ) {
      this.pendingDeletes.add(oldPath);
      this.pendingFiles.delete(oldPath);
      this.pendingFiles.set(file.path, file);
      this.scheduleFlush();
    }
  };

  private scheduleFlush(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.flush();
    }, DEBOUNCE_MS);
  }

  private flush(): void {
    this.timer = null;
    const files = [...this.pendingFiles.values()];
    const deleted = [...this.pendingDeletes];
    this.pendingFiles.clear();
    this.pendingDeletes.clear();

    if (files.length > 0 || deleted.length > 0) {
      this.onFlush(files, deleted);
    }
  }
}
