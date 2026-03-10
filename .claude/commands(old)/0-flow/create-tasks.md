---
description: Generate actionable tasks from the current feature plan
argument-hint: [feature-name]
---

# Create Tasks

Tu generes une liste de taches actionnables a partir du plan existant.

## Etape 1: Trouver le plan

Si `$1` est fourni, cherche dans `changes/$1/plan.md`.
Sinon, cherche le dernier dossier modifie dans `changes/`.

Si aucun plan n'existe, demande a l'utilisateur de d'abord utiliser `/plan-feature`.

## Etape 2: Analyser le plan

Lis le fichier `plan.md` et extrait :
- Les etapes d'implementation
- Les fichiers a creer/modifier
- Les dependances entre taches
- Les risques identifies

## Etape 3: Decouper en taches

Cree des taches qui sont :
- **Atomiques** : une tache = une action claire
- **Actionnables** : on sait exactement quoi faire
- **Ordonnees** : les dependances sont respectees
- **Testables** : on peut verifier si c'est fait

**Taille ideale** : 15-60 minutes par tache.

## Etape 4: Creer tasks.md

Cree le fichier `changes/[feature-name]/tasks.md` :

```markdown
# Tasks: [Feature Name]

> Genere depuis plan.md le [date]
> Total: [N] taches

## Phase 1: [Nom de la phase]

- [ ] **T1**: [Description courte]
  - Fichiers: `path/to/file.ts`
  - Action: [creer|modifier|supprimer]
  - Details: [ce qu'il faut faire precisement]

- [ ] **T2**: [Description courte]
  - Fichiers: `path/to/file.ts`
  - Action: [creer|modifier|supprimer]
  - Depends: T1

## Phase 2: [Nom de la phase]

- [ ] **T3**: [Description courte]
  - Fichiers: `path/to/file.ts`, `path/to/other.ts`
  - Action: [creer|modifier]
  - Depends: T1, T2

## Phase 3: Tests & Validation

- [ ] **T[N-1]**: Ecrire les tests
  - Fichiers: `path/to/file.test.ts`
  - Action: creer

- [ ] **T[N]**: Valider les criteres de succes
  - Ref: plan.md > Criteres de succes

---

## Progression

| Phase | Taches | Done |
|-------|--------|------|
| Phase 1 | X | 0 |
| Phase 2 | Y | 0 |
| Phase 3 | Z | 0 |
| **Total** | **N** | **0** |

---
*Utilise `/implement` pour executer les taches une par une*
```

## Etape 5: Confirmer

Affiche :

```
## Taches creees

**Feature**: [feature-name]
**Fichier**: changes/[feature-name]/tasks.md
**Total**: [N] taches en [X] phases

### Resume
- Phase 1: [nom] ([X] taches)
- Phase 2: [nom] ([Y] taches)
- Phase 3: [nom] ([Z] taches)

---
Pret a implementer avec `/implement`.
```

## Regles

- Chaque tache doit etre completable en moins d'1h
- Si une tache est trop grosse, la decouper
- Toujours inclure une phase de tests
- Les dependances doivent etre explicites
