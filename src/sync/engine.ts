import { App, TFile } from "obsidian";
import { PortalApi } from "../api";
import { ScopeResolver } from "./scope-resolver";
import {
  AudienceFolderConfig,
  CollabAudience,
  DryRunResult,
  SyncFilePayload,
  SyncResult,
} from "../types";
import { computeChecksum } from "./checksum";
import { extractAttachmentRefs, resolveAttachment } from "./attachments";
import { logger } from "../logger";

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

    const syncStart = Date.now();

    // 1. Resolve scope (union of all audiences)
    const filesInScope = this.scopeResolver.resolveAll(audiences, localConfigs);
    logger.info(
      `Scope: ${filesInScope.length} fichiers (${audiences.length} audiences)`,
      "sync",
    );

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
        const sizeMB = (content.length / 1_000_000).toFixed(1);
        const errMsg = `Fichier ignore: ${file.path} (${sizeMB}MB > limite 1MB)`;
        logger.warn(errMsg, "sync");
        stats.errors.push(errMsg);
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

    logger.info(
      `Checksums: ${stats.unchanged} inchanges, ${toUpload.length} a envoyer`,
      "sync",
    );

    // 4. Upload changed files in batches
    const totalBatches = Math.ceil(toUpload.length / BATCH_SIZE);
    for (let i = 0; i < toUpload.length; i += BATCH_SIZE) {
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
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
        logger.info(
          `Batch ${batchNum}/${totalBatches}: ${batch.length} fichiers envoyes`,
          "sync",
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(
          `Batch ${batchNum}/${totalBatches} echoue: ${msg}`,
          "sync",
        );
        stats.errors.push(`Batch upload failed: ${msg}`);
      }
    }

    // 5. Cleanup: tell server which paths still exist
    const currentPaths = [...localPaths];
    try {
      const cleanupResult = await this.api.cleanup(currentPaths);
      stats.deleted = cleanupResult.deleted;
      logger.info(`Cleanup: ${cleanupResult.deleted} supprimes`, "sync");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Cleanup echoue: ${msg}`, "sync");
      stats.errors.push(`Cleanup failed: ${msg}`);
    }

    // 6. Upload attachments referenced by synced files
    try {
      const attCount = await this.uploadAttachments(filesInScope);
      stats.attachments = attCount;
      if (attCount > 0) {
        logger.info(`Attachments: ${attCount} envoyes`, "sync");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`Attachments echoue: ${msg}`, "sync");
      stats.errors.push(`Attachments failed: ${msg}`);
    }

    const elapsed = ((Date.now() - syncStart) / 1000).toFixed(1);
    logger.info(
      `Sync terminee: ${stats.created} crees, ${stats.updated} maj, ${stats.deleted} suppr, ${stats.errors.length} erreur(s) (${elapsed}s)`,
      "sync",
    );

    return stats;
  }

  /**
   * Dry run: compute scope and diff without uploading anything.
   */
  async dryRun(
    audiences: CollabAudience[],
    localConfigs: AudienceFolderConfig[],
  ): Promise<DryRunResult> {
    const filesInScope = this.scopeResolver.resolveAll(audiences, localConfigs);

    const serverChecksums = await this.api.getChecksums();
    const serverMap = new Map<string, string>();
    for (const entry of serverChecksums) {
      serverMap.set(entry.path, entry.checksum);
    }

    let toUpload = 0;
    let unchanged = 0;
    const localPaths = new Set<string>();

    for (const file of filesInScope) {
      localPaths.add(file.path);
      const content = await this.app.vault.cachedRead(file);
      const checksum = await computeChecksum(content);
      if (serverMap.get(file.path) === checksum) {
        unchanged++;
      } else {
        toUpload++;
      }
    }

    let toDelete = 0;
    for (const entry of serverChecksums) {
      if (!localPaths.has(entry.path)) {
        toDelete++;
      }
    }

    return { filesInScope: filesInScope.length, toUpload, toDelete, unchanged };
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

    logger.info(`Sync incrementale: ${files.length} fichiers modifies`, "sync");

    // Only sync files that are actually in scope
    const allInScope = this.scopeResolver.resolveAll(audiences, localConfigs);
    const inScopePaths = new Set(allInScope.map((f) => f.path));
    const filesToSync = files.filter((f) => inScopePaths.has(f.path));

    if (filesToSync.length === 0) {
      logger.info("Aucun fichier modifie dans le scope", "sync");
      return stats;
    }

    logger.info(`${filesToSync.length} fichiers dans le scope`, "sync");

    const payloads: SyncFilePayload[] = [];
    for (const file of filesToSync) {
      try {
        const content = await this.app.vault.cachedRead(file);
        if (content.length > MAX_FILE_SIZE) {
          const sizeMB = (content.length / 1_000_000).toFixed(1);
          const errMsg = `Fichier ignore: ${file.path} (${sizeMB}MB > limite 1MB)`;
          logger.warn(errMsg, "sync");
          stats.errors.push(errMsg);
          continue;
        }
        const checksum = await computeChecksum(content);
        payloads.push({ path: file.path, content, checksum });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error(`Lecture echouee: ${file.path} — ${msg}`, "sync");
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
        logger.error(`Batch upload echoue: ${msg}`, "sync");
        stats.errors.push(`Batch upload failed: ${msg}`);
      }
    }

    logger.info(
      `Sync incrementale terminee: ${stats.created} crees, ${stats.updated} maj, ${stats.errors.length} erreur(s)`,
      "sync",
    );

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
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          logger.warn(
            `Attachment ignore: ${resolved.file.path} — ${msg}`,
            "sync",
          );
        }
      }
    }

    return count;
  }
}
