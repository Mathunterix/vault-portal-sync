import { AbstractInputSuggest, App, TFile } from "obsidian";

/**
 * Autocomplete input for vault markdown notes.
 * Shows filename + parent folder for disambiguation.
 */
export class NoteSuggest extends AbstractInputSuggest<TFile> {
  constructor(
    app: App,
    private inputEl: HTMLInputElement,
  ) {
    super(app, inputEl);
  }

  getSuggestions(query: string): TFile[] {
    const q = query.toLowerCase();
    const files = this.app.vault.getMarkdownFiles();

    return files
      .filter((f) => {
        const name = f.basename.toLowerCase();
        const path = f.path.toLowerCase();
        return name.includes(q) || path.includes(q);
      })
      .sort((a, b) => a.basename.localeCompare(b.basename))
      .slice(0, 30);
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    const container = el.createDiv({ cls: "vps-note-suggestion" });
    container.createDiv({ text: file.basename, cls: "vps-note-name" });
    const folder = file.path.replace(/\/[^/]+$/, "/");
    if (folder !== file.path) {
      container.createDiv({ text: folder, cls: "vps-note-path" });
    }
  }

  selectSuggestion(file: TFile): void {
    // Store path without .md extension (matches web UI behavior)
    this.inputEl.value = file.path.replace(/\.md$/, "");
    this.inputEl.dispatchEvent(new Event("change"));
    this.close();
  }
}
