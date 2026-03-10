import { AbstractInputSuggest, App } from "obsidian";

/**
 * Autocomplete input for vault tags.
 * Uses metadataCache to list all known tags.
 */
export class TagSuggest extends AbstractInputSuggest<string> {
  constructor(
    app: App,
    private inputEl: HTMLInputElement,
  ) {
    super(app, inputEl);
  }

  getSuggestions(query: string): string[] {
    const allTags = new Set<string>();

    // Collect all tags from the vault metadata cache
    const files = this.app.vault.getMarkdownFiles();
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (cache?.tags) {
        for (const tag of cache.tags) {
          allTags.add(tag.tag);
        }
      }
      // Also check frontmatter tags
      if (cache?.frontmatter?.tags) {
        const fmTags = cache.frontmatter.tags;
        if (Array.isArray(fmTags)) {
          for (const t of fmTags) {
            if (typeof t === "string") {
              allTags.add(t.startsWith("#") ? t : `#${t}`);
            }
          }
        } else if (typeof fmTags === "string") {
          allTags.add(fmTags.startsWith("#") ? fmTags : `#${fmTags}`);
        }
      }
    }

    const q = query.toLowerCase();
    return [...allTags]
      .filter((t) => t.toLowerCase().includes(q))
      .sort()
      .slice(0, 20);
  }

  renderSuggestion(tag: string, el: HTMLElement): void {
    el.setText(tag);
  }

  selectSuggestion(tag: string): void {
    this.inputEl.value = tag;
    this.inputEl.dispatchEvent(new Event("input"));
    this.close();
  }
}
