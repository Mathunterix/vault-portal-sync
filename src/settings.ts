import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import type VaultPortalSync from "./main";
import { FolderSuggest } from "./ui/folder-suggest";
import { TagSuggest } from "./ui/tag-suggest";
import { NoteSuggest } from "./ui/note-suggest";
import { CollabAudience, LocalRule, RuleDirection, RuleType } from "./types";
import type { ScopeBreakdown } from "./sync/scope-resolver";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INCLUDE_TYPES: { value: RuleType; label: string }[] = [
  { value: "INCLUDE_FOLDER", label: "Dossier" },
  { value: "INCLUDE_TAG", label: "Tag" },
  { value: "INCLUDE_LINKED", label: "Lie a" },
];

const EXCLUDE_TYPES: { value: RuleType; label: string }[] = [
  { value: "EXCLUDE_FOLDER", label: "Dossier" },
  { value: "EXCLUDE_TAG", label: "Tag" },
  { value: "EXCLUDE_LINKED", label: "Lie a" },
];

const DIRECTION_OPTIONS: { value: RuleDirection; label: string }[] = [
  { value: "BOTH", label: "Les deux" },
  { value: "OUTGOING", label: "Sortant" },
  { value: "INCOMING", label: "Entrant" },
];

// ---------------------------------------------------------------------------
// Preview Modal
// ---------------------------------------------------------------------------

class ScopePreviewModal extends Modal {
  private breakdown: ScopeBreakdown;
  private audienceName: string;

  constructor(app: App, breakdown: ScopeBreakdown, audienceName: string) {
    super(app);
    this.breakdown = breakdown;
    this.audienceName = audienceName;
  }

  onOpen(): void {
    const { contentEl } = this;
    const { ruleFiles, audienceFmFiles } = this.breakdown;
    contentEl.empty();
    contentEl.addClass("vps-preview-modal");

    const visibleFiles = [...ruleFiles, ...audienceFmFiles].sort((a, b) =>
      a.path.localeCompare(b.path),
    );

    contentEl.createEl("h2", {
      text: `Fichiers partages — ${this.audienceName}`,
    });
    contentEl.createEl("p", {
      text: `${visibleFiles.length} fichier(s) visibles par l'audience.`,
      cls: "vps-muted",
    });

    // Search
    const searchInput = contentEl.createEl("input", {
      type: "text",
      cls: "vps-preview-search",
      placeholder: "Filtrer par nom...",
    });

    const listEl = contentEl.createDiv({ cls: "vps-preview-list" });

    const renderList = (filter: string) => {
      listEl.empty();
      const filtered = filter
        ? visibleFiles.filter((f) =>
            f.path.toLowerCase().includes(filter.toLowerCase()),
          )
        : visibleFiles;

      if (filtered.length === 0) {
        listEl.createEl("div", {
          text: "Aucun fichier correspondant",
          cls: "vps-muted vps-pad",
        });
        return;
      }

      const fmPaths = new Set(audienceFmFiles.map((f) => f.path));

      for (const file of filtered) {
        const row = listEl.createDiv({ cls: "vps-preview-row" });
        const folder = file.path.replace(/[^/]+$/, "");
        const name = file.basename;
        row.createEl("span", { text: name, cls: "vps-preview-name" });
        if (fmPaths.has(file.path)) {
          row.createEl("span", { text: "audience", cls: "vps-preview-tag" });
        }
        row.createEl("span", { text: folder, cls: "vps-preview-path" });
      }
    };

    renderList("");
    searchInput.addEventListener("input", () => renderList(searchInput.value));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

// ---------------------------------------------------------------------------
// Settings Tab
// ---------------------------------------------------------------------------

export class VaultPortalSyncSettingTab extends PluginSettingTab {
  plugin: VaultPortalSync;
  private audiences: CollabAudience[] = [];
  private saveTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private saveIndicators: Map<string, HTMLElement> = new Map();
  private badgeElements: Map<string, HTMLElement> = new Map();
  private forceHydrate = true;
  private editedAudiences = new Set<string>();

  constructor(app: App, plugin: VaultPortalSync) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display(): Promise<void> {
    const { containerEl } = this;
    containerEl.empty();
    this.saveIndicators.clear();
    this.badgeElements.clear();

    // ── Connection ──
    containerEl.createEl("h2", { text: "Connexion" });

    new Setting(containerEl)
      .setName("URL du portail")
      .setDesc("URL fournie par l'administrateur du portail")
      .addText((text) =>
        text
          .setPlaceholder("https://...")
          .setValue(this.plugin.settings.portalUrl)
          .onChange(async (value) => {
            this.plugin.settings.portalUrl = value.replace(/\/+$/, "");
            await this.plugin.saveSettings(true);
          }),
      );

    new Setting(containerEl)
      .setName("Token")
      .setDesc("Token collaborateur (genere par l'admin)")
      .addText((text) => {
        text
          .setPlaceholder("vps_...")
          .setValue(this.plugin.settings.token)
          .onChange(async (value) => {
            this.plugin.settings.token = value.trim();
            await this.plugin.saveSettings(true);
          });
        text.inputEl.type = "password";
      });

    const statusEl = containerEl.createDiv({ cls: "vps-status" });

    new Setting(containerEl).setName("Tester la connexion").addButton((btn) =>
      btn.setButtonText("Tester").onClick(async () => {
        await this.testConnection(statusEl);
      }),
    );

    if (this.plugin.connectionInfo) {
      const info = this.plugin.connectionInfo;
      statusEl.setText(
        `Connecte (${info.vaultSlug}) — ${info.audiences.length} espace(s)`,
      );
      statusEl.addClass("vps-status-ok");
    }

    // ── Audiences ──
    if (this.plugin.connectionInfo) {
      await this.displayAudiences(containerEl);
    }

    // ── Sync settings ──
    containerEl.createEl("h2", { text: "Synchronisation" });

    new Setting(containerEl)
      .setName("Synchronisation automatique")
      .setDesc("Active la sync a la modif et/ou periodique")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings(true);
            this.display(); // re-render to show/hide sub-settings
          }),
      );

    if (this.plugin.settings.enabled) {
      new Setting(containerEl)
        .setName("Sync a la modification")
        .setDesc(
          "Synchronise automatiquement quand un fichier partage est modifie",
        )
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings.syncOnSave)
            .onChange(async (value) => {
              this.plugin.settings.syncOnSave = value;
              await this.plugin.saveSettings(true);
            }),
        );

      new Setting(containerEl)
        .setName("Intervalle de sync (minutes)")
        .setDesc("Sync periodique en arriere-plan (1-120 min)")
        .addText((text) =>
          text
            .setPlaceholder("15")
            .setValue(String(this.plugin.settings.syncIntervalMinutes))
            .onChange(async (value) => {
              const num = parseInt(value, 10);
              if (!isNaN(num) && num >= 1 && num <= 120) {
                this.plugin.settings.syncIntervalMinutes = num;
                await this.plugin.saveSettings(true);
              }
            }),
        );
    }

    const lastSyncText = this.plugin.lastSyncTime
      ? `Dernier sync: ${this.plugin.lastSyncTime.toLocaleTimeString()}`
      : "Jamais synchronise";

    new Setting(containerEl)
      .setName("Synchroniser maintenant")
      .setDesc(lastSyncText)
      .addButton((btn) =>
        btn
          .setButtonText("Sync")
          .setCta()
          .onClick(async () => {
            btn.setDisabled(true);
            btn.setButtonText("Sync en cours...");
            try {
              await this.plugin.runFullSync();
              new Notice("Vault Portal: sync termine");
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              new Notice(`Vault Portal: erreur sync — ${msg}`);
            }
            btn.setDisabled(false);
            btn.setButtonText("Sync");
            this.display();
          }),
      );
  }

  // ── Connection ──

  private async testConnection(statusEl: HTMLElement): Promise<void> {
    if (!this.plugin.settings.portalUrl || !this.plugin.settings.token) {
      new Notice("Vault Portal: configure l'URL et le token d'abord");
      return;
    }
    statusEl.setText("Connexion en cours...");
    statusEl.removeClass("vps-status-ok", "vps-status-error");
    try {
      const info = await this.plugin.api.getMe();
      this.plugin.connectionInfo = info;
      statusEl.setText(
        `Connecte (${info.vaultSlug}) — ${info.audiences.length} espace(s)`,
      );
      statusEl.addClass("vps-status-ok");
      new Notice(`Vault Portal: connecte en tant que ${info.vaultSlug}`);
      this.forceHydrate = true;
      await this.display();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      statusEl.setText(`Erreur: ${msg}`);
      statusEl.addClass("vps-status-error");
      this.plugin.connectionInfo = null;
      new Notice(`Vault Portal: erreur connexion — ${msg}`);
    }
  }

  // ── Audiences ──

  private async displayAudiences(containerEl: HTMLElement): Promise<void> {
    try {
      this.audiences = await this.plugin.api.getAudiences();
    } catch {
      containerEl.createEl("p", {
        text: "Erreur chargement des espaces",
        cls: "vps-error",
      });
      return;
    }

    // ── Context files block (above audiences) ──
    const scopeResolver = this.plugin.getScopeResolver();
    const configs = this.plugin.settings.audienceConfigs ?? [];
    const contextFiles = scopeResolver.resolveContextFiles(
      this.audiences,
      configs,
    );

    if (contextFiles.length > 0) {
      const ctxSection = containerEl.createDiv({ cls: "vps-context-section" });
      ctxSection.createEl("h3", { text: "Fichiers de contexte" });
      ctxSection.createEl("p", {
        text: "Synchronises automatiquement (metadonnees). Utilises par le chatbot, non visibles par les audiences.",
        cls: "vps-muted",
      });
      for (const { file, key } of contextFiles) {
        const row = ctxSection.createDiv({ cls: "vps-context-row" });
        row.createEl("span", { text: file.basename, cls: "vps-context-name" });
        row.createEl("span", { text: key, cls: "vps-preview-tag" });
        row.createEl("span", {
          text: file.path.replace(/[^/]+$/, ""),
          cls: "vps-preview-path",
        });
      }
    }

    // ── Audiences ──
    containerEl.createEl("h2", { text: "Mes espaces" });
    for (const audience of this.audiences) {
      this.displayAudienceSection(containerEl, audience);
    }
    this.forceHydrate = false;
  }

  private displayAudienceSection(
    containerEl: HTMLElement,
    audience: CollabAudience,
  ): void {
    // Get or create local config
    if (!this.plugin.settings.audienceConfigs) {
      this.plugin.settings.audienceConfigs = [];
    }
    let config = this.plugin.settings.audienceConfigs.find(
      (c) => c.audienceId === audience.id,
    );
    if (!config) {
      config = { audienceId: audience.id, folders: [], rules: [] };
      this.plugin.settings.audienceConfigs.push(config);
    }

    // Hydrate local rules from server on first load or explicit refresh.
    // After that, local rules are the source of truth (to preserve empty drafts).
    const hasLocalRules = config.rules && config.rules.length > 0;
    const wasEdited = this.editedAudiences.has(audience.id);
    if ((!hasLocalRules && !wasEdited) || this.forceHydrate) {
      const vaultSlug = this.plugin.connectionInfo?.vaultSlug ?? "";
      config.rules = audience.rules.map((r) => ({
        ruleType: r.ruleType as RuleType,
        value: this.stripVaultSlugPrefix(r.value, r.ruleType, vaultSlug),
        groupId: r.groupId ?? 0,
        direction: r.direction
          ? (r.direction.toUpperCase() as RuleDirection)
          : undefined,
      }));
      config.folders = [];
    }

    if (!config.rules) config.rules = [];
    const rules = config.rules;
    const includeRules = rules.filter((r) => !r.ruleType.startsWith("EXCLUDE"));
    const excludeRules = rules.filter((r) => r.ruleType.startsWith("EXCLUDE"));

    // Group include rules by groupId
    const groups = new Map<number, LocalRule[]>();
    for (const rule of includeRules) {
      const gid = rule.groupId ?? 0;
      if (!groups.has(gid)) groups.set(gid, []);
      groups.get(gid)!.push(rule);
    }
    const sortedGroupIds = [...groups.keys()].sort((a, b) => a - b);

    // Count
    const scopeResolver = this.plugin.getScopeResolver();
    const fileCount = scopeResolver.countInScope(audience, config);

    // ── Section container ──
    const section = containerEl.createDiv({ cls: "vps-audience-section" });
    section.dataset.audienceId = audience.id;

    // ── Header ──
    const header = section.createDiv({ cls: "vps-audience-header" });
    header.createEl("h3", { text: audience.name });
    const saveIndicator = header.createEl("span", {
      cls: "vps-save-indicator",
    });
    this.saveIndicators.set(audience.id, saveIndicator);

    // ── AND/OR explanation ──
    const explanationEl = section.createDiv({ cls: "vps-andor-explanation" });
    explanationEl.createSpan({
      text: "Les regles dans un meme groupe sont combinees en ",
    });
    explanationEl.createSpan({ text: "AND", cls: "vps-badge-and" });
    explanationEl.createSpan({
      text: ". Les groupes entre eux sont combines en ",
    });
    explanationEl.createSpan({ text: "OR", cls: "vps-badge-or" });
    explanationEl.createSpan({ text: "." });

    // ── Inclusion groups ──
    if (sortedGroupIds.length === 0) {
      section.createEl("div", {
        text: "Aucune regle d'inclusion. Ajoutez un groupe pour commencer.",
        cls: "vps-muted vps-pad vps-empty-state",
      });
    } else {
      for (let gi = 0; gi < sortedGroupIds.length; gi++) {
        const groupId = sortedGroupIds[gi]!;
        const groupRules = groups.get(groupId)!;

        // OR separator between groups
        if (gi > 0) {
          const orDiv = section.createDiv({ cls: "vps-or-divider" });
          orDiv.createEl("hr");
          orDiv.createEl("span", { text: "OR", cls: "vps-badge-or" });
          orDiv.createEl("hr");
        }

        // Group container
        const groupEl = section.createDiv({ cls: "vps-group" });

        // Group header
        const groupHeader = groupEl.createDiv({ cls: "vps-group-header" });
        const groupLabel =
          groupRules.length > 1 ? `Groupe ${gi + 1} (AND)` : `Groupe ${gi + 1}`;
        groupHeader.createEl("span", {
          text: groupLabel,
          cls: "vps-group-label",
        });
        const addRuleBtn = groupHeader.createEl("button", {
          text: "+ Regle",
          cls: "vps-add-btn-ghost",
        });
        addRuleBtn.addEventListener("click", async () => {
          rules.push({
            ruleType: "INCLUDE_FOLDER",
            value: "",
            groupId,
            direction: "BOTH",
          });
          await this.plugin.saveSettings();
          this.refreshAudienceSection(audience.id);
        });

        // Rules in this group (with AND badge between rows)
        for (let ri = 0; ri < groupRules.length; ri++) {
          if (ri > 0) {
            const andDiv = groupEl.createDiv({ cls: "vps-and-divider" });
            andDiv.createEl("span", { text: "AND", cls: "vps-badge-and" });
          }
          this.renderRuleRow(
            groupEl,
            groupRules[ri]!,
            rules,
            audience.id,
            INCLUDE_TYPES,
          );
        }
      }
    }

    // ── Add group (OR) button ──
    const addGroupBtn = section.createEl("button", {
      text: "+ Ajouter un groupe (OR)",
      cls: "vps-add-group-btn",
    });
    addGroupBtn.addEventListener("click", async () => {
      const nextGroupId =
        sortedGroupIds.length > 0 ? Math.max(...sortedGroupIds) + 1 : 0;
      rules.push({
        ruleType: "INCLUDE_FOLDER",
        value: "",
        groupId: nextGroupId,
        direction: "BOTH",
      });
      await this.plugin.saveSettings();
      this.refreshAudienceSection(audience.id);
    });

    // ── Separator ──
    section.createEl("hr", { cls: "vps-main-separator" });

    // ── Exclusions ──
    const exHeader = section.createDiv({ cls: "vps-exclusion-header" });
    const exInfo = exHeader.createDiv();
    exInfo.createEl("span", {
      text: "Exclusions",
      cls: "vps-section-title",
    });
    exInfo.createEl("span", {
      text: "Retirent des documents du scope apres les inclusions",
      cls: "vps-section-desc",
    });
    const addExBtn = exHeader.createEl("button", {
      text: "+ Exclusion",
      cls: "vps-add-btn-ghost",
    });
    addExBtn.addEventListener("click", async () => {
      rules.push({
        ruleType: "EXCLUDE_FOLDER",
        value: "",
        groupId: -1,
      });
      await this.plugin.saveSettings();
      this.refreshAudienceSection(audience.id);
    });

    if (excludeRules.length === 0) {
      section.createEl("div", {
        text: "Aucune exclusion",
        cls: "vps-muted vps-pad",
      });
    } else {
      for (const rule of excludeRules) {
        this.renderRuleRow(section, rule, rules, audience.id, EXCLUDE_TYPES);
      }
    }

    // ── Preview button ──
    const previewRow = section.createDiv({ cls: "vps-preview-row-btn" });
    const previewBtn = previewRow.createEl("button", {
      cls: "vps-preview-btn",
    });
    const badgeSpan = previewBtn.createEl("span", {
      text: `${fileCount} fichiers partages`,
    });
    this.badgeElements.set(audience.id, badgeSpan);
    previewBtn.addEventListener("click", () => {
      const breakdown = scopeResolver.listInScopeDetailed(audience, config);
      new ScopePreviewModal(this.app, breakdown, audience.name).open();
    });
  }

  // ── Rule row ──

  private renderRuleRow(
    container: HTMLElement,
    rule: LocalRule,
    allRules: LocalRule[],
    audienceId: string,
    typeOptions: { value: RuleType; label: string }[],
  ): void {
    const row = container.createDiv({ cls: "vps-rule-row" });

    // Type field
    const typeField = row.createDiv({ cls: "vps-field vps-field-type" });
    typeField.createEl("label", { text: "Type", cls: "vps-field-label" });
    const typeSelect = typeField.createEl("select", { cls: "vps-type-select" });
    for (const opt of typeOptions) {
      const optEl = typeSelect.createEl("option", { text: opt.label });
      optEl.value = opt.value;
      if (opt.value === rule.ruleType) optEl.selected = true;
    }

    // Value field
    const valueField = row.createDiv({ cls: "vps-field vps-field-value" });
    valueField.createEl("label", { text: "Valeur", cls: "vps-field-label" });
    const valueInput = valueField.createEl("input", {
      type: "text",
      cls: "vps-value-input",
      value: rule.value,
    });
    this.attachSuggest(valueInput, rule.ruleType);
    this.setPlaceholder(valueInput, rule.ruleType);

    // Direction field (only for LINKED rules)
    let directionSelect: HTMLSelectElement | null = null;
    if (this.isLinkedType(rule.ruleType)) {
      const dirField = row.createDiv({
        cls: "vps-field vps-field-direction",
      });
      dirField.createEl("label", {
        text: "Direction",
        cls: "vps-field-label",
      });
      directionSelect = dirField.createEl("select", {
        cls: "vps-direction-select",
      });
      for (const opt of DIRECTION_OPTIONS) {
        const optEl = directionSelect.createEl("option", {
          text: opt.label,
        });
        optEl.value = opt.value;
        if (opt.value === (rule.direction ?? "BOTH")) optEl.selected = true;
      }
    }

    // Delete button
    const delBtn = row.createEl("button", {
      text: "\u00d7",
      cls: "vps-del-btn",
    });

    // ── Events ──
    typeSelect.addEventListener("change", () => {
      const newType = typeSelect.value as RuleType;
      const wasLinked = this.isLinkedType(rule.ruleType);
      const isLinked = this.isLinkedType(newType);
      rule.ruleType = newType;
      valueInput.value = "";
      rule.value = "";
      this.attachSuggest(valueInput, newType);
      this.setPlaceholder(valueInput, newType);

      // Re-render if linked status changed (need to add/remove direction field)
      if (wasLinked !== isLinked) {
        this.debounceSaveRules(audienceId, allRules);
        this.refreshAudienceSection(audienceId);
        return;
      }
      this.debounceSaveRules(audienceId, allRules);
    });

    valueInput.addEventListener("change", () => {
      rule.value = valueInput.value.trim();
      this.debounceSaveRules(audienceId, allRules);
    });

    valueInput.addEventListener("input", () => {
      rule.value = valueInput.value.trim();
    });

    if (directionSelect) {
      directionSelect.addEventListener("change", () => {
        rule.direction = directionSelect!.value as RuleDirection;
        this.debounceSaveRules(audienceId, allRules);
      });
    }

    delBtn.addEventListener("click", async () => {
      const idx = allRules.indexOf(rule);
      if (idx >= 0) allRules.splice(idx, 1);
      await this.plugin.saveSettings();
      await this.saveRulesToServer(audienceId, allRules);
      this.refreshAudienceSection(audienceId);
    });
  }

  // ── Helpers ──

  private isLinkedType(ruleType: RuleType): boolean {
    return ruleType === "INCLUDE_LINKED" || ruleType === "EXCLUDE_LINKED";
  }

  /**
   * Re-render ONLY the audience section (no network call, no full page re-render).
   * Preserves scroll position.
   */
  private refreshAudienceSection(audienceId: string): void {
    const oldSection = this.containerEl.querySelector(
      `[data-audience-id="${audienceId}"]`,
    );
    if (!oldSection) return;

    const audience = this.audiences.find((a) => a.id === audienceId);
    if (!audience) return;

    // Create a temporary container, render into it, then swap
    const tempContainer = document.createElement("div");
    this.displayAudienceSection(tempContainer, audience);
    const newSection = tempContainer.firstElementChild;
    if (newSection) {
      oldSection.replaceWith(newSection);
    }
  }

  private stripVaultSlugPrefix(
    value: string,
    ruleType: string,
    vaultSlug: string,
  ): string {
    if (
      !vaultSlug ||
      (ruleType !== "INCLUDE_FOLDER" && ruleType !== "EXCLUDE_FOLDER")
    ) {
      return value;
    }
    const prefix = vaultSlug + "/";
    return value.startsWith(prefix) ? value.slice(prefix.length) : value;
  }

  private attachSuggest(input: HTMLInputElement, ruleType: RuleType): void {
    if (ruleType === "INCLUDE_FOLDER" || ruleType === "EXCLUDE_FOLDER") {
      new FolderSuggest(this.app, input);
    } else if (ruleType === "INCLUDE_TAG" || ruleType === "EXCLUDE_TAG") {
      new TagSuggest(this.app, input);
    } else if (ruleType === "INCLUDE_LINKED" || ruleType === "EXCLUDE_LINKED") {
      new NoteSuggest(this.app, input);
    }
  }

  private setPlaceholder(input: HTMLInputElement, ruleType: RuleType): void {
    if (ruleType.includes("FOLDER")) {
      input.placeholder = "Selectionner un dossier...";
    } else if (ruleType.includes("TAG")) {
      input.placeholder = "#tag";
    } else {
      input.placeholder = "Nom de la note...";
    }
  }

  // ── Save with debounce + indicator ──

  private debounceSaveRules(audienceId: string, rules: LocalRule[]): void {
    const existing = this.saveTimers.get(audienceId);
    if (existing) clearTimeout(existing);

    // Show saving indicator
    this.setSaveIndicator(audienceId, "saving");

    const timer = setTimeout(async () => {
      await this.plugin.saveSettings();
      await this.saveRulesToServer(audienceId, rules);
    }, 800);
    this.saveTimers.set(audienceId, timer);
  }

  private async saveRulesToServer(
    audienceId: string,
    rules: LocalRule[],
  ): Promise<void> {
    this.editedAudiences.add(audienceId);
    try {
      const validRules = rules.filter((r) => r.value.trim() !== "");
      await this.plugin.api.saveRules(
        audienceId,
        validRules.map((r) => ({
          ruleType: r.ruleType,
          value: r.value,
          groupId: r.groupId ?? 0,
          direction: r.direction,
        })),
      );
      this.setSaveIndicator(audienceId, "saved");
      this.refreshBadge(audienceId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      new Notice(`Vault Portal: erreur sauvegarde rules — ${msg}`);
      this.setSaveIndicator(audienceId, "error");
    }
  }

  private setSaveIndicator(
    audienceId: string,
    state: "saving" | "saved" | "error",
  ): void {
    const el = this.saveIndicators.get(audienceId);
    if (!el) return;

    el.removeClass("vps-save-saving", "vps-save-saved", "vps-save-error");

    switch (state) {
      case "saving":
        el.setText("Sauvegarde...");
        el.addClass("vps-save-saving");
        break;
      case "saved":
        el.setText("Sauvegarde");
        el.addClass("vps-save-saved");
        // Auto-clear after 3s
        setTimeout(() => {
          if (el.hasClass("vps-save-saved")) {
            el.setText("");
            el.removeClass("vps-save-saved");
          }
        }, 3000);
        break;
      case "error":
        el.setText("Erreur sauvegarde");
        el.addClass("vps-save-error");
        break;
    }
  }

  private refreshBadge(audienceId: string): void {
    const el = this.badgeElements.get(audienceId);
    if (!el) return;
    const audience = this.audiences.find((a) => a.id === audienceId);
    if (!audience) return;
    const config = this.plugin.settings.audienceConfigs?.find(
      (c) => c.audienceId === audienceId,
    );
    const scopeResolver = this.plugin.getScopeResolver();
    const count = scopeResolver.countInScope(audience, config);
    el.setText(`${count} fichiers partages`);
  }
}
