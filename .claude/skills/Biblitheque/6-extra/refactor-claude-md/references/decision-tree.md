# Arbre de decision : ou placer le contenu

## Principe directeur

**Redistribuer, pas supprimer.** Chaque info deplacee doit atterrir quelque part d'accessible.
Quand tu deplace du contenu vers une rule, **reference cette rule dans CLAUDE.md**.

## 3 questions a se poser

### 1. Est-ce utilise a chaque session (ou presque) ?

| Frequence | Destination |
|-----------|-------------|
| Chaque session | CLAUDE.md (garder) |
| Souvent (>30% des sessions) | CLAUDE.md ou rule auto-chargee |
| Parfois (<30%) | `.claude/rules/` path-scoped |
| Rarement (<5%) | `docs/` |

### 2. C'est de l'info de routing ou de la doc ?

| Type | Destination |
|------|-------------|
| Routing (ou trouver quoi) | CLAUDE.md |
| Contrainte archi (ne pas faire X) | CLAUDE.md ou rules |
| Conventions detaillees | `.claude/rules/` |
| Documentation reference | `docs/` |

### 3. La doc est-elle volumineuse ?

| Volume | Destination |
|--------|-------------|
| 1-3 lignes, universel | CLAUDE.md |
| 5-20 lignes, domaine specifique | `.claude/rules/` |
| 20+ lignes, expertise + exemples | Skill avec `references/` |
| Documentation reference | `docs/` |

## Tableau de decision complet

| Contenu | CLAUDE.md | rules/ | docs/ | Supprimer |
|---------|-----------|--------|-------|-----------|
| Description projet (WHY) | **TOUJOURS** | | | |
| Stack + versions | **TOUJOURS** | | | |
| Commandes essentielles | **TOUJOURS** | | | |
| Regles NEVER (3-7) | **TOUJOURS** | | | |
| Fichiers patterns cles | **TOUJOURS** | | | |
| Conventions naming cross-layers | **TOUJOURS** | | | |
| Index des rules | **TOUJOURS** | | | |
| Credentials/connexions frequentes | X ou rule | | | |
| Dette technique active | X ou rule | | | |
| Contexte metier critique | X | | | |
| Conventions code detaillees | | X | | |
| Regles par domaine (API, DB) | | X (path-scoped) | | |
| Anti-patterns specifiques | | X | | |
| Hotfixes contextuels | | X (path-scoped) | | |
| Documentation features | | | X | |
| Guides utilisation | | | X | |
| Tutoriels, historique | | | X | |
| Regles de style (indent, quotes) | | | | Linter |
| Infos evidentes | | | | Oui |
| Instructions vagues | | | | Oui |
| References a outils supprimes | | | | Oui |
| Paths inexistants | | | | Oui |
| Code duplique | | | | Dedup |

## Exemples de deplacement

### Avant (tout dans CLAUDE.md, 20 lignes)

```markdown
## Code Style
- TypeScript strict, no any
- Use 2 spaces for indentation
- Use single quotes
- Max line length 80
- Trailing commas
- Named exports
- Functional components with hooks
- Every function needs JSDoc
- Use Zod for validation
- Use shadcn/ui components
```

### Apres (distribue, 2 lignes CLAUDE.md + 1 rule)

**CLAUDE.md** :
```markdown
- TypeScript strict, no any. Format with `pnpm format` (Biome)
```

**.claude/rules/code-style.md** :
```markdown
- Named exports over default
- Functional components with hooks
- Use Zod for validation
- Use shadcn/ui components
```

**Supprime** (linter) : indent, quotes, line length, trailing commas

**CLAUDE.md reference** :
```markdown
regles detaillees : `.claude/rules/`
- `code-style.md` - named exports, hooks, Zod, shadcn
```

### Avant (credentials dans CLAUDE.md, 10 lignes)

```markdown
## Database
supabase gen types typescript \
  --db-url "postgresql://postgres:xxx@10.85.26.4:6543/postgres" \
  --schema public > src/types/supabase-generated.ts

PGPASSWORD=xxx psql -h 10.85.26.4 -p 6543 -U claude_readonly -d postgres
```

### Apres : garder ou deplacer vers rule AUTO-CHARGEE

Si ces commandes sont utilisees a chaque session → garder dans CLAUDE.md.
Si parfois → deplacer dans `.claude/rules/supabase-patterns.md` (sans path-scope = toujours charge).
Dans tous les cas, **ne pas supprimer** et **ne pas remplacer par $DATABASE_URL**.
