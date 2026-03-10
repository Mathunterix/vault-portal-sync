---
description: Create a structured plan for the feature we just discussed
argument-hint: [feature-name]
---

# Plan Feature

On vient de discuter d'une feature. Maintenant, structure ce qu'on a dit dans un plan formel.

## Etape 1: Identifier le nom de la feature

Si `$1` est fourni, utilise ce nom.
Sinon, propose un nom en kebab-case basé sur notre discussion (ex: `user-authentication`, `payment-system`).

## Etape 2: Créer le dossier

Crée le dossier `changes/[feature-name]/`

## Etape 3: Créer plan.md

Crée `changes/[feature-name]/plan.md` avec ce contenu basé sur notre discussion :

```markdown
# [Feature Name]

## Références
- PRD : `docs/prd.md` (section pertinente)
- Architecture : `docs/architecture.md` (section pertinente)
- Recherche : `docs/deepsearch/[topic].md` (si applicable)

## Quoi
[Résumé de ce que fait la feature]

## Pourquoi
[Justification du besoin métier]

## Scope
- [x] Inclus : [élément 1]
- [x] Inclus : [élément 2]
- [ ] Hors scope : [élément exclu]

## Approche
[Description de l'approche technique]

## Étapes
1. [ ] [étape 1]
2. [ ] [étape 2]
3. [ ] [étape 3]

## Fichiers
- `path/to/file.ts` : [action]
- `path/to/other.ts` : [action]

## Risques
- [risque potentiel et mitigation]

## Critères de succès
- [ ] [critère 1]
- [ ] [critère 2]
```

## Etape 4: Confirmer

Affiche :

```
## Feature planifiée

**Nom** : [feature-name]
**Fichier** : changes/[feature-name]/plan.md

---
Prêt à créer les tâches avec `/create-tasks`.
```

## Important

- Extrais les infos de notre conversation précédente
- Si des infos manquent, pose des questions AVANT de créer le fichier
- Le plan doit être actionnable (pas vague)
- Remplis les références si des docs existent (PRD, architecture, recherche)
