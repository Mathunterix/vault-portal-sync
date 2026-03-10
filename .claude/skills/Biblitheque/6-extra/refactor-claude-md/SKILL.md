---
name: refactor-claude-md
description: Review and refactor CLAUDE.md to keep it lean (60-100 lines). Analyze structure, move content to rules/skills/docs, and propose a version that preserves everything useful. Use when CLAUDE.md grows too large or needs reorganization.
disable-model-invocation: true
allowed-tools: Read, Edit, Write, Glob, Grep, Bash(wc *), Bash(ls *)
---

# Refactor CLAUDE.md

Tu analyses et refactores le CLAUDE.md pour le garder lean sans perdre d'information utile.

**Philosophie** : redistribuer, pas supprimer. Chaque info deplacee doit atterrir quelque part d'accessible. Le CLAUDE.md est un quickstart + index, pas une doc exhaustive.

Charge les references avant de commencer :
- `references/best-practices.md` : criteres de ce qui reste vs ce qui part + pieges a eviter
- `references/decision-tree.md` : ou deplacer chaque type de contenu
- `references/official-guidelines.md` : recommandations Anthropic

## Etape 1 : Analyser l'existant

```bash
wc -l CLAUDE.md
```

Lis le CLAUDE.md ET l'ecosysteme autour :
- `.claude/rules/` : rules existantes (pour eviter les doublons)
- `docs/memory-bank/` : doc existante (pour savoir ou pointer)
- `docs/logs/` : verifier si un systeme de logs existe

Compte dans CLAUDE.md :
- Lignes totales
- Sections (H2)
- Instructions (bullet points ≈ 1 instruction chacun)
- Lignes de code/exemples
- Credentials/connexions hardcodees

## Etape 2 : Identifier ce qui est utilise quotidiennement

**AVANT de deplacer quoi que ce soit**, demande-toi : "est-ce que l'utilisateur reference ca souvent ?"

### NEVER supprimer (meme si ca semble deplacable)

- **Description du projet** : ce que fait le produit, pour qui, comment (WHY)
- **Credentials et connexions DB** : utilises a chaque session debug/migration
- **Fichiers patterns cles** : les fichiers que l'equipe reference constamment (safe-actions, helpers, types)
- **Commandes avec vrais arguments** : `supabase gen types` avec la vraie DB URL, pas `$DATABASE_URL`
- **Dette technique connue** : warnings actifs qui evitent des erreurs recurrentes
- **Contexte metier critique** : "DB partagee → prefixe vetcompass_*", regles de naming cross-layers
- **Convention de naming par layer** : DB snake_case | actions camelCase | UI camelCase + ou se font les transformations

### DEPLACER vers .claude/rules/ (enrichir ou creer)

- Conventions de code detaillees (> 5 lignes sur un domaine)
- Regles par technologie (supabase, prisma, react, etc.)
- Hotfixes contextuels non-universels
- Anti-patterns specifiques a un domaine

### DEPLACER vers docs/

- Documentation de features exhaustive
- Guides d'utilisation, tutoriels
- Historique decisions architecture

### SUPPRIMER

- References a des outils/MCP qui n'existent plus
- Paths vers des fichiers/rules qui n'existent plus
- Code duplique (meme bloc copie 2x)
- Informations evidentes que Claude sait deja
- Instructions vagues ("write good code")
- Regles de style → deleguer au linter

## Etape 3 : Verifier la coherence

Apres avoir decide quoi deplacer :

1. **Chaque rule cree/enrichie** doit etre referencee dans CLAUDE.md
   - Lister les rules avec 1 ligne de description chacune
   - L'utilisateur doit savoir qu'elles existent sans fouiller
2. **Chaque info deplacee** doit etre retrouvable
   - Pointer vers le fichier de destination
3. **Verifier les paths** : `ls .claude/rules/` pour confirmer que les rules existent

## Etape 4 : Proposer la version refactoree

Presenter le rapport :

```
## Analyse CLAUDE.md

**Actuel** : [N] lignes, [M] instructions
**Cible** : 60-100 lignes (flexible selon le projet)

### A deplacer

| Lignes | Contenu | Destination | Raison |
|--------|---------|-------------|--------|
| XX-YY | [desc] | [ou] | [pourquoi] |

### A supprimer

| Lignes | Contenu | Raison |
|--------|---------|--------|
| XX-YY | [desc] | [obsolete/duplique/vague] |

### Rules creees/enrichies

| Fichier | Ce qui a ete ajoute |
|---------|---------------------|
| .claude/rules/[name].md | [description] |

### Version refactoree proposee

[afficher la version COMPLETE]
```

## Etape 5 : Attendre approbation

**NE PAS appliquer sans approbation explicite.**

Demander : "Tu vois des trucs qu'on utilise souvent et que j'aurais oublie ?"

Si approuve :
1. Creer/enrichir les rules de destination
2. Deplacer le contenu
3. Mettre a jour CLAUDE.md
4. Verifier que chaque rule est referencee dans CLAUDE.md

## Structure cible du CLAUDE.md

Pattern WHAT / WHY / HOW :

```
# nom-projet - tagline courte                        (1 ligne)

[description concise du produit, users, fonctionnement] (3-5 lignes WHY)

[stack technique]                                      (1-2 lignes WHAT)

## commandes                                           (5-10 lignes)
## regles critiques (NEVER)                            (3-7 lignes)
## fichiers patterns cles (si pertinent)               (5-10 lignes)
## conventions                                         (3-5 lignes)
## regles detaillees : .claude/rules/                  (index 5-15 lignes)
  - rule-a.md - description
  - rule-b.md - description
## contexte : docs/memory-bank/ (ou docs/)             (3-5 lignes)
## logs / features en cours (si applicable)            (2-3 lignes)
```

**Total : 60-100 lignes** (depasser si necessaire, jamais au detriment de l'utilite)

## Red flags

Si CLAUDE.md contient :
- Exemples de code > 5 lignes → file reference
- Regles de linting detaillees → laisser au linter
- Documentation exhaustive → progressive disclosure
- References a des outils qui n'existent plus → supprimer
- Rules qui n'existent pas sur le filesystem → verifier et corriger
- Credentials en clair deja dans une rule → ne pas dupliquer, mais garder les plus utilises

## Regles d'ecriture

- **Pas de marqueurs "NOUVEAU"** : ne jamais utiliser "NOUVEAU", "NEW", "UPDATED" dans les rules/skills. Un agent n'a pas de memoire entre sessions - il ne sait pas ce qui etait "avant". Ces marqueurs creent de la confusion et des regressions potentielles. Ecrire chaque version comme definitive et complete.
