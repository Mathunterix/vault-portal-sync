---
name: improve-workflow
description: Analyze and propose improvements to the vibedev system. Deep-searches for new Claude Code features, best practices, and community patterns. Reviews rules, skills, and documentation to propose concrete improvements. Use periodically to keep the system up-to-date.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, WebSearch
---

# Improve Workflow

Expert en workflows de developpement avec Claude Code. Analyse le systeme actuel et propose des ameliorations basees sur les dernieres best practices.

Charge `references/claude-code-features.md` pour les features Claude Code, patterns d'extension, et points a auditer.

## Contexte

Le systeme vibedev comprend :
- `.claude/rules/` : rules globales et path-scoped
- `.claude/skills/` : skills (workflows, expertise)
- `.claude/commands/` : commandes legacy (si encore presentes)
- `docs/memory-bank/` : documentation projet
- `.bmad/` : methode bmad pour planning

## Etape 1 : Analyser l'etat actuel

1. Lire les rules existantes dans `.claude/rules/`
2. Lire les skills dans `.claude/skills/`
3. Verifier la documentation dans `docs/memory-bank/`
4. Lire le CLAUDE.md

Identifier :
- Rules obsoletes ou redondantes
- Skills manquants ou sous-utilises
- Documentation perimee
- CLAUDE.md trop long ou desorganise

## Etape 2 : Rechercher les nouveautes

Utiliser l'agent `deep-search` pour chercher :
- Nouvelles fonctionnalites Claude Code
- Meilleures pratiques CLAUDE.md recentes
- Patterns de rules efficaces
- Workflows de la communaute
- Nouveaux outils ou MCPs pertinents

## Etape 3 : Proposer des ameliorations

Pour chaque amelioration, presenter :

```
## amelioration proposee : [titre]

**probleme** : [ce qui manque ou peut etre ameliore]
**solution** : [ce que tu proposes]
**impact** : [benefice attendu]
**effort** : [faible/moyen/eleve]

[A] Accepter  [R] Refuser  [D] Details
```

Types d'ameliorations :
- Nouvelles rules a ajouter
- Rules existantes a ameliorer ou fusionner
- Skills manquants a creer
- Patterns a adopter
- CLAUDE.md a refactorer (→ appeler `/refactor-claude-md`)

## Etape 4 : Implementer avec validation

- Proposer chaque changement a l'utilisateur
- Expliquer le pourquoi
- Attendre validation avant modification
- Implementer un par un

## Regles

- Toujours lire l'existant avant de proposer
- Chaque proposition doit etre concrete et actionnable
- Ne pas proposer de changements cosmetiques
- Prioriser les ameliorations a fort impact / faible effort
- Si le CLAUDE.md est trop long, suggerer `/refactor-claude-md`
- **Pas de marqueurs "NOUVEAU"** : ne jamais utiliser "NOUVEAU", "NEW", "UPDATED" dans les skills/rules. Un agent n'a pas de memoire entre sessions - il ne sait pas ce qui etait "avant". Ces marqueurs creent de la confusion et des regressions potentielles.
