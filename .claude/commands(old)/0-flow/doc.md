---
description: Document a completed feature and update context
argument-hint: [feature-name]
---

# Documentation

Documente une feature et met a jour le contexte projet. Archive uniquement si la feature est terminee.

## Etape 1: Identifier la feature

Si `$1` est fourni, utilise ce nom.
Sinon, regarde `changes/` pour trouver la feature la plus recemment modifiee.

Note: Le nom peut etre avec ou sans numero (ex: `01-user-auth` ou `user-auth`).

## Etape 2: Verifier la completion

Lis `changes/[feature]/tasks.md` et compte les taches :
- Total des taches
- Taches cochees (`[x]`)

**Determine le status** :
- Si toutes les taches sont cochees → `completed` (feature terminee)
- Sinon → `in-progress` (feature en cours)

**Ne pas demander confirmation** - le comportement s'adapte automatiquement.

## Etape 3: Creer/Mettre a jour la doc feature

Dans `docs/memory-bank/features/[feature-name].md` (sans le numero).

**IMPORTANT**: La documentation doit etre EXHAUSTIVE pour qu'on n'ait pas a chercher la prochaine fois. Utilise ce template comme guide, adapte selon la feature:

```markdown
# [Feature Name]

## Status
[completed|in-progress]

## Description
[1-2 phrases sur ce que fait cette feature]

---

## Architecture

[Diagramme ASCII du flow si pertinent]
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Trigger    │ ──► │  Service    │ ──► │  Output     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Tables Database

### [table_name]
[Description de la table]

| colonne | type | description |
|---------|------|-------------|
| id | uuid | PK |
| ... | ... | ... |

[Si JSONB, montrer la structure du payload]

---

## Fichiers cles

### Services / Actions
| fichier | role |
|---------|------|
| `src/lib/...` | ... |

### API Routes
| fichier | role |
|---------|------|
| `app/api/...` | ... |

### UI Components
| fichier | role |
|---------|------|
| `src/components/...` | ... |

---

## Configuration

[Si cron, webhooks, env vars, etc.]

### Env vars
```bash
VAR_NAME=value  # description
```

### Cron / Scheduled tasks
[Comment c'est configure, comment modifier]

---

## Usage

### Cote utilisateur
[Ou aller, comment utiliser]

### Cote admin
[Page admin, configuration]

### API / Curl
```bash
# Exemple de commande
curl -X POST "..." -H "..." -d '...'
```

### Debug SQL
```sql
-- Voir l'etat de X
SELECT ... FROM ... WHERE ...;
```

---

## Notes techniques

### [Point important 1]
[Explication]

### [Point important 2]
[Explication]

---

## Progression
[Si in-progress uniquement]
- Taches: [X/Y] completees
- Reste a faire: [liste des taches non cochees]

---

## Migrations associees

| migration | description |
|-----------|-------------|
| `YYYYMMDD_name.sql` | ... |

---

## Historique

### [DATE]
- [changement 1]
- [changement 2]

---
*cree le [DATE], mis a jour le [DATE]*
```

**Sections obligatoires** (toujours inclure):
- Description
- Fichiers cles
- Usage (avec exemples concrets)
- Notes techniques

**Sections conditionnelles** (inclure si pertinent):
- Architecture (si flow complexe)
- Tables Database (si nouvelles tables ou modifications)
- Configuration (si cron, env vars, etc.)
- Migrations (si migrations SQL)
- Progression (si in-progress)
- Historique (si feature existante mise a jour)

## Etape 4: Mettre a jour context.md

Dans `docs/memory-bank/context.md` :

**Si completed** :
- Retirer la feature de "features en cours" (ou marquer "done")
- Ajouter une ligne dans "historique recent"

**Si in-progress** :
- Mettre a jour la ligne dans "features en cours" avec la progression
- Ne PAS ajouter a "historique recent" (pas encore fini)

Dans tous les cas :
- Mettre a jour "focus actuel" si necessaire
- Mettre a jour la date

## Etape 5: Nettoyer changes/ (si completed uniquement)

**SEULEMENT si status = completed** :

Deplace le dossier `changes/[feature]/` vers `changes/.to-delete/[feature]/`.

```bash
mkdir -p changes/.to-delete
mv changes/[feature]/ changes/.to-delete/
```

**Si status = in-progress** : ne rien deplacer, garder le dossier dans `changes/`.

**Note** : Si on est en mode plan global et qu'il reste des features, ne deplace PAS `implementation-plan.md`.

**Nettoyage manuel** : L'utilisateur peut vider `.to-delete/` quand il veut avec `rm -rf changes/.to-delete/*`.

## Etape 6: Detecter les changements de structure/stack

Analyse ce qui a ete cree/modifie par cette feature :

**Detecter automatiquement** :
- Nouveaux dossiers crees ?
- Nouveaux patterns de fichiers (ex: `*.action.ts`) ?
- Nouvelles dependencies dans package.json ?
- Nouveaux composants reutilisables ?

**Si changements detectes** → lancer `/update-conventions` automatiquement.

**Si aucun changement** → ne rien faire.

Affiche ce qui a ete mis a jour :
```
### Conventions mises a jour
- [x] structure.md : nouveau dossier `services/`
- [x] tech-stack.md : nouvelle dep `date-fns`
```

## Etape 6.5: Proposer des rules ou enrichissements CLAUDE.md

Analyse le code cree/modifie par cette feature pour detecter :

**Patterns a capturer** :
- Pattern utilise 2+ fois dans cette feature ?
- Convention de code non documentee ?
- Decision technique importante ?
- Anti-pattern evite ?

**Si detection** → lance `/suggest-rules [feature]` automatiquement.

Le skill `/suggest-rules` va :
1. Comparer avec les rules existantes dans `.claude/rules/`
2. Proposer une nouvelle rule si pattern generique
3. Proposer un enrichissement CLAUDE.md `[projet specifique]` si convention projet-specifique
4. Ne rien faire si deja couvert

**Note** : Cette etape est automatique mais les propositions necessitent approbation.

## Etape 7: Verifier si plan global termine (si completed)

Si `changes/implementation-plan.md` existe ET status = completed :
1. Met a jour le status de la feature dans le plan
2. Verifie si toutes les features sont "done"
3. Si oui, nettoie `implementation-plan.md` aussi

## Etape 8: Confirmer

**Si completed** :
```
## Feature documentee et archivee

**Feature** : [nom]
**Status** : completed
**Doc** : docs/memory-bank/features/[nom].md
**Archive** : changes/[feature]/ → changes/.to-delete/

### Mises a jour
- [x] context.md
- [x] structure.md (si modifie)
- [x] tech-stack.md (si modifie)
- [x] rules/CLAUDE.md (si suggestions acceptees)

---
[Si plan global] Prochaine feature: 02-dashboard
[Si plan global] `/implement implementation-plan` pour continuer.
[Si derniere feature] Plan d'implementation termine !
```

**Si in-progress** :
```
## Feature documentee (en cours)

**Feature** : [nom]
**Status** : in-progress ([X/Y] taches)
**Doc** : docs/memory-bank/features/[nom].md

Le dossier `changes/[feature]/` reste en place pour continuer le travail.

### Mises a jour
- [x] context.md (progression mise a jour)
- [x] feature doc (snapshot de l'avancement)

---
`/implement [feature]` pour continuer.
`/doc [feature]` pour re-documenter apres avancement.
```

## Regles

- **Archiver UNIQUEMENT si toutes les taches sont cochees**
- Si in-progress, garder `changes/[feature]/` intact
- Toujours mettre a jour context.md (meme si in-progress)
- La doc feature doit refleter l'etat actuel (completed ou in-progress)
- **La doc feature doit etre EXHAUSTIVE** - inclure tout ce qu'on pourrait chercher plus tard:
  - Commandes curl pour tester
  - Queries SQL pour debug
  - Structure des payloads JSONB
  - Configuration cron/env vars
  - Diagrammes d'architecture si flow complexe
- Lancer `/update-conventions` automatiquement si structure/stack change
- Lancer `/suggest-rules` automatiquement pour proposer nouvelles rules/CLAUDE.md
- En mode plan global, mettre a jour implementation-plan.md seulement si completed

**Principe**: Mieux vaut trop de details que pas assez. Une bonne doc evite de devoir relire le code.
