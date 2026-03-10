---
name: obsidian-search
description: |
  Recherche sémantique dans les notes Obsidian personnelles.
  Utilise le MCP obsidian-rag (API REST vers rag-webapp).

  ACTIVER quand l'utilisateur mentionne:
  - "cherche dans mes notes" / "search my notes"
  - "dans mes notes Obsidian" / "in my Obsidian notes"
  - "retrouve dans mes notes" / "find in my notes"
  - "qu'est-ce que j'ai noté sur..."
  - "pour le projet X" / "dans le dossier X" (filtres RAG)

  NE PAS ACTIVER pour:
  - Documentation externe → utiliser Archon ou Context7
  - Questions générales → web search
  - "cherche de la doc sur..." (pas "mes notes" = pas ce skill)
---

# Obsidian Search - Notes Personnelles

Recherche sémantique dans tes notes Obsidian indexées via rag-webapp.

**IMPORTANT**: Utiliser UNIQUEMENT `mcp__obsidian-rag__*`. PAS Archon (c'est pour la doc externe).

## Available Tools (USE THESE ONLY)

- `mcp__obsidian-rag__rag_search` - Search user's Obsidian notes
- `mcp__obsidian-rag__rag_list_projects` - List projects
- `mcp__obsidian-rag__rag_list_folders` - List indexed folders
- `mcp__obsidian-rag__rag_list_categories` - List categories
- `mcp__obsidian-rag__rag_get_document` - Get full document

## Language Detection

- French queries ("cherche", "trouve", "notes") → respond in French
- English queries → respond in English

## Workflow

### 1. Parse the query

Extract:
- **Keywords**: main search terms (2-5 words)
- **Project filter**: if user says "pour le projet X" or "for project X"
- **Folder filter**: if user says "dans le dossier X" or "in folder X"
- **Category filter**: if user says "catégorie X" or "category X"

### 2. Get filter IDs (if filters mentioned)

If user mentioned a project/folder/category name:
1. Call `mcp__obsidian-rag__rag_list_projects` or `rag_list_folders` or `rag_list_categories`
2. Find the matching ID by name
3. Use that ID in the search

### 3. Execute search

Call `mcp__obsidian-rag__rag_search` with:
```json
{
  "query": "<extracted keywords>",
  "limit": 10,
  "projectId": "<id if project mentioned>",
  "folderIds": ["<ids if folders mentioned>"],
  "categoryIds": ["<ids if categories mentioned>"]
}
```

### 4. Evaluate & refine
- Check relevance
- Try alternative keywords if poor results
- Suggest narrowing/broadening filters

### 4. Present findings

**IMPORTANT**: Always include Obsidian links when available (obsidianUrl field in results).

**English format:**
```
I found relevant information in your knowledge base:

**[document.md] > [Section]** [Open in Obsidian](obsidian://open?vault=...)
[key excerpt or summary]

**[other-doc.md]** [Open in Obsidian](obsidian://open?vault=...)
[additional info]

[Your synthesized answer using these sources]

Click the Obsidian links to open notes directly. Want more details?
```

**French format:**
```
J'ai trouvé des informations dans ta base:

**[document.md] > [Section]** [Ouvrir dans Obsidian](obsidian://open?vault=...)
[extrait ou résumé clé]

**[autre-doc.md]** [Ouvrir dans Obsidian](obsidian://open?vault=...)
[info additionnelle]

[Ta réponse synthétisée]

Clique les liens Obsidian pour ouvrir les notes. Tu veux plus de détails?
```

## Best Practices

- **Be transparent**: "Je cherche dans ta base..." / "Searching your knowledge base..."
- **Cite sources**: Always filepath + section
- **Offer depth**: Propose full document retrieval
- **Suggest commands**: `/rag:search`, `/rag:explore`, `/rag:advanced-search`

## No Results Response

**English:**
"I didn't find [topic] in your knowledge base. Would you like me to search for [alternative terms]? Or use `/rag:explore` to see what's indexed."

**French:**
"Je n'ai pas trouvé [sujet] dans ta base. Tu veux que je cherche [termes alternatifs]? Ou utilise `/rag:explore` pour voir ce qui est indexé."
