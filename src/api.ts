import { requestUrl, RequestUrlParam } from "obsidian";
import { z } from "zod";
import {
  ChecksumEntry,
  checksumEntrySchema,
  CleanupResult,
  cleanupResultSchema,
  CollabAudience,
  collabAudienceSchema,
  CollabMe,
  collabMeSchema,
  SyncFilePayload,
  SyncResult,
  syncResultSchema,
} from "./types";

/**
 * HTTP client for the Vault Portal collab API.
 * Uses Obsidian's requestUrl (bypasses CORS via Electron).
 */
export class PortalApi {
  constructor(
    private baseUrl: string,
    private token: string,
  ) {}

  updateConfig(baseUrl: string, token: string): void {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    schema?: z.ZodType<T>,
  ): Promise<T> {
    const params: RequestUrlParam = {
      url: `${this.baseUrl}${path}`,
      method,
      headers: this.headers(),
    };
    if (body !== undefined) {
      params.body = JSON.stringify(body);
    }

    const response = await requestUrl(params);

    if (response.status >= 400) {
      const msg =
        typeof response.json?.error === "string"
          ? response.json.error
          : `HTTP ${response.status}`;
      throw new Error(msg);
    }

    const json = response.json;
    // unwrap envelopes: { data: ... }, { audiences: [...] }, { checksums: [...] }, etc.
    let data = json;
    if (json && typeof json === "object" && !Array.isArray(json)) {
      if (json.data !== undefined) {
        data = json.data;
      } else {
        // If the object has exactly one key containing an array, unwrap it
        const keys = Object.keys(json);
        if (keys.length === 1 && Array.isArray(json[keys[0]!])) {
          data = json[keys[0]!];
        }
      }
    }

    if (schema) {
      return schema.parse(data);
    }
    return data as T;
  }

  // GET /api/collab/me
  async getMe(): Promise<CollabMe> {
    // /me returns a flat object (not wrapped), so bypass generic unwrap
    const raw = await this.request<Record<string, unknown>>(
      "GET",
      "/api/collab/me",
    );
    // Normalize: ensure audiences have docCount (API may omit it)
    const obj =
      typeof raw === "object" && raw !== null
        ? raw
        : ({} as Record<string, unknown>);
    const audiences = Array.isArray(obj.audiences) ? obj.audiences : [];
    const normalized = {
      ...obj,
      audiences: audiences.map((a: Record<string, unknown>) => ({
        ...a,
        docCount: typeof a.docCount === "number" ? a.docCount : 0,
      })),
    };
    return collabMeSchema.parse(normalized);
  }

  // GET /api/collab/audiences
  // Custom unwrap: API returns { audiences: [...], includeFrontmatter: [...] }
  async getAudiences(): Promise<CollabAudience[]> {
    const raw = await this.request<Record<string, unknown>>(
      "GET",
      "/api/collab/audiences",
    );
    const obj =
      typeof raw === "object" && raw !== null
        ? raw
        : ({} as Record<string, unknown>);
    const audiences = Array.isArray(obj.audiences)
      ? obj.audiences
      : Array.isArray(raw)
        ? (raw as unknown[])
        : [];
    const includeFrontmatter = Array.isArray(obj.includeFrontmatter)
      ? (obj.includeFrontmatter as string[])
      : undefined;

    // Inject includeFrontmatter into each audience for scope-resolver
    const enriched = audiences.map((a: Record<string, unknown>) => ({
      ...a,
      ...(includeFrontmatter ? { includeFrontmatter } : {}),
    }));

    return z.array(collabAudienceSchema).parse(enriched);
  }

  // GET /api/collab/checksums
  async getChecksums(): Promise<ChecksumEntry[]> {
    return this.request(
      "GET",
      "/api/collab/checksums",
      undefined,
      z.array(checksumEntrySchema),
    );
  }

  // POST /api/collab/sync
  async syncFiles(files: SyncFilePayload[]): Promise<SyncResult> {
    return this.request(
      "POST",
      "/api/collab/sync",
      { files },
      syncResultSchema,
    );
  }

  // POST /api/collab/cleanup
  async cleanup(currentPaths: string[]): Promise<CleanupResult> {
    return this.request(
      "POST",
      "/api/collab/cleanup",
      { currentPaths },
      cleanupResultSchema,
    );
  }

  // POST /api/collab/rules
  async saveRules(
    audienceId: string,
    rules: {
      ruleType: string;
      value: string;
      groupId: number;
      direction?: string;
    }[],
  ): Promise<void> {
    await this.request("POST", "/api/collab/rules", { audienceId, rules });
  }

  // POST /api/collab/upload (binary attachment)
  async uploadAttachment(
    path: string,
    data: ArrayBuffer,
    mimeType: string,
  ): Promise<void> {
    await requestUrl({
      url: `${this.baseUrl}/api/collab/upload`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": mimeType,
        "X-File-Path": encodeURIComponent(path),
      },
      body: data,
    });
  }
}
