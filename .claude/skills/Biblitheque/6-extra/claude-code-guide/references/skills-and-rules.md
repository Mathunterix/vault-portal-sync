# Guide Skills, Rules et CLAUDE.md

> Derniere mise a jour : 4 fevrier 2026
> Sources : doc officielle Claude Code, skills-vibecoding-2026-guide.md, claude-md-best-practices.md, claude-code-skills-comprehensive-guide.md

## Quand utiliser quoi

| Besoin | Outil | Taille | Cout contexte |
|--------|-------|--------|---------------|
| Regle universelle courte (1-3 lignes) | CLAUDE.md | < 100 lignes total | Toujours charge |
| Regle par domaine (5-20 lignes) | `.claude/rules/` | Illimite (path-scoped) | Toujours charge* |
| Expertise + doc lourde | Skill avec `references/` | SKILL.md < 500 lignes | ~100 tokens (metadata) puis a la demande |
| Action manuelle (timing controle) | Skill `disable-model-invocation: true` | Idem | 0 tokens jusqu'a invocation |
| Connexion outil externe | MCP server | ~8k tokens/serveur | Toujours charge |
| Delegation tache longue | Subagent (`.claude/agents/`) | Comme SKILL.md | Contexte isole |

*Path-scoped rules : chargees au demarrage quand meme (Issue #16299), le path-scoping affecte la pertinence.

## Ecrire un bon SKILL.md

### Structure

```yaml
---
name: kebab-case-name
description: >
  Description PRECISE et COMPLETE. C'est elle qui determine
  quand Claude active le skill. Inclure les scenarios d'usage.
disable-model-invocation: true   # Pour les workflows manuels
allowed-tools: Read, Write, Edit # Restreindre si necessaire
---

# Titre

[1 ligne de philosophie/contexte]

[Pointer vers references/ a charger]

## Etape 1 : ...
## Etape 2 : ...

## Regles
- ...
```

### Frontmatter complet (reference)

| Champ | Requis | Type | Description |
|-------|--------|------|-------------|
| `name` | Non | string | Nom d'affichage. Si omis, utilise le nom du dossier. Lowercase, chiffres, hyphens (max 64 chars). |
| `description` | Recommande | string | Ce que fait le skill et quand l'utiliser. Claude l'utilise pour le matching semantique. Si omis, utilise le 1er paragraphe du contenu. |
| `argument-hint` | Non | string | Hint en autocompletion. Ex: `[issue-number]`, `[filename] [format]` |
| `disable-model-invocation` | Non | boolean | `true` = Claude ne peut PAS l'invoquer automatiquement. Invocation manuelle `/name` uniquement. Default: `false` |
| `user-invocable` | Non | boolean | `false` = cache du menu `/`. Pour du knowledge de fond. Default: `true` |
| `allowed-tools` | Non | array | Outils autorises sans demander permission quand le skill est actif. |
| `model` | Non | string | Modele a utiliser : `sonnet`, `opus`, `haiku`, ou model ID complet. |
| `context` | Non | string | `fork` = execute dans un subagent isole. Le skill devient le prompt du subagent. |
| `agent` | Non | string | Type de subagent quand `context: fork` est set. Options: `Explore`, `Plan`, `general-purpose`, ou custom. |
| `hooks` | Non | object | Hooks scopes au lifecycle du skill. Meme format que hooks settings.json. |

### Controle d'invocation

| Configuration | User invoque | Claude invoque | Chargement contexte |
|---------------|-------------|----------------|---------------------|
| (defaut) | Oui | Oui | Description toujours en contexte, contenu charge a l'invocation |
| `disable-model-invocation: true` | Oui | Non | Description PAS en contexte. 0 tokens jusqu'a invocation. |
| `user-invocable: false` | Non | Oui | Description toujours en contexte, contenu charge a l'invocation |

**Note importante** : en session normale, seules les descriptions sont chargees. Mais dans les subagents avec `skills:` precharges, le contenu COMPLET est injecte au demarrage.

### Arguments et substitution de variables

| Variable | Description |
|----------|-------------|
| `$ARGUMENTS` | Tous les arguments passes. Si absent du contenu, ajoute en fin comme `ARGUMENTS: <value>` |
| `$ARGUMENTS[N]` | Argument specifique par index (0-based). Ex: `$ARGUMENTS[0]` = premier argument |
| `$N` | Raccourci pour `$ARGUMENTS[N]`. Ex: `$0`, `$1`, `$2` |
| `${CLAUDE_SESSION_ID}` | ID de la session courante. Utile pour logs, fichiers session-specific |

**Exemple** :
```yaml
---
name: migrate-component
description: Migrate un composant d'un framework a un autre
---

Migre le composant $0 de $1 vers $2.
Preserve tout le comportement et les tests.
```

`/migrate-component SearchBar React Vue` → remplace `$0`=SearchBar, `$1`=React, `$2`=Vue.

### Types de contenu

| Type | Usage | Invocation |
|------|-------|------------|
| **Reference** | Knowledge, conventions, patterns, style guides. S'execute inline dans le contexte conversation. | Auto ou manuelle |
| **Task** | Actions step-by-step (deploy, commit, generation). Souvent `disable-model-invocation: true`. | Manuelle preferee |

### Extended thinking (ultrathink)

Inclure le mot "ultrathink" n'importe ou dans le contenu du skill active le mode extended thinking.

### Bonnes pratiques

- **Description** : la plus precise possible (c'est le matching semantique)
- **SKILL.md < 500 lignes** : le reste dans `references/`
- **Verbe imperatif** dans les instructions (pas "you should")
- **Templates d'output** : montrer le format attendu du resultat
- **Regles en fin de fichier** : contraintes et interdits

### Progressive disclosure (chargement en 3 niveaux)

```
Niveau 1 : Metadata (name + description)     → ~100 tokens/skill (toujours charge)
Niveau 2 : SKILL.md complet                  → ~2-5K tokens (a l'invocation)
Niveau 3 : references/ et fichiers support   → a la demande (illimite)
```

Economie : **70%+ de tokens** vs tout charger.

```
100 skills x 100 tokens = 10K tokens (metadata only)
vs 100 skills x 3K tokens = 300K tokens (tout charger)
```

### Budget de descriptions

- Defaut : 15,000 caracteres pour toutes les descriptions de skills
- 100+ skills installes → certains exclus silencieusement
- **Check** : `/context` → warning about excluded skills
- **Augmenter** : env var `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS`

## Skills : fusion avec commands

Les custom slash commands ont ete **fusionnes** dans les skills :
- `.claude/commands/review.md` et `.claude/skills/review/SKILL.md` creent tous les deux `/review`
- Les fichiers `.claude/commands/` existants continuent de fonctionner
- **Skills recommandes** car supportent : fichiers support, frontmatter, chargement auto

**Priorite** : si un skill et une command partagent le meme nom, le skill gagne.

## Skills : decouverte automatique

### Discovery recurrente (monorepos)

Quand vous travaillez dans `packages/frontend/`, Claude Code cherche aussi dans `packages/frontend/.claude/skills/`. Supporte les monorepos ou chaque package a ses propres skills.

### Emplacements et portee

| Emplacement | Path | Portee | Priorite |
|-------------|------|--------|----------|
| Enterprise | Settings managed | Toute l'organisation | Plus haute |
| Personnel | `~/.claude/skills/<name>/SKILL.md` | Tous vos projets | Haute |
| Projet | `.claude/skills/<name>/SKILL.md` | Ce projet uniquement | Moyenne |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Ou le plugin est active | Plus basse |

**Conflits** : meme nom → priorite haute gagne (enterprise > personnel > projet). Les plugins utilisent un namespace `plugin-name:skill-name`.

## Skills dans subagents (context: fork)

```yaml
---
name: deep-research
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

Le skill devient le prompt du subagent. N'a PAS acces a l'historique de conversation.

**Skills vs Subagents** :

| Approche | System prompt | Tache | Charge aussi |
|----------|---------------|-------|--------------|
| Skill + `context: fork` | Du type d'agent (Explore, Plan...) | Contenu SKILL.md | CLAUDE.md |
| Subagent + `skills:` | Corps markdown du subagent | Message de delegation de Claude | Skills precharges + CLAUDE.md |

**Attention** : `context: fork` bugged (~95% ignore, Issue #17283). Preferer `.claude/agents/`.

### Injection contexte dynamique

`` !`command` `` execute shell **avant** envoi a Claude. L'output remplace le placeholder :

```yaml
---
name: pr-summary
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`

## Your task
Summarize this pull request...
```

C'est du **preprocessing**, pas quelque chose que Claude execute. Claude ne voit que le resultat final.

## Restricting Claude's skill access (3 methodes)

### 1. Desactiver tous les skills

```
# Dans /permissions → deny rules:
Skill
```

### 2. Allow/deny par skill

```
# Allow uniquement certains skills
Skill(commit)
Skill(review-pr *)

# Deny certains skills
Skill(deploy *)
```

Syntaxe : `Skill(name)` exact match, `Skill(name *)` prefix match.

### 3. Cacher individuellement

`disable-model-invocation: true` dans le frontmatter → retire le skill du contexte de Claude.

**Note** : `user-invocable: false` ne controle que la visibilite menu, pas l'acces via Skill tool.

## Ecrire des rules efficaces

### Sans path-scope (toujours active)

```markdown
# no-any

typescript strict = pas de any

## alternatives
| situation | utiliser |
|-----------|----------|
| type inconnu | `unknown` |
| objet quelconque | `Record<string, unknown>` |
```

### Avec path-scope

```yaml
---
paths:
  - "src/app/api/**/*.ts"
  - "src/lib/api/**/*.ts"
---

# API Rules

- Validation input avec Zod
- Error handling avec TRPCError
```

**Attention** : les rules path-scoped sont chargees au demarrage quand meme (Issue #16299). Le path-scoping affecte la pertinence semantique, pas le chargement. Garder les rules concises.

### Patterns glob supportes

| Pattern | Match |
|---------|-------|
| `**/*.ts` | Tous les fichiers TypeScript |
| `src/**/*` | Tout sous `src/` |
| `*.md` | Markdown a la racine |
| `src/**/*.{ts,tsx}` | `.ts` ET `.tsx` |
| `{src,lib}/**/*.ts` | TypeScript dans `src/` OU `lib/` |

## CLAUDE.md : les regles d'or

### Taille et structure

- **< 100 lignes** (ideal 60-80)
- **Framework WHAT-WHY-HOW** :
  1. WHAT : tech stack + structure projet
  2. WHY : objectif, contexte metier
  3. HOW : commandes, conventions, workflow

### Contenu essentiel (a inclure)

| Element | Pourquoi |
|---------|----------|
| Tech stack avec versions | Evite APIs deprecees |
| Commandes frequentes (build, test, lint) | Autonomie de Claude |
| Structure des dossiers cles | Navigation efficace |
| Conventions specifiques au projet | Consistance |
| "Do Not Touch" areas | Protection code legacy |
| Index des rules | Decouverte rapide |

### Anti-patterns (a eviter)

| Anti-pattern | Pourquoi c'est mauvais | Alternative |
|-------------|------------------------|-------------|
| Regles de style detaillees | Le linter fait mieux, moins cher, plus fiable | `pnpm format` (Biome/Prettier) |
| Instructions task-specific | Pertinent 5% du temps, consomme 100% | Progressive disclosure vers `docs/` |
| Exemples de code > 5 lignes | Deviennent obsoletes, coutent des tokens | File references `src/file.ts:15-45` |
| Informations evidentes | Claude comprend les conventions standard | Supprimer |
| Hotfixes accumules | Pertinent 2% du temps chacun | `.claude/rules/` avec path-scoping |
| > 150 instructions | Chaque instruction ajoutee degrade toutes les autres | Compter, reduire, migrer |

**Principe** : "Never send an LLM to do a linter's job"

### Emphasis keywords

Pour ameliorer le suivi :
- **NEVER** > **ALWAYS** (les interdits sont plus efficaces que les consignes)
- **IMPORTANT**, **CRITICAL**, **YOU MUST**
- Format : balises XML, `IMPORTANT:` prefixes

### Imports @ dans CLAUDE.md

```markdown
@README.md
@docs/git-workflow.md
@~/.claude/my-preferences.md
```

**Regles** :
- Max **5 niveaux** de recursion
- Supporte chemins relatifs et absolus
- **PAS evalue** dans les code blocks (seulement texte markdown)
- Fichiers manquants → erreur silencieuse
- `/memory` pour voir tous les fichiers charges

### CLAUDE.local.md

- Preferences personnelles par projet
- Automatiquement ajoute au `.gitignore`
- Combine avec CLAUDE.md (pas de remplacement)

### File references (meilleure pratique)

Au lieu de copier du code dans CLAUDE.md :
```markdown
## Authentication Pattern
See `src/lib/auth.ts:15-45` for the standard auth flow.
```

Claude lira le fichier a jour. Evite le code obsolete.

### Living document

- Iterer regulierement
- `#` en session pour quick update
- Review mensuel : redondances, conflits, instructions obsoletes
- Git pour tracker l'evolution

## Arbre de decision : Skills vs Commands vs MCP vs Agents

```
BESOIN ?
├── Acceder a un service externe (API, DB) → MCP Server
├── Controle QUAND ca se declenche → Skill disable-model-invocation: true
├── Doc volumineuse en lazy loading → Skill avec references/
├── S'applique automatiquement selon contexte → Skill
├── Delegation tache longue/complexe → Subagent (.claude/agents/)
└── Regles courtes universelles → .claude/rules/
```

**3 questions a se poser** :
1. ACTION ou EXPERTISE ? → Action = skill disable, Expertise = skill auto
2. Timing critique ? → Oui = disable-model-invocation
3. Doc volumineuse ? → Oui = skill avec references/

## Patterns avances

### Atomic vs Orchestrator

| Type | Scope | Exemple |
|------|-------|---------|
| **Atomic** | 1 tache specifique | `format-code`, `run-tests` |
| **Orchestrator** | Coordonne plusieurs atomic | `release-pipeline`, `feature-complete` |

### Skill chaining

Output d'un skill = input du suivant :
```
analyze-complexity → refactor-method → gen-unit-test
```

### Skills dans subagents custom

```yaml
# .claude/agents/api-developer.md
---
name: api-developer
skills:
  - api-conventions
  - error-handling-patterns
---
```

Le contenu des skills listes est **precharge** dans le subagent.

### Pattern hybride Skills + MCP

Skills gerent la logique metier et l'orchestration, MCPs executent les appels API.

| Critere | Skills | MCP |
|---------|--------|-----|
| Usage | Logique metier, workflows | Operations structurees (CRUD), APIs |
| Charge initiale | ~100 tokens (metadata) | ~100-300 tokens/outil (toujours charge) |
| Charge activation | +2-5k tokens | ~200 tokens/appel |
| Cas d'usage | Business logic, decisions contextuelles | Integrations externes, donnees temps reel |

## Open standard

Les skills fonctionnent sur : Claude Code, Claude.ai, Cursor, OpenAI Codex CLI, OpenCode.
Le format SKILL.md est le meme partout.

**Exception** : Gemini CLI (v0.23.0) - traite skills comme "tools with documentation" au lieu de "methodologies with structured resources" → skills ecrits pour Claude/Codex ne fonctionnent pas sans modification (Issue #15895).

## Activation automatique : probleme connu

- **20% de succes baseline** (matching semantique non-deterministe)
- **84% avec forced eval hook** (hack communautaire)
- **Solution fiable** : `disable-model-invocation: true` pour les workflows critiques
- Les skills sans disable s'activent quand Claude "pense" qu'ils sont pertinents → imprevisible
