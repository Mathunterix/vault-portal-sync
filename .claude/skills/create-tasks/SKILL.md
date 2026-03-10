---
name: create-tasks
description: Generate actionable tasks from the current feature plan. Use after /plan to break down a plan.md into atomic, ordered tasks in tasks.md.
disable-model-invocation: true
allowed-tools: Read, Write, Glob
argument-hint: "[feature-name]"
---

# Create Tasks

Genere une liste de taches actionnables a partir du plan existant.

## Etape 1 : Trouver le plan

Si un argument est fourni, cherche dans `changes/[arg]/plan.md`.
Sinon, cherche le dernier dossier modifie dans `changes/`.

Si aucun plan n'existe, demande d'utiliser `/plan` d'abord.

## Etape 2 : Analyser le plan

Lis `plan.md` et extrait :
- Etapes d'implementation
- Fichiers a creer/modifier
- Dependances entre taches
- Risques identifies

## Etape 3 : Decouper en taches

Taches qui sont :
- **Atomiques** : une tache = une action claire
- **Actionnables** : on sait exactement quoi faire
- **Ordonnees** : dependances respectees
- **Testables** : on peut verifier si c'est fait

**Taille ideale** : 15-60 minutes par tache.

## Etape 4 : Creer tasks.md

Cree `changes/[feature-name]/tasks.md` :

```markdown
# Tasks: [Feature Name]

> Genere depuis plan.md le [date]
> Total: [N] taches

## Phase 1: [Nom]

- [ ] **T1**: [Description courte]
  - Fichiers: `path/to/file.ts`
  - Action: [creer|modifier|supprimer]
  - Details: [ce qu'il faut faire]

- [ ] **T2**: [Description courte]
  - Fichiers: `path/to/file.ts`
  - Depends: T1

## Phase 2: [Nom]

- [ ] **T3**: [Description courte]
  - Fichiers: `path/to/file.ts`, `path/to/other.ts`
  - Depends: T1, T2

## Phase 3: Tests & Validation

- [ ] **T[N]**: Valider les criteres de succes
  - Ref: plan.md > Criteres de succes

---

## Progression

| Phase | Taches | Done |
|-------|--------|------|
| Phase 1 | X | 0 |
| Phase 2 | Y | 0 |
| **Total** | **N** | **0** |

---
*`/implement` pour executer les taches une par une*
```

## Etape 5 : Confirmer

```
## Taches creees

**Feature** : [feature-name]
**Total** : [N] taches en [X] phases

---
Pret a implementer avec `/implement`.
```

## Regles

- Chaque tache completable en moins d'1h
- Si trop grosse, la decouper
- Toujours inclure une phase de tests
- Dependances explicites
