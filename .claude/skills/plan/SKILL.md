---
name: plan
description: Create a structured plan for the feature we just discussed. Use after discussing a feature to formalize it into an actionable plan in changes/[feature-name]/plan.md.
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Grep
argument-hint: "[feature-name]"
---

# Plan Feature

On vient de discuter d'une feature. Structure ce qu'on a dit dans un plan formel.

## Etape 1 : Identifier le nom

Si un argument est fourni, utilise ce nom.
Sinon, propose un nom en kebab-case base sur la discussion (ex: `user-authentication`, `payment-system`).

## Etape 2 : Creer le dossier

Cree `changes/[feature-name]/`

## Etape 3 : Creer plan.md

Cree `changes/[feature-name]/plan.md` :

```markdown
# [Feature Name]

## References
- PRD : `docs/prd.md` (section pertinente)
- Architecture : `docs/architecture.md` (section pertinente)
- Recherche : `docs/deepsearch/[topic].md` (si applicable)

## Quoi
[Resume de ce que fait la feature]

## Pourquoi
[Justification du besoin metier]

## Scope
- [x] Inclus : [element 1]
- [ ] Hors scope : [element exclu]

## Approche
[Description de l'approche technique]

## Etapes
1. [ ] [etape 1]
2. [ ] [etape 2]

## Fichiers
- `path/to/file.ts` : [action]

## Risques
- [risque potentiel et mitigation]

## Criteres de succes
- [ ] [critere 1]
```

## Etape 4 : Proposer un ADR (si decision architecturale)

Analyser si la feature implique une decision d'architecture :
- Choix de technologie (nouvelle lib, nouveau service)
- Pattern architectural (server actions vs API routes)
- Trade-off significatif (performance vs maintenabilite)
- Integration externe (Stripe, SendGrid, etc.)

**Si decision detectee, PROPOSER** :
```
### Decision d'architecture detectee

Cette feature implique une decision :
- [Description de la decision]

Creer un ADR dans decisions/ ? [y/N]
```

Si l'utilisateur accepte :
1. Creer `docs/memory-bank/decisions/NNNN-titre.md`
2. Utiliser le format ADR (voir decisions/INDEX.md)
3. Mettre a jour decisions/INDEX.md

## Etape 5 : Confirmer

```
## Feature planifiee

**Nom** : [feature-name]
**Fichier** : changes/[feature-name]/plan.md
[Si ADR cree] **ADR** : decisions/NNNN-titre.md

---
Pret a creer les taches avec `/create-tasks`.
```

## Regles

- Extraire les infos de la conversation precedente
- Si des infos manquent, poser des questions AVANT de creer le fichier
- Le plan doit etre actionnable (pas vague)
- Remplir les references si des docs existent (PRD, architecture, recherche)
- Proposer un ADR si decision architecturale (ne pas creer automatiquement)
