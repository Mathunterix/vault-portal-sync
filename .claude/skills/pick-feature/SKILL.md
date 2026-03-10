---
name: pick-feature
description: Extract features from PRD/architecture and create implementation plans. Transition between BMAD planning and daily execution. Creates changes/implementation-plan.md with numbered features.
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Bash(tree *)
argument-hint: "[feature-name or 'all']"
---

# Pick Feature

Extrait les features des documents BMAD et cree un plan d'implementation global pret pour `/implement`.

Transition entre BMAD et le workflow quotidien.

## Etape 1 : Charger les documents BMAD

Lis tous les documents disponibles :
- `docs/prd.md` (requis)
- `docs/architecture.md` (recommande)
- `docs/project-brief.md` (optionnel)

Si le PRD n'existe pas, demande d'utiliser `/bmad/pm` d'abord.

## Etape 2 : Identifier les features

Analyse le PRD et extrait toutes les features. Pour chaque :
- Nom (kebab-case)
- Description courte
- Dependances
- Complexite (S ~2h / M ~1j / L ~2-3j)

Affiche la liste et propose un ordre base sur les dependances.

## Etape 3 : Confirmer l'ordre

Si argument = "all" → accepter l'ordre propose.
Si argument = un nom → extraire uniquement cette feature.
Sinon, demande confirmation ou modification.

## Etape 4 : Creer le plan global

Cree `changes/implementation-plan.md` :

```markdown
# Plan d'implementation

> Genere depuis PRD le [DATE]

## Features a implementer

| # | Feature | Description | Status | Temps | Deps |
|---|---------|-------------|--------|-------|------|
| 01 | [nom] | [desc] | pending | [temps] | [deps] |

## Progression

- **Feature actuelle** : -
- **Completees** : 0/[N]

---
*`/implement implementation-plan` pour commencer*
```

## Etape 5 : Creer les sous-dossiers

Pour chaque feature, cree `changes/[##-feature]/plan.md` avec quoi/pourquoi/scope/approche/etapes/fichiers/criteres.

## Etape 6 : Initialiser la documentation

1. Initialiser `docs/memory-bank/context.md` avec les infos du projet
2. Lancer `/update-conventions` pour generer structure.md et tech-stack.md
3. Mettre a jour la section `[projet specifique]` dans CLAUDE.md

## Etape 7 : Resume

```
## Plan d'implementation cree

**Features** : [N] features numerotees
**Plan** : changes/implementation-plan.md

---
`/implement implementation-plan` pour commencer.
```

## Regles

- Toujours extraire du PRD, pas inventer
- Numeroter les features (01, 02, 03...)
- Respecter les dependances pour l'ordre
- Un plan.md par feature
- Toujours initialiser la doc (context, structure, tech-stack)
