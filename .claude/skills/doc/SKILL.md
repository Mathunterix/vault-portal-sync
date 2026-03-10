---
name: doc
description: Document what was done in a session - features, decisions (ADRs), or guides. Detects type automatically and loads appropriate workflow. Use after implementing changes to capture context while fresh.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(tree *), Bash(ls *), Bash(git diff *), Bash(git status), Bash(python *)
argument-hint: "[name] [decision|guide]"
---

# Documentation

Documente ce qui a ete fait dans la session : features, decisions techniques (ADRs), ou guides.

**Philosophie** : Tu as le contexte de la session. Tu sais ce que tu as fait. C'est le meilleur moment pour documenter parce que tout est frais.

## Arguments

| Argument | Effet |
|----------|-------|
| `[name]` | Nom de ce qu'on documente |
| `decision` | Force le type decision (ADR) |
| `guide` | Force le type guide |
| _(aucun)_ | Detecte automatiquement le type |

## Etape 1 : Detecter le type de documentation

Analyse la session et determine ce qu'on documente :

| Signal | Type | Reference a charger |
|--------|------|---------------------|
| Argument `decision` fourni | decision | `references/decision-workflow.md` |
| Argument `guide` fourni | guide | `references/guide-workflow.md` |
| Feature implementee, code modifie | feature | `references/feature-workflow.md` |
| Choix de lib, trade-off, pattern architectural | decision | `references/decision-workflow.md` |
| Deep-search, apprentissage, pattern decouvert | guide | `references/guide-workflow.md` |

**Plusieurs types pertinents ?** Traiter dans l'ordre : feature → decision → guide.

## Etape 2 : Charger et executer le workflow

Charge la reference appropriee et suis le workflow specifique.

Chaque workflow contient :
- Format de nommage
- Frontmatter specifique
- Etapes de creation/enrichissement
- Generation de l'INDEX correspondant

## Etape 3 : Logique commune (apres le workflow specifique)

### 3.1 Mettre a jour context.md

Dans `docs/memory-bank/context.md` :

**Si documentation complete** :
- Mettre a jour "focus actuel" si pertinent
- Ajouter une ligne dans "historique recent"

**Format historique** :
```
- [DATE] : [type] [nom] - [description courte]
```

### 3.2 Proposer /suggest-rules

Analyse le code/contenu de la session pour detecter :
- Pattern utilise 2+ fois ?
- Convention non documentee ?
- Decision technique importante ?

**Si detection** → proposer de lancer `/suggest-rules`.

### 3.3 Proposer mise a jour system-design (si existe)

Verifie si `docs/system-design/` existe.

**Si system-design/ existe ET changements significatifs** :
- Nouveau service/composant ajoute ?
- Flow de donnees modifie ?
- Nouvelle integration externe ?
- Changement d'architecture ?

**Si pertinent, PROPOSER** (ne jamais modifier automatiquement) :
```
### System Design

Cette session modifie potentiellement l'architecture :
- [Description du changement]

Mettre a jour docs/system-design/ ? [y/N]
```

### 3.4 Detecter les changements de structure/stack

Analyse ce qui a ete fait :
- Nouveaux dossiers crees ?
- Nouveaux patterns de fichiers ?
- Nouvelles dependencies ?

**Si changements detectes** → lancer `/update-conventions` automatiquement.

## Etape 4 : Confirmer

```
## Documentation terminee

**Type** : [feature|decision|guide]
**Nom** : [nom]
**Doc** : [chemin vers le fichier]

### Mises a jour
- [x] [type] documente
- [x] INDEX.md regenere
- [x] context.md mis a jour
- [ ] /suggest-rules (si propose)
- [ ] system-design (si propose)

---
[Prochaine action suggeree]
```

## Regles communes

- **Enrichir > Recreer** : si la doc existe, merger les nouvelles infos
- **Session context** : utiliser ce que tu sais de la session
- **Exhaustif** : mieux vaut trop de details que pas assez
- **INDEX.md regenere** a chaque /doc
- Toujours mettre a jour context.md
