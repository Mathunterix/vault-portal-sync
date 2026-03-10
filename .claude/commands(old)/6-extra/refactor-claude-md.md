---
description: Review and refactor CLAUDE.md to keep it under 80 lines
---

# Refactor CLAUDE.md

Tu analyses et refactores le CLAUDE.md pour le garder minimal.

## Etape 1: Analyser CLAUDE.md

Lis le fichier `CLAUDE.md` et compte :
- Nombre total de lignes
- Nombre de sections
- Contenu de chaque section

## Etape 2: Identifier ce qui doit etre deplace

Pour chaque section, determine si elle doit :

### RESTER dans CLAUDE.md (regles universelles)
- Regles qui s'appliquent a CHAQUE interaction
- Anti-patterns critiques (max 5)
- Pointeurs vers d'autres fichiers
- Liste des commandes essentielles (max 5)

### ALLER dans le skill project-conventions
- Conventions de nommage detaillees
- Patterns de code specifiques
- Structure de fichiers detaillee
- Bonnes pratiques par technologie

### ALLER dans docs/
- Documentation de features
- Guides d'utilisation
- Historique des decisions
- Tutoriels

### ALLER dans des commandes separees
- Workflows complexes
- Procedures multi-etapes
- Checklists

## Etape 3: Proposer une version refactoree

Presente :

```
## Analyse CLAUDE.md

**Actuel**: [N] lignes
**Cible**: 50-80 lignes

### A deplacer

| Lignes | Contenu | Destination |
|--------|---------|-------------|
| XX-YY | [description] | [ou] |
| XX-YY | [description] | [ou] |

### Version refactoree proposee

[afficher la nouvelle version]

---
Appliquer ces changements ? [y/n]
```

## Etape 4: Attendre approbation

NE PAS appliquer les changements sans approbation explicite.

## Etape 5: Appliquer si approuve

Si l'utilisateur approuve :
1. Deplacer le contenu vers les destinations appropriees
2. Mettre a jour CLAUDE.md avec la version refactoree
3. Confirmer les changements

## Cible

Le CLAUDE.md final doit contenir :
- Nom du projet et stack (5 lignes)
- 2-3 regles critiques (10 lignes)
- Pointeur vers constitution (2 lignes)
- Pointeur vers skill conventions (3 lignes)
- Liste des commandes (10 lignes)
- Anti-patterns (5 lignes)
- Conventions specifiques (5 lignes max)

**Total : 50-80 lignes**

## Red flags

Si CLAUDE.md contient :
- Des exemples de code longs → skill
- De la documentation de features → docs/memory-bank/
- Des workflows multi-etapes → commandes
- Des regles de linting → laisser a ESLint/Prettier
