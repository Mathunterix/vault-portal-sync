import { AbstractInputSuggest, App, TFolder } from "obsidian";

/**
 * Autocomplete input for vault folder paths.
 * Uses AbstractInputSuggest + vault.getAllFolders() (Obsidian >= 1.8).
 */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  constructor(
    app: App,
    private inputEl: HTMLInputElement,
  ) {
    super(app, inputEl);
  }

  getSuggestions(query: string): TFolder[] {
    const folders = this.app.vault
      .getAllFolders()
      .filter((f) => f.path.toLowerCase().includes(query.toLowerCase()));

    // Sort: shorter paths first, then alphabetical
    folders.sort((a, b) => {
      const depthA = a.path.split("/").length;
      const depthB = b.path.split("/").length;
      if (depthA !== depthB) return depthA - depthB;
      return a.path.localeCompare(b.path);
    });

    return folders.slice(0, 20);
  }

  renderSuggestion(folder: TFolder, el: HTMLElement): void {
    el.setText(folder.path + "/");
  }

  selectSuggestion(folder: TFolder): void {
    this.inputEl.value = folder.path + "/";
    this.inputEl.dispatchEvent(new Event("input"));
    this.close();
  }
}
