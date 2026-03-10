# Ecosysteme Claude Code

> Derniere mise a jour : 4 fevrier 2026
> Sources : skills-vibecoding-2026-guide.md, deep searches

## Compatibilite cross-platform (Agent Skills Open Standard)

| Plateforme | Support SKILL.md | Notes |
|-----------|-------------------|-------|
| **Claude Code** | Natif | Implementation de reference |
| **Claude.ai** | Natif | Via interface web |
| **OpenAI Codex CLI** | Natif | Compatible open standard |
| **Cursor** | Natif | Integration complete |
| **OpenCode** | Natif | - |
| **Gemini CLI** | Experimental | v0.23.0, incompatibilites runtime (#15895) |
| **Windsurf** | Non confirme | - |

**Gemini CLI** : traite skills comme "tools with documentation" au lieu de "methodologies with structured resources" → skills ecrits pour Claude/Codex ne fonctionnent pas sans modification.

## Marketplaces

### aitmpl.com (AI Template Marketplace)

- **URL** : https://www.aitmpl.com/
- **Contenu** : ~400 composants (skills, agents, commands, settings, hooks, MCP)
- **Couverture** : 30+ entreprises/plateformes (Stripe, AWS, GitHub...)
- **Installation** : `npx claude-code-templates@latest`
- **Stack Builder** : outil pour construire sa pile sur mesure

### SkillsMP (Agent Skills Marketplace)

- **URL** : https://skillsmp.com/
- **Taille** : 25k-66k+ skills agreges depuis GitHub
- **Compatibilite** : Claude Code, Codex CLI, Cursor, OpenCode
- **Non affilie a Anthropic** : projet communautaire
- **Categories** : Planning, Implementation, Testing, Security, Deployment, Operations

### awesome-claude-code

- **URL** : https://github.com/hesreallyhim/awesome-claude-code
- Liste curated de skills, hooks, commands, ressources

### awesome-claude-skills

- **URL** : https://github.com/travisvn/awesome-claude-skills
- Inclut obra/superpowers core skills library

### Anthropic officiel

- **URL** : https://github.com/anthropics/skills
- Repository officiel de skills reference

## Plugin system (2026)

### Official Marketplace

- Repo : [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- Plugins curates par Anthropic
- Types : slash commands, agents specialises, MCP servers, hooks bundles

### Community Marketplaces

- Auto-discovery quotidienne des repos GitHub avec `.claude-plugin/marketplace.json`
- [claudemarketplaces.com](https://claudemarketplaces.com/)
- Quasi tous open-source et gratuits

## Outils tiers

| Outil | Description | GitHub |
|-------|-------------|--------|
| **workmux** | Worktrees + tmux windows | raine/workmux |
| **dmux** | Agent multiplexer pour worktrees | formkit/dmux |
| **Uzi** | Run multiple AI agents parallel | vibesparking.com/uzi |
| **continuous-claude** | Loop automation (PR auto) | AnandChowdhary/continuous-claude |
| **oh-my-claudecode** | Multi-agent orchestration (5 modes) | Yeachan-Heo/oh-my-claudecode |
| **claude-flow** | Agent orchestration platform | ruvnet/claude-flow |
| **agentapi** | HTTP API pour controler Claude Code | coder/agentapi |

## Documentation et guides

### Officiels

| Ressource | URL |
|-----------|-----|
| Docs Claude Code | https://code.claude.com/docs/en/ |
| Best Practices | https://www.anthropic.com/engineering/claude-code-best-practices |
| Skills docs | https://code.claude.com/docs/en/skills |
| Hooks docs | https://code.claude.com/docs/en/hooks |
| Agent SDK | https://platform.claude.com/docs/en/agent-sdk/overview |
| GitHub Issues | https://github.com/anthropics/claude-code/issues |
| Blog Engineering | https://www.anthropic.com/engineering |

### Communautaires

| Ressource | Description |
|-----------|-------------|
| [ClaudeLog](https://claudelog.com/) | Docs, guides, troubleshooting |
| [32 Claude Code Tips](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to) | Tips complets par YK |
| [How I Use Every Feature](https://blog.sshh.io/p/how-i-use-every-claude-code-feature) | Power user guide |
| [Decoding Claude Code](https://minusx.ai/blog/decoding-claude-code/) | Architecture interne |
| [Progressive Disclosure](https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/) | Pattern PD en detail |
| [Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | 4 patterns Anthropic |

### Articles de reference (projet interne)

Disponibles dans `docs/doc-externe/doc-claude-code/` :

| Fichier | Contenu |
|---------|---------|
| `claude-code-architecture-deep-dive.md` | Architecture complete, Agent SDK, patterns |
| `claude-md-best-practices.md` | Guide complet CLAUDE.md |
| `skills-vibecoding-2026-guide.md` | Skills, MCP, cross-platform |
| `arbre-decisionnel-skills-commands-mcp.md` | Arbre de decision detaille |
| `claude-code-personal-assistant-research.md` | Patterns assistant personnel |

### Deep searches pertinentes

Disponibles dans `docs/deepsearch/` :

| Fichier | Contenu |
|---------|---------|
| `claude-code-hooks-guide.md` | Guide complet hooks (12 events, payloads) |
| `claude-code-cli-advanced-tips.md` | Tips avances, worktrees, headless |
| `claude-code-compact-analysis.md` | Analyse /compact, bugs, workarounds |
| `claude-code-skills-patterns-avances.md` | Orchestration, atomic/orchestrator |
| `claude-code-context-fork-research.md` | context:fork, bugs, workarounds |
| `claude-code-subagent-mcp-custom-issue.md` | Sub-agents + MCP limitations |

## Citations cles

> "Maybe a bigger deal than MCP" - Simon Willison sur les Skills

> "J'anticipe une explosion cambrienne de Skills surpassant l'engouement MCP" - Simon Willison

> "Claude Code choisit la simplicite architecturale a chaque intersection" - Analyse Decoding Claude Code

> "Never send an LLM to do a linter's job" - Best practice CLAUDE.md
