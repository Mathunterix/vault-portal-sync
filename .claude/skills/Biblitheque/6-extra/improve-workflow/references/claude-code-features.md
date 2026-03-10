# Features et patterns Claude Code

Condense depuis skills-vibecoding-2026-guide.md, claude-code-architecture-deep-dive.md, et la doc claude-code. A utiliser pour analyser un systeme et proposer des ameliorations.

## Architecture Claude Code

### Hierarchie de memoire

| Niveau | Fichier | Charge | Scope |
|--------|---------|--------|-------|
| Enterprise | `/Library/.../CLAUDE.md` | Toujours | Organisation |
| Project | `./CLAUDE.md` | Toujours | Equipe (git) |
| Rules | `.claude/rules/*.md` | Toujours* | Equipe (git) |
| User | `~/.claude/CLAUDE.md` | Toujours | Personnel |
| Local | `./CLAUDE.local.md` | Toujours | Personnel |

*Rules chargees au demarrage meme avec path-scoping.

### Les 4 outils d'extension

| Outil | Quand | Cout tokens | Activation |
|-------|-------|-------------|------------|
| **Rules** | Regles courtes, universelles ou domaine | Toujours charge | Auto (path-scoped) |
| **Skills** | Expertise + doc lourde | ~100 tokens metadata | Auto ou manual |
| **Commands** | Legacy (migrer vers skills) | Tout charge | Manual (`/name`) |
| **MCP** | Outils externes (APIs, DBs) | 8k+ par serveur | Auto |

### Progressive disclosure (3 niveaux)

```
Niveau 1 : Metadata skills (~100 tokens chacun)
Niveau 2 : SKILL.md charge a la demande (< 5k tokens)
Niveau 3 : references/ charge quand necessaire (illimite)
```

Economie : **70%+ de tokens** vs tout charger.

## Skills : ce qui a change en 2026

### Format SKILL.md

```yaml
---
name: skill-name
description: Description precise pour le matching semantique
disable-model-invocation: true  # Optionnel : invocation manuelle uniquement
allowed-tools: Read, Write, Edit  # Optionnel : restreindre les outils
---
```

### Probleme connu : activation impredictible

- 20% de succes baseline (skill s'active quand il devrait)
- 84% avec "forced eval hook" (hack pour forcer l'evaluation)
- **Solution** : `disable-model-invocation: true` pour les workflows critiques

### Marketplaces

- **SkillsMP** (skillsmp.com) : 25k-66k+ skills communautaires
- **aitmpl.com** : templates enterprise

### Open standard

Skills fonctionnent sur : Claude Code, Cursor, OpenAI Codex CLI, OpenCode.

## Hooks (automatisation)

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Write", "command": "echo 'Writing...'" }],
    "PostToolUse": [{ "matcher": "Write", "command": "biome check --write" }],
    "Notification": [{ "command": "terminal-notifier -message '$EVENT'" }]
  }
}
```

Cas d'usage :
- Auto-format apres chaque ecriture
- Lint avant commit
- Notification quand une tache longue finit
- Validation custom (schema, types)

## Context engineering (4 patterns)

| Pattern | Description | Quand |
|---------|-------------|-------|
| **Write** | Sauvegarder du contexte hors fenetre | Logs, plans, tasks.md |
| **Select** | Charger uniquement ce qui est pertinent | Progressive disclosure |
| **Compress** | Resumer pour tenir dans les limites | Sessions longues |
| **Isolate** | Contextes separes par subagent | Review parallele, recherche |

## Subagents

```
Task tool → lance un agent specialise avec contexte isole
- type "Explore" : recherche codebase
- type "Plan" : architecture
- type "Bash" : execution commandes
- type "general-purpose" : multi-outils
```

Avantage : chaque agent a son propre contexte → pas de pollution.

## Points a verifier lors d'un audit systeme

### CLAUDE.md
- [ ] < 100 lignes (ideal 60-80)
- [ ] Description projet presente (WHY)
- [ ] Stack avec versions
- [ ] Index des rules avec descriptions
- [ ] Pas d'exemples de code > 5 lignes
- [ ] Pas de regles de style (→ linter)

### Rules
- [ ] Une rule = un concept
- [ ] Path-scoped quand domaine-specifique
- [ ] Pas de duplication entre rules
- [ ] Pas de rules obsoletes

### Skills
- [ ] `disable-model-invocation: true` pour les workflows
- [ ] `references/` pour la doc lourde (pas tout dans SKILL.md)
- [ ] Description precise dans le frontmatter
- [ ] Pas de skills avec du scaffolding vide

### Documentation
- [ ] `docs/memory-bank/` a jour
- [ ] Features documentees apres completion
- [ ] Logs de session maintenus
- [ ] structure.md et tech-stack.md regeneres apres changements

### Patterns manquants a proposer
- Hooks de validation (format, lint, types)
- Subagents pour les taches paralleles
- Path-scoped rules pour les domaines specifiques
- Skills pour l'expertise recurrente
- Progressive disclosure (docs → pas dans CLAUDE.md)
