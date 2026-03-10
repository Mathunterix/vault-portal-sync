# Best Practices CLAUDE.md

Condense depuis 15+ projets open source, doc officielle Anthropic, et retours de tests reels.

## Regle d'or

- **Taille** : < 300 lignes max, ideal 60-100 lignes (flexible selon complexite projet)
- **Instructions** : budget ~100-150 (system prompt Claude Code = ~50 deja)
- **Chaque instruction ajoutee degrade uniformement le suivi de TOUTES les instructions**

> "Context is precious. Every line in your CLAUDE.md competes for attention with the actual work."

## Ce qui DOIT rester

| Contenu | Pourquoi | Taille visee |
|---------|----------|--------------|
| Description du projet (WHY) | Chaque session doit comprendre le produit | 3-5 lignes |
| Stack avec versions | Evite APIs deprecees | 1-2 lignes |
| Commandes essentielles | Build, test, deploy | 5-10 lignes |
| Regles critiques (NEVER) | Stopper les mauvaises suggestions | 3-7 lignes |
| Fichiers patterns cles | References constantes pendant l'implementation | 5-10 lignes |
| Conventions de naming cross-layers | DB/actions/UI + ou se font les transformations | 3-5 lignes |
| Index des rules existantes | Chaque session sait qu'elles existent | 5-15 lignes |
| Pointeurs vers docs | Progressive disclosure | 3-5 lignes |

## Ce qui DOIT rester (mais est souvent supprime a tort)

**Piege #1 : Credentials et connexions**
Les credentials DB, commandes de connexion, et commandes avec vrais arguments (pas `$DATABASE_URL`) sont utilises a chaque session de debug/migration. Les garder dans CLAUDE.md ou dans une rule chargee automatiquement.

**Piege #2 : Description du projet**
"Pointer vers context.md" ne suffit PAS. Le WHY doit etre dans CLAUDE.md : ce que fait le produit, pour qui, le mecanisme principal. Sans ca, Claude travaille a l'aveugle.

**Piege #3 : Fichiers patterns cles**
Les fichiers qu'on reference 10x par jour (safe-actions, helpers, types) doivent etre dans CLAUDE.md. C'est du routing, pas de la doc.

**Piege #4 : Dette technique connue**
Les warnings actifs ("codebase sur-utilise SERVICE_KEY, a nettoyer progressivement") evitent des erreurs recurrentes. Les garder dans CLAUDE.md ou une rule toujours chargee.

**Piege #5 : Contexte metier qui conditionne le code**
"DB partagee → tout prefixer vetcompass_*" n'est pas de la doc, c'est une contrainte architecturale qui evite des bugs.

## Ce qui doit PARTIR

| Contenu | Pourquoi c'est mauvais | Ou le mettre |
|---------|------------------------|--------------|
| Exemples de code longs (> 5 lignes) | Tokens gaspilles, obsolescence | File references |
| Style detaille (indent, quotes) | Linter fait mieux | Deleguer a ESLint/Prettier |
| Instructions task-specific | Pertinent 5% du temps | `docs/` |
| Hotfixes contextuels | Pertinent 2% du temps | `.claude/rules/` path-scoped |
| Informations evidentes | Claude sait deja | Supprimer |
| Documentation exhaustive | CLAUDE.md = quickstart | `docs/` |
| References a des outils supprimes | Bruit | Supprimer |
| Paths vers des rules/fichiers inexistants | Confusant | Supprimer |
| Code duplique (meme bloc 2x) | Gaspillage | Garder 1 seule version |

## Regle critique : toujours referencer les rules

Quand du contenu est deplace vers `.claude/rules/`, le CLAUDE.md DOIT lister chaque rule avec une description d'une ligne. Sans ca, les nouvelles sessions ne savent pas que la rule existe.

```markdown
# Bon
regles detaillees : `.claude/rules/`
- `supabase-patterns.md` - keys, connexion DB, types gen, migrations
- `anti-patterns.md` - CSP, dynamic props, interdits
- `code-quality.md` - long-term thinking, commit checklist

# Mauvais
regles detaillees : voir `.claude/rules/`
```

## Techniques d'optimisation

### File references > code copy

```markdown
# Mauvais (50 lignes de code)
## Auth Pattern
[copie de code...]

# Bon (1 ligne)
## Auth Pattern
See `src/lib/auth.ts:15-45` for the standard auth flow.
```

### Progressive disclosure (3 niveaux)

```
Niveau 1 : CLAUDE.md → pointeurs (~50 tokens)
Niveau 2 : docs/guide.md → instructions (~200 tokens)
Niveau 3 : docs/reference.md → details (~1000 tokens)
```

### "Never do this" > "Always do this"

La liste des interdits est plus precieuse que les consignes positives. Plus actionnable et specifique.

### Instructions specifiques et actionnables

```markdown
# Mauvais (vague)
- Handle errors properly

# Bon (specifique)
- Wrap async operations in try-catch, log errors with context
```

## Checklist de review post-refactoring

- [ ] 60-100 lignes (depasser si justifie)
- [ ] Description du projet presente (WHY en 3-5 lignes)
- [ ] Pas d'exemples de code > 5 lignes
- [ ] Pas de regles de style → linter
- [ ] Chaque instruction est universelle (>80% du temps) OU est une contrainte critique
- [ ] Fichiers patterns cles listes (si le projet en a)
- [ ] Chaque rule creee/enrichie est listee avec description
- [ ] Credentials/connexions frequentes preserves (CLAUDE.md ou rule auto-chargee)
- [ ] Conventions naming cross-layers presentes
- [ ] Pas de references a des outils/paths qui n'existent plus
- [ ] Demander a l'utilisateur "tu vois des trucs qu'on utilise souvent et que j'aurais oublie ?"
