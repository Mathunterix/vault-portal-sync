import { App, TFile } from "obsidian";
import { CollabAudience, AudienceFolderConfig, LocalRule } from "../types";

export interface ScopeBreakdown {
  /** Files matched by rules (folders/tags/linked) — visible wiki */
  ruleFiles: TFile[];
  /** Files with frontmatter `audience: slug` matching this audience — visible wiki */
  audienceFmFiles: TFile[];
  /** Files with context frontmatter (user-portal, audience-portal) — chatbot only, not audience-specific */
  contextFiles: TFile[];
  /** All files combined (for sync) */
  all: TFile[];
}

/**
 * Resolves which vault files are "in scope" for a given audience,
 * using Obsidian's metadataCache (already-parsed frontmatter, tags, links).
 *
 * INCLUDE logic: AND within a group, OR between groups.
 * EXCLUDE logic: OR (any exclude removes the file).
 */
export class ScopeResolver {
  constructor(private app: App) {}

  /**
   * Return all markdown files in scope for an audience,
   * combining local rules (hydrated from server) + legacy folder config.
   */
  resolve(
    audience: CollabAudience,
    localConfig: AudienceFolderConfig | undefined,
  ): TFile[] {
    return this.resolveDetailed(audience, localConfig).all;
  }

  /**
   * Return a detailed breakdown of files in scope, categorized by reason.
   */
  resolveDetailed(
    audience: CollabAudience,
    localConfig: AudienceFolderConfig | undefined,
  ): ScopeBreakdown {
    const allFiles = this.app.vault.getMarkdownFiles();
    const ruleSet = new Set<TFile>();

    // --- Collect all INCLUDE rules (local rules take priority, fallback to server) ---
    const rules: LocalRule[] =
      localConfig?.rules && localConfig.rules.length > 0
        ? localConfig.rules
        : audience.rules.map((r) => ({
            ruleType: r.ruleType,
            value: r.value,
            groupId: r.groupId ?? 0,
            direction: r.direction
              ? (r.direction.toUpperCase() as LocalRule["direction"])
              : undefined,
          }));

    const includeRules = rules.filter((r) => !r.ruleType.startsWith("EXCLUDE"));
    const excludeRules = rules.filter((r) => r.ruleType.startsWith("EXCLUDE"));

    // --- INCLUDE: AND within group, OR between groups ---
    const groups = new Map<number, LocalRule[]>();
    for (const rule of includeRules) {
      const gid = rule.groupId ?? 0;
      if (!groups.has(gid)) groups.set(gid, []);
      groups.get(gid)!.push(rule);
    }

    for (const [, groupRules] of groups) {
      let groupFiles: Set<TFile> | null = null;

      for (const rule of groupRules) {
        const matched = new Set<TFile>();
        switch (rule.ruleType) {
          case "INCLUDE_FOLDER":
            this.matchFolder(allFiles, rule.value, matched);
            break;
          case "INCLUDE_TAG":
            this.matchTag(allFiles, rule.value, matched);
            break;
          case "INCLUDE_LINKED":
            this.matchLinked(allFiles, rule.value, rule.direction, matched);
            break;
        }

        if (groupFiles === null) {
          groupFiles = matched;
        } else {
          // AND = intersection
          for (const f of groupFiles) {
            if (!matched.has(f)) groupFiles.delete(f);
          }
        }
      }

      // OR = union between groups
      if (groupFiles) {
        for (const f of groupFiles) ruleSet.add(f);
      }
    }

    // --- Legacy local folder overrides ---
    if (localConfig) {
      for (const folder of localConfig.folders) {
        this.matchFolder(allFiles, folder, ruleSet);
      }
    }

    // --- Frontmatter-based files (categorized) ---
    const frontmatterKeys = audience.includeFrontmatter ?? [
      "user-portal",
      "audience",
      "audience-portal",
    ];
    const contextKeys = ["user-portal", "audience-portal"];
    const audienceFmSet = new Set<TFile>();
    const contextSet = new Set<TFile>();

    for (const file of allFiles) {
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      if (!fm) continue;

      // Context files (user-portal, audience-portal) — not audience-specific
      const matchedContextKey = contextKeys.find(
        (key) => frontmatterKeys.includes(key) && key in fm,
      );
      if (matchedContextKey && !ruleSet.has(file)) {
        contextSet.add(file);
        continue;
      }

      // Audience frontmatter — only if matches THIS audience slug
      if (
        frontmatterKeys.includes("audience") &&
        "audience" in fm &&
        !ruleSet.has(file)
      ) {
        const fmAudience = fm["audience"];
        const slugs = Array.isArray(fmAudience)
          ? fmAudience
          : typeof fmAudience === "string"
            ? [fmAudience]
            : [];
        if (slugs.includes(audience.slug)) {
          audienceFmSet.add(file);
        }
      }
    }

    // --- Post-filter EXCLUDE rules on rule files + audience FM files (OR combinator) ---
    const toExcludeFrom = new Set([...ruleSet, ...audienceFmSet]);
    const excluded = new Set<TFile>();
    for (const rule of excludeRules) {
      switch (rule.ruleType) {
        case "EXCLUDE_FOLDER":
          for (const f of toExcludeFrom) {
            if (
              f.path.startsWith(
                rule.value.endsWith("/") ? rule.value : rule.value + "/",
              )
            )
              excluded.add(f);
          }
          break;
        case "EXCLUDE_TAG":
          for (const f of toExcludeFrom) {
            if (this.fileHasTag(f, rule.value)) excluded.add(f);
          }
          break;
        case "EXCLUDE_LINKED":
          for (const f of toExcludeFrom) {
            if (this.isLinkedTo(f, rule.value, rule.direction)) excluded.add(f);
          }
          break;
      }
    }

    for (const f of excluded) {
      ruleSet.delete(f);
      audienceFmSet.delete(f);
    }

    // --- Filter out share: false ---
    const isShareable = (f: TFile): boolean => {
      const cache = this.app.metadataCache.getFileCache(f);
      return cache?.frontmatter?.["share"] !== false;
    };

    const ruleFiles = [...ruleSet].filter(isShareable);
    const audienceFmFiles = [...audienceFmSet].filter(isShareable);
    const contextFiles = [...contextSet].filter(isShareable);

    return {
      ruleFiles,
      audienceFmFiles,
      contextFiles,
      all: [...ruleFiles, ...audienceFmFiles, ...contextFiles],
    };
  }

  /**
   * Resolve scope for ALL audiences combined (union).
   * Returns deduplicated list.
   */
  resolveAll(
    audiences: CollabAudience[],
    localConfigs: AudienceFolderConfig[],
  ): TFile[] {
    const all = new Set<TFile>();
    for (const audience of audiences) {
      const config = localConfigs.find((c) => c.audienceId === audience.id);
      const files = this.resolve(audience, config);
      for (const f of files) all.add(f);
    }
    return [...all];
  }

  /**
   * Count audience-specific files (rules + audience frontmatter, excluding context).
   */
  countInScope(
    audience: CollabAudience,
    localConfig: AudienceFolderConfig | undefined,
  ): number {
    const bd = this.resolveDetailed(audience, localConfig);
    return bd.ruleFiles.length + bd.audienceFmFiles.length;
  }

  /**
   * Return the detailed breakdown for preview.
   */
  listInScopeDetailed(
    audience: CollabAudience,
    localConfig: AudienceFolderConfig | undefined,
  ): ScopeBreakdown {
    return this.resolveDetailed(audience, localConfig);
  }

  /**
   * Collect all context files (user-portal, audience-portal) across all audiences.
   * Deduplicated. These files are not audience-specific.
   */
  resolveContextFiles(
    audiences: CollabAudience[],
    _localConfigs: AudienceFolderConfig[],
  ): { file: TFile; key: string }[] {
    const seen = new Set<string>();
    const result: { file: TFile; key: string }[] = [];
    const allFiles = this.app.vault.getMarkdownFiles();
    const contextKeys = ["user-portal", "audience-portal"];

    // Use includeFrontmatter from first audience (same for all)
    const frontmatterKeys = audiences[0]?.includeFrontmatter ?? [
      "user-portal",
      "audience",
      "audience-portal",
    ];

    for (const file of allFiles) {
      if (seen.has(file.path)) continue;
      const cache = this.app.metadataCache.getFileCache(file);
      const fm = cache?.frontmatter;
      if (!fm) continue;
      if (fm["share"] === false) continue;

      for (const key of contextKeys) {
        if (
          frontmatterKeys.includes(key) &&
          key in fm &&
          !seen.has(file.path)
        ) {
          seen.add(file.path);
          result.push({ file, key });
        }
      }
    }

    return result;
  }

  // ---- private helpers ----

  private matchFolder(
    files: TFile[],
    folderPath: string,
    out: Set<TFile>,
  ): void {
    const normalized = folderPath.endsWith("/") ? folderPath : folderPath + "/";
    for (const f of files) {
      if (f.path.startsWith(normalized) || f.path === folderPath) {
        out.add(f);
      }
    }
  }

  private matchTag(files: TFile[], tagValue: string, out: Set<TFile>): void {
    for (const f of files) {
      if (this.fileHasTag(f, tagValue)) {
        out.add(f);
      }
    }
  }

  private fileHasTag(file: TFile, tagValue: string): boolean {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache) return false;

    const normalizedTag = tagValue.replace(/^#/, "");

    // Inline tags
    const inlineTags = cache.tags?.map((t) => t.tag.replace(/^#/, "")) ?? [];
    if (inlineTags.includes(normalizedTag)) return true;

    // Frontmatter tags
    const fmTags = cache.frontmatter?.tags;
    if (Array.isArray(fmTags)) {
      if (fmTags.some((t: string) => t.replace(/^#/, "") === normalizedTag))
        return true;
    } else if (typeof fmTags === "string") {
      if (fmTags.replace(/^#/, "") === normalizedTag) return true;
    }

    return false;
  }

  private matchLinked(
    files: TFile[],
    noteValue: string,
    direction: string | null | undefined,
    out: Set<TFile>,
  ): void {
    const sourceFile = this.app.metadataCache.getFirstLinkpathDest(
      noteValue,
      "",
    );
    if (!sourceFile) return;

    // Always include the source note itself
    out.add(sourceFile);

    const dir = (direction ?? "BOTH").toUpperCase();
    const resolvedLinks = this.app.metadataCache.resolvedLinks;

    if (dir === "OUTGOING" || dir === "BOTH") {
      const outgoing = resolvedLinks[sourceFile.path];
      if (outgoing) {
        for (const targetPath of Object.keys(outgoing)) {
          const targetFile = files.find((f) => f.path === targetPath);
          if (targetFile) out.add(targetFile);
        }
      }
    }

    if (dir === "INCOMING" || dir === "BOTH") {
      for (const [filePath, links] of Object.entries(resolvedLinks)) {
        if (links && sourceFile.path in links) {
          const linkedFile = files.find((f) => f.path === filePath);
          if (linkedFile) out.add(linkedFile);
        }
      }
    }
  }

  private isLinkedTo(
    file: TFile,
    noteValue: string,
    direction: string | null | undefined,
  ): boolean {
    const sourceFile = this.app.metadataCache.getFirstLinkpathDest(
      noteValue,
      "",
    );
    if (!sourceFile) return false;

    const dir = (direction ?? "BOTH").toUpperCase();
    const resolvedLinks = this.app.metadataCache.resolvedLinks;

    if (dir === "OUTGOING" || dir === "BOTH") {
      const outgoing = resolvedLinks[sourceFile.path];
      if (outgoing && file.path in outgoing) return true;
    }

    if (dir === "INCOMING" || dir === "BOTH") {
      const fileLinks = resolvedLinks[file.path];
      if (fileLinks && sourceFile.path in fileLinks) return true;
    }

    return false;
  }
}
