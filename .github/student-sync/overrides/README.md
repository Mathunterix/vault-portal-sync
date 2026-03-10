# vibedev

systeme de workflow pour developper avec claude code de maniere structuree et efficace.

---

## philosophie

**structured vibe coding** : equilibre entre flexibilite du vibe coding et rigueur d'une methodologie structuree.

le probleme : sans documentation, apres 2 semaines on oublie tout.

la solution : une **memory-bank** qui persiste le contexte + un **workflow simple** qui documente au fil de l'eau.

### principes

- **minimaliste** : CLAUDE.md court, rules modulaires
- **evolutif** : ameliorable au fur et a mesure
- **automatique** : conventions appliquees par context (path-scoped rules)
- **documente** : memory-bank pour le contexte long terme

---

## structure

```
projet/
├── CLAUDE.md                    # point d'entree (~30 lignes)
├── .claude/
│   ├── rules/                   # conventions de code
│   ├── skills/                  # workflows invocables
│   ├── commands/                # commandes additionnelles
│   ├── scripts/                 # scripts utilitaires
│   └── agents/                  # agents specialises
├── docs/
│   ├── memory-bank/             # documentation long terme
│   │   ├── context.md           # etat actuel du projet
│   │   ├── structure.md         # arborescence
│   │   ├── tech-stack.md        # stack, versions
│   │   ├── decisions/           # ADRs
│   │   ├── references/          # guides issus des sessions
│   │   └── features/            # doc par feature + INDEX.md auto
│   └── logs/                    # logs quotidiens
└── changes/                     # travail en cours (temporaire)
    ├── implementation-plan.md   # plan global
    └── 01-feature/              # feature en cours
```

---

## rules (`.claude/rules/`)

fichiers markdown charges automatiquement par claude code.

| type | emplacement | quand charge |
|------|-------------|--------------|
| **global** | `.claude/rules/*.md` | toujours |
| **path-scoped** | `.claude/rules/stack/*.md` | selon le fichier edite |

### rules globales

| fichier | description |
|---------|-------------|
| `exploration.md` | explorer avant de modifier |
| `documentation.md` | documenter les changements |
| `no-any.md` | pas de type `any` |
| `no-hardcode.md` | pas de valeurs hardcodees |
| `code-quality.md` | DRY, no TODO, lisibilite > perf |
| `persona.md` | comportement dev senior |
| `packages-recommandes.md` | quel package pour quel besoin |
| `self-improvement.md` | quand ameliorer les rules |

### rules path-scoped

activees selon le fichier edite (frontmatter `paths:`).

| fichier | paths | description |
|---------|-------|-------------|
| `stack/typescript.md` | `**/*.ts, **/*.tsx` | conventions typescript |
| `stack/react.md` | `**/*.tsx` | conventions react |
| `stack/nextjs.md` | `app/**, **/api/**` | conventions next.js |
| `stack/prisma-supabase.md` | `**/*.prisma` | prisma + supabase |
| `patterns/server-actions.md` | `**/*.action.ts` | server actions |

### gestion des rules

```bash
# desactiver une rule
mv .claude/rules/no-any.md .claude/rules-disabled/

# ajouter une rule path-scoped
cat > .claude/rules/patterns/ma-rule.md << EOF
---
paths: "**/mon-pattern/**"
---
# ma rule
...
EOF
```

---

## skills (`.claude/skills/`)

workflows specialises invocables via `/nom`.

### quotidiens

| skill | description |
|-------|-------------|
| `/start` | debut de session, charge le contexte |
| `/pick-feature` | extrait features du PRD → plan global numerote |
| `/plan` | planifie une feature unique (sans PRD) |
| `/create-tasks` | cree les taches depuis un plan |
| `/implement` | execute une tache (option `auto` pour enchainer) |
| `/log` | log rapide d'une petite modif |
| `/doc` | documente une feature + propose guide si pertinent |

### apprentissage

| skill | description |
|-------|-------------|
| `/learn [sujet]` | mentor pedagogique (mode socratique) |
| `/learn direct: [question]` | reponse immediate |

---

## agents (`.claude/agents/`)

agents specialises lances via le Task tool.

| agent | usage |
|-------|-------|
| `deep-search` | recherche approfondie web |

---

## memory-bank (`docs/memory-bank/`)

documentation projet pour le contexte long terme.

| fichier/dossier | description |
|-----------------|-------------|
| `context.md` | projet, focus, features en cours |
| `structure.md` | structure du projet |
| `tech-stack.md` | stack technique |
| `features/` | doc par feature avec frontmatter + INDEX.md auto |
| `decisions/` | ADRs (Architecture Decision Records) |
| `references/` | guides issus des sessions |

### frontmatter features

```yaml
---
feature: auth-login
category: auth
status: stable
depends_on: [database-users]
related: [auth-signup]
files: [src/lib/auth.ts]
last_updated: 2026-02-05
---
```

---

## bmad (methode de planning)

bmad est une methode de planning structuree pour les nouveaux projets. elle n'est pas pre-installee mais s'installe en une commande.

### installation

```
/install-bmad
```

installe bmad en francais avec les outputs dans `docs/bmad/`.

### workflow bmad

```
1. /install-bmad (une seule fois)
2. /bmad/bmm/agents/analyst → product-brief
3. /bmad/bmm/agents/architect → architecture
4. /bmad/bmm/agents/pm → prd + stories
5. /pick-feature all → plan global
6. /implement → boucle d'implementation
```

### mise a jour

relancer `/install-bmad` met a jour vers la derniere version.

---

## workflows types

### nouveau projet (avec bmad)

```
1. /install-bmad
2. /bmad/bmm/agents/analyst → /bmad/bmm/agents/architect → /bmad/bmm/agents/pm
3. /pick-feature all → plan global + features numerotees
4. /implement implementation-plan → boucle d'implementation
```

### feature quotidienne

```
1. /start
2. /implement implementation-plan (ou /plan + /implement)
3. /doc
```

### petite modif

```
1. faire la modif
2. /log
```

---

## ci/cd (`.github/workflows/`)

workflows en 3 tiers pour economiser les minutes.

| tier | workflow | trigger | contenu |
|------|----------|---------|---------|
| 1 | `quick-check.yml` | auto (push) | lint + typescript |
| 2 | `tests.yml` | manuel | tests unitaires |
| 3 | `full-suite.yml` | manuel | e2e + securite |

---

## pre-commit hooks

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

config dans package.json :
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --no-warn-ignored", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

---

## installation

```bash
# "Use this template" sur GitHub, puis :
cd mon-projet
pnpm install
# personnaliser CLAUDE.md et rules
```

---

## tips

1. **CLAUDE.md court** : max 50 lignes, le reste dans rules/
2. **une rule = un concept** : facile a activer/desactiver
3. **path-scope quand possible** : evite le contexte inutile
4. **documenter au fil de l'eau** : `/doc` apres chaque feature

---

## ressources

- [claude code docs](https://docs.anthropic.com/en/docs/claude-code)
