---
name: implement
description: Implementation loop - executes next task from a feature plan. Supports global plan mode (multiple features in order) and single feature mode. Add "auto" to chain features without pausing.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: "[plan-or-feature] [auto]"
---

# Implementation

Execute les taches d'implementation.

Si tu es bloque ou si l'IA tourne en rond, charge `references/debugging-playbook.md`.
Pour la strategie de tests, charge `references/testing-strategy.md`.

Deux modes :
1. **Plan global** : `/implement implementation-plan` → plusieurs features dans l'ordre
2. **Feature unique** : `/implement user-auth` → une seule feature

**Option auto** : ajouter `auto` pour enchainer sans pause entre features.

## Etape 1 : Identifier le mode

Si argument fourni :
- Si `changes/[arg].md` existe → **mode plan global**
- Si `changes/[arg]/` existe → **mode feature unique**
- Sinon, cherche un match partiel dans `changes/`

Si pas d'argument :
- Si `changes/implementation-plan.md` existe → **mode plan global**
- Sinon, cherche la feature avec un tasks.md en cours

---

## Mode Plan Global

### G1 : Charger le plan global

Lis `changes/implementation-plan.md` et identifie :
- La feature actuelle (status = "en cours")
- Si aucune en cours, prends la premiere "pending"

### G2 : Verifier les taches

Si `changes/[##-feature]/tasks.md` n'existe pas → genere-le avec `/create-tasks`.

### G3 : Executer la prochaine tache

Utilise le mode feature unique (ci-dessous).

### G4 : Verifier si feature terminee

Si toutes les taches cochees :
1. Lance `/doc [##-feature]` automatiquement
2. Met a jour `implementation-plan.md` (status → "done", prochaine → "pending")
3. **Mode auto** : enchaine sur la prochaine feature
4. **Mode manuel** : affiche la progression, attend

### G5 : Progression

```
---
Tache terminee. [X/Y taches] pour [feature]
Progression globale: [A/B features]

[Si feature terminee]
Feature [nom] terminee et documentee !
Prochaine: [nom]

[Si toutes terminees]
Plan d'implementation termine !
```

---

## Mode Feature Unique

### F1 : Charger le contexte

Lis :
- `changes/[feature]/plan.md` : quoi/pourquoi/comment
- `changes/[feature]/tasks.md` : taches et progression

Si tasks.md n'existe pas → `/create-tasks` d'abord.

### F2 : Identifier la prochaine tache

Premiere tache non cochee. Si toutes faites → proposer `/doc [feature]`.

### F3 : Exploration

AVANT de coder :
1. Grep/Read pour comprendre le contexte existant
2. Identifier les fichiers impactes
3. Verifier si des composants similaires existent

### F4 : Implementation

Implementer en suivant :
- Les rules du projet (`.claude/rules/`)
- Les patterns existants dans le code
- Le plan defini

### F5 : Mettre a jour tasks.md

Cocher la tache : `- [x] **TX**: ...`
Mettre a jour le tableau de progression.

### F6 : Logger

Ajouter une ligne dans `docs/logs/YYYY-MM-DD.md` :

```
HH:MM feat [feature] TX: [description courte] | [fichiers modifies]
```

Creer le fichier du jour s'il n'existe pas.

### F7 : Confirmer

```
---
Tache terminee. [X/N taches]

`/implement [feature]` pour la suivante.
`/doc [feature]` quand tout est fait.
```

---

## Regles

- TOUJOURS explorer avant de modifier
- TOUJOURS suivre les patterns existants
- JAMAIS creer de duplicates
- UNE tache a la fois
- TOUJOURS logger apres chaque tache
- En mode plan global, `/doc` est appele automatiquement a la fin de chaque feature
