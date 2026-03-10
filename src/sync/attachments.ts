import { App, TFile } from "obsidian";

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
};

function getMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "application/octet-stream";
}

/**
 * Extract attachment references (![[file.ext]]) from a markdown file.
 * Only returns non-markdown references (images, PDF, audio, video).
 */
export function extractAttachmentRefs(app: App, file: TFile): string[] {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache?.embeds) return [];

  const refs: string[] = [];
  for (const embed of cache.embeds) {
    const link = embed.link;
    // Skip markdown embeds (wikilinks to .md files or links without extension)
    const ext = link.split(".").pop()?.toLowerCase() ?? "";
    if (ext === "md" || !ext.includes(".") === false) {
      // Check if it resolves to a non-md file
      const resolved = app.metadataCache.getFirstLinkpathDest(link, file.path);
      if (resolved && resolved.extension !== "md") {
        refs.push(link);
      }
    } else if (ext !== "md") {
      refs.push(link);
    }
  }

  return refs;
}

/**
 * Resolve an attachment reference to an actual vault file.
 */
export function resolveAttachment(
  app: App,
  ref: string,
  sourceFile: TFile,
): { file: TFile; mimeType: string } | null {
  // Strip any sizing/alias (e.g. "image.png|400")
  const cleanRef = ref.split("|")[0]!.trim();
  const resolved = app.metadataCache.getFirstLinkpathDest(
    cleanRef,
    sourceFile.path,
  );

  if (!resolved || !(resolved instanceof TFile)) return null;

  return {
    file: resolved,
    mimeType: getMimeType(resolved.path),
  };
}
