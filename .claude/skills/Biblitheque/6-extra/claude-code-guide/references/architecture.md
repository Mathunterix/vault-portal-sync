# Architecture Claude Code

> Derniere mise a jour : 4 fevrier 2026
> Sources : claude-code-architecture-deep-dive.md, docs officielles, Decoding Claude Code

## Hierarchie de memoire

Claude Code charge le contexte dans cet ordre (precedence : haut > bas) :

| Niveau | Fichier | Quand | Partage |
|--------|---------|-------|---------|
| Enterprise | Voir paths OS ci-dessous | Toujours | Organisation |
| Project | `./CLAUDE.md` ou `./.claude/CLAUDE.md` | Toujours | Equipe (git) |
| Rules | `.claude/rules/*.md` | Toujours* | Equipe (git) |
| User | `~/.claude/CLAUDE.md` | Toujours | Personnel |
| Local | `./CLAUDE.local.md` | Toujours | Personnel (.gitignore auto) |

*Rules : **toutes chargees au demarrage**, meme avec path-scoping. Le path-scoping affecte la pertinence, pas le chargement.

### Enterprise config paths (par OS)

| OS | Path |
|----|------|
| macOS | `/Library/Application Support/ClaudeCode/CLAUDE.md` |
| Linux | `/etc/claude-code/CLAUDE.md` |
| Windows | `C:\Program Files\ClaudeCode\CLAUDE.md` |

### Lookup recursif

- Claude Code remonte de `cwd` jusqu'a la racine, lit tous les CLAUDE.md trouves
- Decouvre aussi les CLAUDE.md dans les **sous-dossiers** (charges a la demande)
- Ex: si vous lancez Claude dans `foo/bar/`, il charge `foo/CLAUDE.md` ET `foo/bar/CLAUDE.md`
- Les sous-dossiers ont un CLAUDE.md ? Charge quand Claude y travaille (monorepos)

### Imports @ dans CLAUDE.md

```markdown
@README.md
@docs/git-workflow.md
@~/.claude/my-preferences.md
```

- Max **5 niveaux** de recursion
- Chemins relatifs et absolus supportes
- **PAS evalue** dans les code blocks (texte markdown uniquement)
- Fichiers manquants → erreur silencieuse
- `/memory` pour voir tous les fichiers charges

### CLAUDE.local.md

- Preferences personnelles par projet (non partage)
- Automatiquement ajoute au `.gitignore`
- Se combine avec CLAUDE.md (additif, pas de remplacement)

## Skills

### Stack technique (4 couches)

```
1. MCP (Model Context Protocol) — Couche fondamentale d'integration d'outils
2. Core Features — Memory, commands, subagents, hooks
3. Plugins — Packages distribuables
4. Agent Skills — Capacites automatiques declenchees par contexte
```

### Decouverte et chargement (3 niveaux)

```
Niveau 1 : Decouverte au demarrage
  → Scanne ~/.claude/skills/ et .claude/skills/ (recursif)
  → Charge UNIQUEMENT les metadonnees (name + description) : ~100 tokens/skill

Niveau 2 : Matching semantique
  → Compare la description du skill avec le prompt utilisateur
  → Si match > seuil → charge le SKILL.md complet (< 5k tokens)

Niveau 3 : References a la demande
  → Les fichiers dans references/ ne chargent QUE si Claude decide d'y acceder
  → Scripts dans scripts/ sont executes sans charger dans le contexte
```

### Hot-reload

Les skills se rechargent automatiquement quand les fichiers changent sur le disque. Pas de restart necessaire.

### Fusion commands → skills

Les `.claude/commands/` sont maintenant fusionnes dans les skills. Meme nom → le skill a priorite. Les commands existantes continuent de fonctionner.

## Rules (.claude/rules/)

### Format

```yaml
---
paths:                    # Optionnel : path-scoping
  - "src/app/api/**/*.ts"
  - "src/lib/db/**/*.ts"
---

# Contenu markdown des regles
```

### Comportement reel

- **Sans path-scope** : charge toujours, priorite haute
- **Avec path-scope** : charge toujours aussi (Issue #16299), mais marque comme pertinente quand les paths matchent
- Les rules sont **additives** : elles ne se remplacent pas
- Garder les rules concises (toutes coutent du contexte)

## MCP (Model Context Protocol)

### Types

| Type | Config | Scope |
|------|--------|-------|
| Project MCP | `.claude/settings.json` | Partage equipe |
| User MCP | `~/.claude/settings.json` | Personnel |

### Cout

Chaque serveur MCP ajoute **~8k+ tokens** au contexte (description des outils). Minimiser le nombre de MCP actifs.

### Skills vs MCP

| Critere | Skills | MCP |
|---------|--------|-----|
| Usage | Logique metier, workflows, expertise | Operations CRUD, APIs, services externes |
| Charge initiale | ~100 tokens (metadata) | ~100-300 tokens/outil (toujours charge) |
| Charge activation | +2-5k tokens | ~200 tokens/appel |
| Meilleur pour | Business logic, decisions contextuelles | Integrations, donnees temps reel |

**Pattern hybride** (optimal) : Skills gerent la logique et l'orchestration, MCPs executent les appels API.

### Integration avec subagents

- **Foreground** : les MCP project-scoped sont accessibles
- **Background** (`run_in_background: true`) : les MCP ne sont **PAS** accessibles

## Hooks

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [{ "matcher": "Write", "command": "..." }],
    "PostToolUse": [{ "matcher": "Write", "hooks": [{ "type": "command", "command": "biome check --write $FILE" }] }],
    "Notification": [{ "hooks": [{ "type": "command", "command": "terminal-notifier -message '$EVENT'" }] }]
  }
}
```

### Deux types de hooks

| Type | Execution | Quand utiliser |
|------|-----------|----------------|
| **Command hooks** | Script shell (rapide, deterministe) | Auto-format, lint, validation |
| **Prompt hooks** | LLM decide (flexible, contextuel) | Evaluation semantique, decisions complexes |

## Subagents (Task tool)

Lance des agents specialises avec contexte isole.

| Type | Usage | Outils |
|------|-------|--------|
| `Explore` | Recherche codebase | Read, Glob, Grep |
| `Plan` | Architecture | Read, Glob, Grep |
| `Bash` | Execution commandes | Bash |
| `general-purpose` | Multi-outils | Tous |
| `deep-search` | Recherche web approfondie | Tous |

### Agents custom (.claude/agents/)

Format identique a un SKILL.md mais dans `.claude/agents/`. Utilises via le Task tool avec `subagent_type`.

```yaml
---
name: security-auditor
description: Analyze code for security vulnerabilities
tools: Read, Grep, Bash
disallowedTools: Write, Edit
model: sonnet
permissionMode: default
skills:
  - api-conventions
  - error-handling-patterns
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./validate.sh"
---

You are a security-focused code auditor.
[Instructions specialisees...]
```

| Champ | Description |
|-------|-------------|
| `tools` | Outils autorises (herite tous si omis) |
| `disallowedTools` | Outils interdits |
| `model` | `sonnet`, `opus`, `haiku`, `inherit` |
| `permissionMode` | `default`, `acceptEdits`, `plan`, `bypassPermissions` |
| `skills` | Skills precharges (contenu complet injecte au demarrage) |
| `hooks` | Hooks scopes au lifecycle de l'agent |

### Portee des agents custom

| Emplacement | Portee | Priorite |
|-------------|--------|----------|
| `--agents` CLI flag | Session courante | 1 (haute) |
| `.claude/agents/` | Projet | 2 |
| `~/.claude/agents/` | Tous vos projets | 3 |
| Plugin `agents/` | Ou le plugin est active | 4 (basse) |

### Limitations subagents

- **Les subagents ne peuvent PAS spawner d'autres subagents**
- **Background** : pas de MCP tools, pas de `AskUserQuestion`, auto-deny permissions manquantes
- **Foreground** : permission prompts passes a l'utilisateur

## Agent Teams (experimental)

> Necessite `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` dans settings.json ou env.
> Source : https://code.claude.com/docs/en/agent-teams

Coordination de plusieurs instances Claude Code travaillant ensemble. Different des subagents : les teammates communiquent entre eux.

### Architecture

| Composant | Role |
|-----------|------|
| **Team lead** | Session principale, cree l'equipe, coordonne |
| **Teammates** | Instances separees, travaillent sur les taches assignees |
| **Task list** | Liste partagee (pending → in_progress → completed) |
| **Mailbox** | Communication inter-agents |

Stockage local :
- Team config : `~/.claude/teams/{team-name}/config.json`
- Task list : `~/.claude/tasks/{team-name}/`

### Subagents vs Agent Teams

| Critere | Subagents | Agent Teams |
|---------|-----------|-------------|
| Contexte | Propre fenetre, resultat retourne au caller | Propre fenetre, totalement independant |
| Communication | Report au main uniquement | Teammates communiquent entre eux |
| Coordination | Main gere tout | Task list partagee, self-coordination |
| Interaction user | Via main agent | Directe avec chaque teammate |
| Best for | Taches focalisees, resultat seul compte | Discussion, collaboration, review parallele |
| Cout tokens | Plus bas (resume) | Plus eleve (chaque teammate = instance separee) |

### Modes d'affichage

| Mode | Comment | Terminal |
|------|---------|----------|
| `in-process` (defaut) | Shift+Up/Down pour naviguer | Tous |
| `split-panes` | Chaque teammate = pane | tmux, iTerm2 uniquement |

Config : `"teammateMode": "in-process"` ou `"tmux"` dans settings.json.

### Cas d'usage

- **Research/review parallele** : plusieurs angles simultanement
- **Nouveaux modules** : chaque teammate owns une partie
- **Debug hypotheses** : theories concurrentes, debat entre agents
- **Cross-layer** : frontend + backend + tests separes

### Commandes naturelles

```
Create an agent team with 3 teammates for [task]
Wait for your teammates to finish
Ask the researcher teammate to shut down
Clean up the team
```

### Delegate mode

`Shift+Tab` → le lead ne fait que coordonner, pas d'implementation.

### Plan approval

```
Spawn an architect teammate. Require plan approval before changes.
```
Le teammate reste en plan mode jusqu'a approbation du lead.

### Architecture "max-1-branch"

Claude Code maintient une **liste plate de messages** avec maximum une branche. Les sub-agents retournent des resumes condenses (1,000-2,000 tokens) au contexte principal.

## Prompt structure et tokens

| Composant | Tokens |
|-----------|--------|
| System prompt | ~2,800 |
| Descriptions outils | ~9,400 |
| User prompt (CLAUDE.md) | ~1,000-2,000 |
| Chaque MCP serveur | ~8,000+ |
| Skill (metadata seule) | ~100 |
| Skill (active) | ~2,000-5,000 |
| **Budget utilisable** | ~150,000-175,000 |

**Sections cles du system prompt** : ton/style, proactivite, gestion taches, politique outils, directives execution. Inclut metadata plateforme (date, cwd, OS, commits recents).

**Patterns de prompts** : balises XML (`<system-reminder>`, `<good-example>`), emphase avec IMPORTANT/NEVER/ALWAYS.

**Multi-modeles** : >50% des appels LLM = Haiku (lecture fichiers, web, git) → economies 70-80%.

## Context management

### Compaction

- **Auto-compact** : ~75% de capacite (depuis sept 2025, avant ~95%)
- **Garde 50K tokens libres** pour raisonnement
- **Context editing** (sept 2025) : supprime auto les appels d'outils obsoletes
- **Resultats** : -84% tokens, +39% performance

### Limites de compliance

| Messages dans la session | Compliance instructions |
|-------------------------|------------------------|
| 1-5 | ~95% |
| 6-10 | 20-60% |
| >10 | Degradation significative |

→ Instructions critiques dans CLAUDE.md/rules (toujours recharges), pas dans la conversation.

### Memory tool

Persistance cross-session (depuis sept 2025). Claude peut sauver/recuperer des informations entre sessions.

### /clear vs /compact

| Commande | Effet | Quand utiliser |
|----------|-------|----------------|
| `/clear` | Reset total du contexte | Entre taches distinctes (plus fiable) |
| `/compact` | Resume et reduit | En cours de tache (risque perte info) |
| `/compact [instructions]` | Resume avec focus | Preserver decisions specifiques |

## Context engineering (4 patterns)

| Pattern | Description | Exemple |
|---------|-------------|---------|
| **Write** | Sauver du contexte hors fenetre | tasks.md, logs, plans, HANDOFF.md |
| **Select** | Charger uniquement le pertinent | Progressive disclosure, references/ |
| **Compress** | Resumer pour tenir dans les limites | `/compact`, summarization Haiku |
| **Isolate** | Contextes separes par subagent | Review parallele, research isole |

### Contexte comme ressource finie

> "Every new token depletes the attention budget with diminishing returns."

Le probleme n'est pas la taille de la fenetre — c'est l'**attention**. Plus de contexte = souvent moins bien performer sur le suivi d'instructions.

### Philosophie de design

- **Simplicite architecturale** : boucle principale unique, recherche simple, todolist simple
- **Pas de RAG** : utilise ripgrep, jq, find a la place → evite les modes de defaillance du chunking
- **Liste plate de messages** : max 1 branche (sub-agents), resultats ajoutes comme reponses d'outils
- **Debogabilite** : resiste a la sur-ingenierie
- **Modeles multiples** : Haiku pour les taches simples, Sonnet/Opus pour le raisonnement

### Handoff pattern (sessions longues)

Quand le contexte devient trop gros :
```
1. "Documente ton progres dans HANDOFF.md"
2. /clear
3. "Lis HANDOFF.md et continue"
```

Alternative : `/compact Focus on preserving [sujet important]`
