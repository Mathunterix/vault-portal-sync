export type LogLevel = "info" | "warn" | "error";
export type LogContext = "sync" | "api" | "scope" | "watcher" | "plugin";

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const MAX_ENTRIES = 500;
const PREFIX = "vault-portal-sync:";

class Logger {
  private entries: LogEntry[] = [];
  private listeners: Array<(entry: LogEntry) => void> = [];

  log(level: LogLevel, message: string, context?: LogContext): void {
    const entry: LogEntry = { timestamp: new Date(), level, message, context };

    this.entries.push(entry);
    if (this.entries.length > MAX_ENTRIES) {
      this.entries.splice(0, this.entries.length - MAX_ENTRIES);
    }

    // Console output
    const tag = context ? `[${context}]` : "";
    const full = `${PREFIX} ${tag} ${message}`;
    switch (level) {
      case "error":
        console.error(full);
        break;
      case "warn":
        console.warn(full);
        break;
      default:
        console.log(full);
    }

    // Notify listeners
    for (const fn of this.listeners) {
      fn(entry);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context);
  }

  getEntries(filter?: {
    level?: LogLevel;
    context?: LogContext;
    since?: Date;
  }): LogEntry[] {
    let result = this.entries;
    if (filter?.level) {
      result = result.filter((e) => e.level === filter.level);
    }
    if (filter?.context) {
      result = result.filter((e) => e.context === filter.context);
    }
    if (filter?.since) {
      const since = filter.since.getTime();
      result = result.filter((e) => e.timestamp.getTime() >= since);
    }
    return result;
  }

  getLastSync(): LogEntry[] {
    // Find last "sync:start" marker and return everything after
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const e = this.entries[i]!;
      if (e.context === "sync" && e.message.startsWith("Sync demarree")) {
        return this.entries.slice(i);
      }
    }
    return [];
  }

  clear(): void {
    this.entries = [];
  }

  onNewEntry(fn: (entry: LogEntry) => void): void {
    this.listeners.push(fn);
  }

  removeListener(fn: (entry: LogEntry) => void): void {
    this.listeners = this.listeners.filter((l) => l !== fn);
  }

  copyToClipboard(): string {
    return this.entries
      .map((e) => {
        const ts = formatTimestamp(e.timestamp);
        const lvl = e.level.toUpperCase().padEnd(5);
        const ctx = e.context ? `[${e.context}]`.padEnd(10) : "".padEnd(10);
        return `[${ts}] [${lvl}] ${ctx} ${e.message}`;
      })
      .join("\n");
  }
}

function formatTimestamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Singleton
export const logger = new Logger();
