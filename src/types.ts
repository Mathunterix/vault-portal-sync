import { z } from "zod";

// ---------------------------------------------------------------------------
// Plugin Settings
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  portalUrl: z.string().url(),
  token: z.string().min(1),
  enabled: z.boolean().default(true),
  syncOnSave: z.boolean().default(true),
  syncIntervalMinutes: z.number().min(1).max(120).default(15),
});

export type PluginSettings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: PluginSettings = {
  portalUrl: "",
  token: "",
  enabled: true,
  syncOnSave: true,
  syncIntervalMinutes: 15,
};

// ---------------------------------------------------------------------------
// Audience rules config (stored locally per audience)
// ---------------------------------------------------------------------------

export type RuleType =
  | "INCLUDE_FOLDER"
  | "INCLUDE_TAG"
  | "INCLUDE_LINKED"
  | "EXCLUDE_FOLDER"
  | "EXCLUDE_TAG"
  | "EXCLUDE_LINKED";

export type RuleDirection = "OUTGOING" | "INCOMING" | "BOTH";

export interface LocalRule {
  ruleType: RuleType;
  value: string;
  groupId: number;
  direction?: RuleDirection;
}

export interface AudienceFolderConfig {
  audienceId: string;
  folders: string[]; // legacy — kept for backwards compat
  rules?: LocalRule[];
}

// ---------------------------------------------------------------------------
// API response schemas
// ---------------------------------------------------------------------------

export const collabMeSchema = z.object({
  userId: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  vaultSlug: z.string(),
  role: z.enum(["ADMIN", "COLLABORATOR"]),
  audiences: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      docCount: z.number(),
    }),
  ),
});

export type CollabMe = z.output<typeof collabMeSchema>;

const audienceRuleSchema = z.object({
  id: z.string(),
  ruleType: z.enum([
    "INCLUDE_FOLDER",
    "INCLUDE_TAG",
    "INCLUDE_LINKED",
    "EXCLUDE_FOLDER",
    "EXCLUDE_TAG",
    "EXCLUDE_LINKED",
  ]),
  value: z.string(),
  groupId: z.number(),
  direction: z.string().nullable().optional(),
});

export const collabAudienceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  rules: z.array(audienceRuleSchema),
  includeFrontmatter: z.array(z.string()).optional(),
});

export type CollabAudience = z.output<typeof collabAudienceSchema>;

export const checksumEntrySchema = z.object({
  path: z.string(),
  checksum: z.string(),
});

export type ChecksumEntry = z.infer<typeof checksumEntrySchema>;

export const syncResultSchema = z.object({
  created: z.number(),
  updated: z.number(),
  unchanged: z.number(),
  errors: z.array(z.string()).optional(),
});

export type SyncResult = z.infer<typeof syncResultSchema>;

export const cleanupResultSchema = z.object({
  deleted: z.number(),
  paths: z.array(z.string()).optional(),
});

export type CleanupResult = z.infer<typeof cleanupResultSchema>;

// ---------------------------------------------------------------------------
// Sync file payload
// ---------------------------------------------------------------------------

export interface SyncFilePayload {
  path: string;
  content: string;
  checksum: string;
}

// ---------------------------------------------------------------------------
// Attachment payload
// ---------------------------------------------------------------------------

export interface AttachmentPayload {
  path: string;
  data: ArrayBuffer;
  mimeType: string;
}
