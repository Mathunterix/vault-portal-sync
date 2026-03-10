---
description: Start a new work session - loads context and shows project state
---

# Session Start

Tu demarres une nouvelle session de travail. Charge le contexte du projet.

## Etape 1: Charger le contexte

Lis ces fichiers dans `docs/memory-bank/` :
- `context.md` : projet, focus, features en cours, historique
- `structure.md` : structure du projet (dossiers, fichiers cles)
- `tech-stack.md` : stack technique (versions, scripts, env vars)

## Etape 2: Lister le travail en cours (LEGER)

**IMPORTANT** : Ne lis PAS le contenu des fichiers dans `changes/`. Liste seulement ce qui existe.

1. **Plan global** : `changes/implementation-plan.md` existe ? (oui/non)

2. **Features** : liste les dossiers `changes/[##-feature]/` (juste les noms)
   - Pour chaque dossier, note seulement quels fichiers existent (plan.md, tasks.md, etc.)
   - NE LIS PAS le contenu - juste la presence des fichiers

## Etape 3: Logs recents

Regarde `docs/logs/` pour les logs recents (derniers 2-3 jours max).

## Etape 4: Resume

Affiche :

```
## Session Start

**Projet** : [nom]
**Stack** : [stack]

### Focus actuel
[extrait de context.md]

### Travail en cours
[Si plan global]
- `implementation-plan.md` existe

[Si features]
- `01-feature-name/` (plan.md, tasks.md)
- `02-autre-feature/` (plan.md)

[Si rien]
Aucun travail en cours.

### Logs recents
[2-3 derniers logs si existent]

---
Pret.

[Si travail en cours]
Quelle feature veux-tu continuer ?
1. `01-feature-name`
2. `02-autre-feature`

[Si rien]
`/pick-feature` ou `/plan` pour commencer.
```

## Etape 5: Mettre a jour context.md

Si des infos sont obsoletes dans context.md (features terminees, dates anciennes, etc.), propose de les mettre a jour.
