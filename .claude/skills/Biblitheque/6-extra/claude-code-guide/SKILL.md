---
name: claude-code-guide
description: Comprehensive living documentation on Claude Code. Covers skills (complete frontmatter reference, arguments, types, context fork, progressive disclosure), rules (path-scoping, patterns), CLAUDE.md (best practices, anti-patterns, imports @, framework WHAT-WHY-HOW), hooks (12 events, command vs prompt, updatedInput, payloads), settings, permissions, MCP, subagents (custom agents, skills preloading), Agent SDK, models/pricing, CLI commands (all slash commands, modes, statusline), troubleshooting, and ecosystem. Two modes - consultation and refresh. Use when stuck on Claude Code configuration, creating/editing skills/rules/agents, optimizing context, or keeping knowledge up-to-date.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Task, WebSearch
argument-hint: "[question or 'refresh']"
---

# Claude Code Guide

Base de connaissance vivante sur Claude Code. 10 fichiers de reference couvrant tout l'ecosysteme.

## References disponibles

### Architecture et fonctionnement

| Fichier | Contenu |
|---------|---------|
| `references/architecture.md` | Hierarchie memoire (enterprise paths par OS), skills (4 couches, 3 niveaux chargement, fusion commands), rules, MCP (skills vs MCP), hooks (command vs prompt), subagents (custom agents, skills:, max-1-branch), prompt structure, context management (4 patterns, handoff), philosophie design |
| `references/agent-sdk.md` | Claude Agent SDK : installation, API query/client, custom tools MCP, hooks programmatiques, sessions |
| `references/models-and-costs.md` | Modeles (IDs, pricing), context windows, rate limits par tier, optimisation tokens |

### Configuration et outils

| Fichier | Contenu |
|---------|---------|
| `references/hooks-and-settings.md` | 12 events hooks, **command vs prompt hooks**, matchers, payloads stdin/stdout, **updatedInput** (v2.0.10+), exit codes, env vars (CLAUDE_ENV_FILE), settings.json, permissions |
| `references/cli-and-workflows.md` | **Toutes les commandes slash** (session, config, diagnostic, modes), raccourcis clavier, modes (headless, plan, acceptEdits, YOLO), **statusline**, worktrees, feedback loops (TDD, visual), tips power user |
| `references/skills-and-rules.md` | **Frontmatter complet** (10 champs), arguments $ARGUMENTS/$N, types Reference/Task, ultrathink, controle invocation, fusion commands→skills, discovery monorepo, restrictions acces (3 methodes), CLAUDE.md best practices (WHAT-WHY-HOW, anti-patterns, imports @, file references), arbre de decision, patterns avances (atomic/orchestrator, chaining, hybride Skills+MCP) |

### Problemes et ecosysteme

| Fichier | Contenu |
|---------|---------|
| `references/known-limitations.md` | Sub-agents+MCP, context:fork, /compact, rate limits, activation skills, **instruction overload**, commands→skills merge, hooks SDK, bugs actifs |
| `references/troubleshooting.md` | Erreurs courantes, /compact, debug MCP/skills, images, installation, performance |
| `references/ecosystem.md` | Marketplaces, cross-platform, outils tiers, documentation, sources internes |
| `references/changelog.md` | Historique des mises a jour des references |

## Deux modes

### Mode consultation (par defaut)

Question sur Claude Code (skills, rules, MCP, hooks, subagents, CLAUDE.md, pricing, errors...).

1. **Chercher dans les references locales** d'abord :
   - Identifier le fichier pertinent selon le sujet (voir tableau ci-dessus)
   - Lire le fichier et extraire la reponse
   - Si besoin, croiser avec d'autres references

2. **Si pas trouve** → deep-search avec l'agent `deep-search` :
   - Chercher sur le web (docs officielles, GitHub issues, communaute)
   - Presenter les resultats a l'utilisateur
   - **Proposer de mettre a jour les references** si nouvelle info trouvee

3. **Appliquer** : repondre a la question avec la meilleure info disponible

### Mode refresh (`/claude-code-guide refresh`)

Mise a jour proactive des references.

1. **Lire les references actuelles** pour savoir ce qu'on a deja
2. **Deep-search cible** sur :
   - Nouvelles features Claude Code (changelog officiel, blog Anthropic)
   - Nouvelles best practices CLAUDE.md/skills/rules
   - Bugs reportes et workarounds (GitHub issues)
   - Nouvelles limitations ou changements de comportement
   - Mises a jour pricing, rate limits, modeles
3. **Comparer** avec les references existantes
4. **Proposer des diffs** precis :
   ```
   ## Mise a jour proposee : [titre]

   **Source** : [url]
   **Date** : [date]
   **Reference a modifier** : [fichier]

   **Ajout/Modification** :
   [contenu exact a ajouter ou modifier]

   [A] Accepter  [R] Refuser
   ```
5. **Si accepte** : appliquer le diff et ajouter une entree dans `references/changelog.md`

## Sources internes supplementaires

En complement des references, des deep searches detaillees existent dans :
- `docs/doc-externe/doc-claude-code/` : articles Ghost de Matthieu (~170KB)
- `docs/deepsearch/claude-code-*.md` : recherches approfondies (~200KB)

Ces fichiers sont la **source brute**. Les references sont le **condense actionnable**.

## Regles

- **Toujours references locales d'abord** : ne pas deep-search si la reponse est dans les references
- **Toujours proposer la mise a jour** : quand on trouve une nouvelle info, proposer de l'ajouter
- **Toujours tracer** : chaque mise a jour dans changelog.md avec date + source
- **Jamais modifier sans approbation** : proposer le diff, attendre validation
- **Preferer les sources officielles** : docs Anthropic > GitHub issues > blog posts > forums
- **Condenser, pas dumper** : les references doivent etre actionnables, pas des copies de docs

## Sources de reference (mode refresh)

- `https://docs.anthropic.com/en/docs/claude-code` - doc officielle
- `https://code.claude.com/docs/en/` - doc Claude Code
- `https://github.com/anthropics/claude-code/issues` - bugs et features
- `https://www.anthropic.com/engineering` - blog engineering Anthropic
- `https://platform.claude.com/docs/en/agent-sdk/overview` - Agent SDK
- GitHub issues avec labels `skills`, `rules`, `mcp`, `hooks`
