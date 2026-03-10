---
description: Implementation loop - executes next task from a feature plan
argument-hint: [plan-or-feature] [auto]
---

# Implementation

Execute les taches d'implementation. Supporte deux modes :
1. **Plan global** : `/implement implementation-plan` → gere plusieurs features dans l'ordre
2. **Feature unique** : `/implement user-auth` → une seule feature

**Option auto** : ajouter `auto` pour enchainer automatiquement sans pause entre features.

```
/implement implementation-plan       → pause entre features (demande confirmation)
/implement implementation-plan auto  → enchaine automatiquement toutes les features
```

## Etape 1: Identifier le mode

Si `$1` est fourni :
- Si `changes/$1.md` existe (ex: `implementation-plan.md`) → **mode plan global**
- Si `changes/$1/` existe → **mode feature unique**
- Sinon, cherche dans `changes/` un match partiel

Si `$1` n'est pas fourni :
- Si `changes/implementation-plan.md` existe → **mode plan global**
- Sinon, cherche la feature avec un tasks.md en cours

**Mode auto** : si `$2` == "auto", activer l'enchainement automatique des features.

---

## Mode Plan Global

### G1: Charger le plan global

Lis `changes/implementation-plan.md` et identifie :
- La feature actuelle (status = "en cours")
- Si aucune en cours, prends la premiere "pending"

### G2: Verifier si feature actuelle a des taches

Regarde `changes/[##-feature]/tasks.md` :
- Si tasks.md n'existe pas → genere-le avec `/create-tasks`
- Si tasks.md existe → continue

### G3: Executer la prochaine tache

Utilise le **mode feature unique** (voir ci-dessous) pour executer la tache.

### G4: Verifier si feature terminee

Apres chaque tache, verifie si toutes les taches de la feature sont cochees.

Si feature terminee :
1. Lance `/doc [##-feature]` automatiquement
2. Met a jour `implementation-plan.md` :
   - Status de la feature → "done"
   - Feature actuelle → la prochaine "pending"
   - Completees → incremente
3. **Si mode auto** : enchaine sur la prochaine feature sans pause
4. **Si mode manuel** : affiche la progression et attend

### G5: Afficher la progression globale

**Mode manuel (defaut)** :
```
---
Tache terminee. [X/Y taches] pour 01-user-auth
Progression globale: [A/B features]

[Si feature terminee]
✅ Feature 01-user-auth terminee et documentee !
Prochaine feature: 02-dashboard

`/implement implementation-plan` pour continuer.
`/implement implementation-plan auto` pour enchainer automatiquement.

[Sinon]
`/implement` pour la tache suivante.
```

**Mode auto** :
```
---
Tache terminee. [X/Y taches] pour 01-user-auth
Progression globale: [A/B features]

[Si feature terminee]
✅ Feature 01-user-auth terminee et documentee !
→ Enchainement automatique sur 02-dashboard...
[Continue sans pause]
```

Si toutes les features sont terminees :
```
## Plan d'implementation termine !

Toutes les features ont ete implementees et documentees.

Features completees:
- 01-user-auth → docs/memory-bank/features/user-auth.md
- 02-dashboard → docs/memory-bank/features/dashboard.md
- 03-settings → docs/memory-bank/features/settings.md

Le dossier changes/ a ete nettoye.
Context.md a ete mis a jour.
```

---

## Mode Feature Unique

### F1: Charger le contexte

Lis :
- `changes/[feature]/plan.md` : comprendre le quoi/pourquoi/comment
- `changes/[feature]/tasks.md` : voir les taches et la progression

Si tasks.md n'existe pas, demande de lancer `/create-tasks` d'abord.

### F2: Identifier la prochaine tache

Trouve la premiere tache non cochee dans tasks.md.
Si toutes les taches sont faites, propose `/doc [feature]`.

### F3: Exploration

AVANT de coder :
1. Grep/Read pour comprendre le contexte existant
2. Identifier les fichiers qui seront impactes
3. Verifier si des composants similaires existent deja

### F4: Implementation

Implemente la tache en suivant :
- Les rules du projet (`.claude/rules/`)
- Les patterns existants dans le code
- Le plan defini

### F5: Mettre a jour tasks.md

- Coche la tache terminee : `- [x] **TX**: ...`
- Met a jour le tableau de progression

### F6: Logger automatiquement

Ajoute une ligne au log du jour (`docs/logs/YYYY-MM-DD.md`) :

```
HH:MM feat [feature] TX: [description courte] | [fichiers modifies]
```

Exemple :
```
14:32 feat user-auth T3: add login form validation | auth.ts, login-form.tsx
```

Cree le fichier du jour s'il n'existe pas.

### F7: Confirmer

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
- TOUJOURS logger apres chaque tache (automatique)
- En mode plan global, `/doc` est appele automatiquement a la fin de chaque feature
- Le plan global (`implementation-plan.md`) est la source de verite pour l'ordre
