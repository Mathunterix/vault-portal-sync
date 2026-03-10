---
name: start
description: Start a new work session - loads context and shows project state. Use at the beginning of each coding session to load memory-bank context, see work in progress, and recent logs.
disable-model-invocation: true
allowed-tools: Read, Glob, Bash(ls *)
---

# Session Start

Demarre une nouvelle session de travail. Charge le contexte du projet.

## Etape 1 : Charger le contexte

Lis ces fichiers dans `docs/memory-bank/` :
- `context.md` : projet, focus, features en cours, historique
- `structure.md` : structure du projet (dossiers, fichiers cles)
- `tech-stack.md` : stack technique (versions, scripts, env vars)
- `decisions/INDEX.md` : index des ADRs (si existe, NE PAS lire les ADRs en entier)
- `references/INDEX.md` : index des guides (si existe)
- `features/INDEX.md` : index des features avec graphe (si existe)

## Etape 2 : Lister le travail en cours (LEGER)

**IMPORTANT** : Ne lis PAS le contenu des fichiers dans `changes/`. Liste seulement ce qui existe.

1. **Plan global** : `changes/implementation-plan.md` existe ? (oui/non)
2. **Features** : liste les dossiers `changes/[##-feature]/` (juste les noms)
   - Pour chaque dossier, note quels fichiers existent (plan.md, tasks.md)
   - NE LIS PAS le contenu

## Etape 3 : Logs recents

Regarde `docs/logs/` pour les logs recents (derniers 2-3 jours max).

## Etape 4 : Verifier la documentation avancee

Verifie si ces dossiers existent (ne pas lire le contenu) :
- `docs/system-design/` : documentation architecture (si projet complexe)
- `docs/deepsearch/` : recherches effectuees

## Etape 5 : Resume

```
## Session Start

**Projet** : [nom]
**Stack** : [stack]

### Focus actuel
[extrait de context.md]

### Travail en cours
[liste features ou "aucun"]

### Documentation
- Features : [N] documentees (voir features/INDEX.md)
- Decisions : [N] ADRs (voir decisions/INDEX.md)
- References : [N] guides (voir references/INDEX.md)
[Si system-design existe] - Architecture : docs/system-design/

### Logs recents
[2-3 derniers logs si existent]

---
Pret.
[Si travail en cours] Quelle feature veux-tu continuer ?
[Si rien] `/pick-feature` ou `/plan` pour commencer.
```

## Etape 6 : Mettre a jour context.md

Si des infos sont obsoletes (features terminees, dates anciennes), propose de les mettre a jour.
