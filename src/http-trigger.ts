import * as http from "http";
import { Notice } from "obsidian";
import { logger } from "./logger";
import type { SyncStats } from "./sync/engine";
import type { DryRunResult, StatusResponse } from "./types";

interface HttpTriggerConfig {
  port: number;
  token: string;
  onSync: () => Promise<SyncStats>;
  onDryRun: () => Promise<DryRunResult>;
  getStatus: () => StatusResponse;
}

const SYNC_TIMEOUT_MS = 120_000;

const ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export class HttpTrigger {
  private server: http.Server | null = null;
  private syncing = false;
  private _running = false;
  private config: HttpTriggerConfig;

  constructor(config: HttpTriggerConfig) {
    this.config = config;
  }

  isRunning(): boolean {
    return this._running;
  }

  start(): void {
    if (this.server) return;

    this.server = http.createServer((req, res) => {
      this.handle(req, res);
    });

    this.server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        logger.warn(
          `Port ${this.config.port} deja utilise — serveur HTTP non demarre`,
          "http",
        );
        new Notice(`VP: port ${this.config.port} deja utilise`);
        this.server = null;
        this._running = false;
      } else {
        logger.error(`Erreur serveur HTTP: ${err.message}`, "http");
      }
    });

    this.server.listen(this.config.port, "127.0.0.1", () => {
      this._running = true;
      logger.info(
        `HTTP trigger on http://127.0.0.1:${this.config.port}`,
        "http",
      );
    });
  }

  stop(): void {
    if (!this.server) return;
    this.server.close(() => {
      logger.info("HTTP trigger stopped", "http");
    });
    this.server = null;
    this._running = false;
  }

  private handle(req: http.IncomingMessage, res: http.ServerResponse): void {
    const start = Date.now();
    const method = req.method ?? "GET";
    const url = req.url ?? "/";

    // Guard: Host header (anti DNS rebinding)
    const host = (req.headers.host ?? "").replace(/:\d+$/, "");
    if (!ALLOWED_HOSTS.has(host)) {
      logger.warn(
        `Requete rejetee: Host header suspect "${req.headers.host}"`,
        "http",
      );
      this.sendJson(res, 403, { error: "Forbidden" });
      return;
    }

    // Guard: Bearer token
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== this.config.token) {
      this.sendJson(res, 401, { error: "Unauthorized" });
      return;
    }

    // Routing
    if (method === "POST" && url === "/sync") {
      this.handleSync(req, res, start);
    } else if (method === "POST" && url === "/sync/check") {
      this.handleDryRun(res, start);
    } else if (method === "GET" && url === "/status") {
      this.handleStatus(res, start);
    } else {
      this.sendJson(res, 404, { error: "Not found" });
    }
  }

  private handleSync(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    start: number,
  ): void {
    // Guard: concurrence
    if (this.syncing) {
      this.sendJson(res, 409, { error: "Sync already in progress" });
      return;
    }

    this.syncing = true;
    let responded = false;

    // Timeout
    const timeout = setTimeout(() => {
      if (!responded) {
        responded = true;
        this.sendJson(res, 504, {
          status: "error",
          message: "Sync timeout (120s)",
        });
        logger.warn("POST /sync timeout (120s)", "http");
      }
    }, SYNC_TIMEOUT_MS);

    new Notice("VP: sync declenchee via HTTP", 3000);

    this.config
      .onSync()
      .then((stats) => {
        clearTimeout(timeout);
        if (responded) return;
        responded = true;

        const duration = Date.now() - start;
        const status = stats.errors.length > 0 ? "partial" : "ok";
        this.sendJson(res, 200, { status, stats, duration });
        logger.info(`POST /sync -> 200 ${status} (${duration}ms)`, "http");
      })
      .catch((err: unknown) => {
        clearTimeout(timeout);
        if (responded) return;
        responded = true;

        const msg = err instanceof Error ? err.message : String(err);
        this.sendJson(res, 500, { status: "error", message: msg });
        logger.error(`POST /sync -> 500: ${msg}`, "http");
      })
      .finally(() => {
        this.syncing = false;
      });
  }

  private handleDryRun(res: http.ServerResponse, start: number): void {
    this.config
      .onDryRun()
      .then((result) => {
        const duration = Date.now() - start;
        this.sendJson(res, 200, { status: "ok", ...result });
        logger.info(`POST /sync/check -> 200 (${duration}ms)`, "http");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        this.sendJson(res, 500, { status: "error", message: msg });
        logger.error(`POST /sync/check -> 500: ${msg}`, "http");
      });
  }

  private handleStatus(res: http.ServerResponse, start: number): void {
    try {
      const status = this.config.getStatus();
      status.syncing = this.syncing;
      const duration = Date.now() - start;
      this.sendJson(res, 200, { status: "ok", ...status });
      logger.info(`GET /status -> 200 (${duration}ms)`, "http");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.sendJson(res, 500, { status: "error", message: msg });
      logger.error(`GET /status -> 500: ${msg}`, "http");
    }
  }

  private sendJson(
    res: http.ServerResponse,
    statusCode: number,
    body: Record<string, unknown>,
  ): void {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  }
}
