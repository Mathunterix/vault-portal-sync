import { App, TFile } from "obsidian";
import { PortalApi } from "../api";
import { ScopeResolver } from "./scope-resolver";
import {
  AudienceFolderConfig,
  CollabAudience,
  SyncFilePayload,
  SyncResult,
} from "../types";
import { computeChecksum } from "./checksum";
import { extractAttachmentRefs, resolveAttachment } from "./attachments";

const BATCH_SIZE = 20;
const MAX_FILE_SIZE = 1_000_000; // 1MB per file

export interface SyncStats {
  created: number;
  updated: number;
  unchanged: number;
  deleted: number;
  attachments: number;
  errors: string[];
}

/**
 * Core sync engine. Orchestrates diff, upload, cleanup, and attachments.
 */
export class SyncEngine {
  private scopeResolver: ScopeResolver;

  constructor(
    private app: App,
    private api: PortalApi,
  ) {
    this.scopeResolver = new ScopeResolver(app);
  }

  /**
   * Full sync: diff → upload changed → cleanup deleted → upload attachments.
   */
  async fullSync(
    audiences: CollabAudience[],
    localConfigs: AudienceFolderConfig[],
  ): Promise<SyncStats> {
    const stats: SyncStats = {
      created: 0,
      updated: 0,
      unchanged: 0,
      deleted: 0,
      attachments: 0,
      errors: [],
    };

    // 1. Resolve scope (union of all audiences)
    const filesInScope = this.scopeResolver.resolveAll(audiences, localConfigs);

    // 2. Get server checksums
    const serverChecksums = await this.api.getChecksums();
    const serverMap = new Map<string, string>();
    for (const entry of serverChecksums) {
      serverMap.set(entry.path, entry.checksum);
    }

    // 3. Compute local checksums and diff
    const toUpload: { file: TFile; content: string; checksum: string }[] = [];
    const localPaths = new Set<string>();

    for (const file of filesInScope) {
      localPaths.add(file.path);
      const content = await this.app.vault.cachedRead(file);

      if (content.length > MAX_FILE_SIZE) {
        stats.errors.push(`${file.path}: too large (>${MAX_FILE_SIZE} bytes)`);
        continue;
      }

      const checksum = await computeChecksum(content);
      const serverChecksum = serverMap.get(file.path);

      if (serverChecksum === checksum) {
        stats.unchanged++;
      } else {
        toUpload.push({ file, content, checksum });
      }
    }

    // 4. Upload changed files in batches
    for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
      const batch = toUpload.slice(i, i + BATCH_SIZE);
      const payloads: SyncFilePayload[] = batch.map((item) => ({
        path: item.file.path,
        content: item.content,
        checksum: item.checksum,
      }));

      try {
        const result: SyncResult = await this.api.syncFiles(payloads);
        stats.created += result.created;
        stats.updated += result.updated;
        stats.unchanged += result.unchanged;
        if (result.errors) {
          stats.errors.push(...result.errors);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`Batch upload failed: ${msg}`);
      }
    }

    // 5. Cleanup: tell server which paths still exist
    const currentPaths = [...localPaths];
    try {
      const cleanupResult = await this.api.cleanup(currentPaths);
      stats.deleted = cleanupResult.deleted;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stats.errors.push(`Cleanup failed: ${msg}`);
    }

    // 6. Upload attachments referenced by synced files
    try {
      const attCount = await this.uploadAttachments(filesInScope);
      stats.attachments = attCount;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      stats.errors.push(`Attachments failed: ${msg}`);
    }

    return stats;
  }

  /**
   * Incremental sync: only sync specific files (e.g. after vault.on("modify")).
   */
  async incrementalSync(
    files: TFile[],
    audiences: CollabAudience[],
    localConfigs: AudienceFolderConfig[],
  ): Promise<SyncStats> {
    const stats: SyncStats = {
      created: 0,
      updated: 0,
      unchanged: 0,
      deleted: 0,
      attachments: 0,
      errors: [],
    };

    // Only sync files that are actually in scope
    const allInScope = this.scopeResolver.resolveAll(audiences, localConfigs);
    const inScopePaths = new Set(allInScope.map((f) => f.path));
    const filesToSync = files.filter((f) => inScopePaths.has(f.path));

    if (filesToSync.length === 0) return stats;

    const payloads: SyncFilePayload[] = [];
    for (const file of filesToSync) {
      try {
        const content = await this.app.vault.cachedRead(file);
        if (content.length > MAX_FILE_SIZE) {
          stats.errors.push(
            `${file.path}: too large (>${MAX_FILE_SIZE} bytes)`,
          );
          continue;
        }
        const checksum = await computeChecksum(content);
        payloads.push({ path: file.path, content, checksum });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`Read failed ${file.path}: ${msg}`);
      }
    }

    if (payloads.length === 0) return stats;

    // Upload in batches
    for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
      const batch = payloads.slice(i, i + BATCH_SIZE);
      try {
        const result = await this.api.syncFiles(batch);
        stats.created += result.created;
        stats.updated += result.updated;
        stats.unchanged += result.unchanged;
        if (result.errors) stats.errors.push(...result.errors);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`Batch upload failed: ${msg}`);
      }
    }

    return stats;
  }

  /**
   * Upload binary attachments referenced by in-scope notes.
   */
  private async uploadAttachments(files: TFile[]): Promise<number> {
    const seen = new Set<string>();
    let count = 0;

    for (const file of files) {
      const refs = extractAttachmentRefs(this.app, file);
      for (const ref of refs) {
        if (seen.has(ref)) continue;
        seen.add(ref);

        const resolved = resolveAttachment(this.app, ref, file);
        if (!resolved) continue;

        try {
          const data = await this.app.vault.readBinary(resolved.file);
          await this.api.uploadAttachment(
            resolved.file.path,
            data,
            resolved.mimeType,
          );
          count++;
        } catch {
          // Skip failed attachments silently
        }
      }
    }

    return count;
  }
}
