# vibedev-V3

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
│   ├── rules-disabled/          # rules desactivees
│   ├── skills/                  # workflows (0-flow/, 6-extra/, 7-learn/)
│   ├── scripts/                 # scripts Python (INDEX generator)
│   └── agents/                  # agents specialises
├── .bmad/                       # methode bmad (planning initial)
├── docs/
│   ├── memory-bank/             # documentation long terme
│   │   ├── context.md           # etat actuel du projet
│   │   ├── structure.md         # arborescence
│   │   ├── tech-stack.md        # stack, versions
│   │   ├── decisions/           # ADRs
│   │   ├── references/          # guides issus des sessions
│   │   └── features/            # doc par feature + INDEX.md auto
│   ├── system-design/           # diagrammes C4/sequences (projets complexes)
│   ├── deepsearch/              # recherches effectuees
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

### quotidiens (`0-flow/`)

| skill | description |
|-------|-------------|
| `/start` | debut de session, charge le contexte |
| `/pick-feature` | extrait features du PRD → plan global numerote |
| `/plan` | planifie une feature unique (sans PRD) |
| `/create-tasks` | cree les taches depuis un plan |
| `/implement` | execute une tache (option `auto` pour enchainer) |
| `/log` | log rapide d'une petite modif |
| `/doc` | documente une feature + propose guide si pertinent |

### maintenance (`6-extra/`)

| skill | description |
|-------|-------------|
| `/suggest-rules` | propose nouvelles rules ou enrichit CLAUDE.md |
| `/update-conventions` | regenere structure.md et tech-stack.md |
| `/refactor-claude-md` | optimise CLAUDE.md |
| `/map-system` | cree docs architecture visuelle (diagrammes C4) |
| `/upgrade-docs` | migre docs legacy vers le nouveau format |

### apprentissage (`7-learn/`)

| skill | description |
|-------|-------------|
| `/learn [sujet]` | mentor pedagogique (mode socratique) |
| `/learn direct: [question]` | reponse immediate |

### projet existant

| skill | description |
|-------|-------------|
| `/init-existing` | initialise vibedev sur un projet existant |

---

## agents (`.claude/agents/`)

agents specialises lances via le Task tool.

| agent | usage |
|-------|-------|
| `deep-search` | recherche approfondie web |
| `explore-codebase` | exploration du code |
| `explore-docs` | documentation d'une lib |
| `fix-build` | corrige les erreurs de build |
| `security-check` | verifie les CVE avant deploy |

```
lance l'agent security-check pour verifier les vulnerabilites avant deploy
```

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

## bmad (`.bmad/`)

methode bmad pour le planning de nouveau projet.

| agent | commande | role |
|-------|----------|------|
| analyst | `/bmad/bmm/agents/analyst` | brainstorm, research, product-brief |
| architect | `/bmad/bmm/agents/architect` | architecture, decisions tech |
| pm | `/bmad/bmm/agents/pm` | prd, epics, stories |

```
1. /bmad/bmm/agents/analyst → product-brief
2. /bmad/bmm/agents/architect → architecture
3. /bmad/bmm/agents/pm → prd + stories
```

config : `.bmad/bmm/config.yaml`

---

## workflows types

### nouveau projet (avec BMAD)

```
1. copier le template
2. /bmad/analyst → /bmad/architect → /bmad/pm
3. /pick-feature all → plan global + features numerotees
4. /implement implementation-plan → boucle d'implementation
5. plan termine → tout documente
```

### projet existant (brownfield)

```
1. copier .claude/, .bmad/, docs/, CLAUDE.md
2. /init-existing → analyse et documente le projet
3. /start → tester le contexte
4. workflow normal : /plan, /implement, /doc
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

## claude auto-fix (`.github/workflows/claude-fix.yml`)

workflow automatique : claude code corrige les bugs directement depuis github.

### declencheurs

| methode | action | exemple |
|---------|--------|---------|
| **label** | ajouter le label `claude-fix` a une issue | issue "Le bouton X ne marche pas" → label `claude-fix` |
| **mention** | ecrire `@claude` dans un commentaire | `@claude fix the failing test` sur une PR |

### securite

**seuls les collaborateurs du repo** (OWNER/COLLABORATOR/MEMBER) peuvent declencher.
un contributeur externe qui commente `@claude` → rien ne se passe. ta cle API est protegee.

double verification :
1. condition `if:` dans le workflow (verifie `author_association`)
2. l'action elle-meme verifie l'acces en ecriture au repo

### ce que claude charge automatiquement

| element | charge ? |
|---------|----------|
| `CLAUDE.md` | oui |
| `.claude/rules/` | oui |
| `.claude/skills/` | non (invoquer via param `prompt` si besoin) |
| `.mcp.json` | non (passer via `claude_args` si besoin) |

### prerequis

1. creer un secret `ANTHROPIC_API_KEY` dans **Settings > Secrets and variables > Actions**
2. cle API depuis https://console.anthropic.com/settings/keys
3. cout : ~$0.20-0.50 par fix (sonnet)

### usage

**corriger un bug :**
1. creer une issue avec la description du bug
2. ajouter le label `claude-fix`
3. claude analyse, cree une branche, code le fix, ouvre une PR
4. tu review et merge

**corriger un test qui echoue sur une PR :**
1. commenter `@claude fix the failing test` sur la PR
2. claude pousse un commit correctif sur la branche

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

## securite pre-deploiement

1. lire `docs/security-check.md`
2. si dernier check > 7 jours ou versions changees :
   ```
   lance l'agent security-check pour verifier les vulnerabilites
   ```

---

## installation

### nouveau projet

```bash
git clone https://github.com/[ton-user]/vibedev-template mon-projet
cd mon-projet
rm -rf .git && git init
# personnaliser CLAUDE.md et rules
```

### projet existant

```bash
cp -r vibedev-template/.claude mon-projet/
cp -r vibedev-template/.bmad mon-projet/
cp -r vibedev-template/docs mon-projet/
cp vibedev-template/CLAUDE.md mon-projet/
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
- [bmad method](https://github.com/bmad-code-org/BMAD-METHOD)
