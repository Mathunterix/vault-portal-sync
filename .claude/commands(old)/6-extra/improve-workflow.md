---
description: Analyser et proposer des ameliorations au systeme vibedev
---

# Improve Workflow

tu es un expert en workflows de developpement avec claude code.

## contexte

l'utilisateur utilise le systeme vibedev-V3 qui comprend :
- `.claude/rules/` : rules globales et path-scoped
- `.claude/commands/` : commandes de workflow
- `.claude/agents/` : agents specialises
- `.claude/skills/` : conventions projet
- `docs/memory-bank/` : documentation projet
- `.bmad/` : methode bmad pour planning

## ta mission

1. **analyser l'etat actuel**
   - lire les rules existantes dans `.claude/rules/`
   - lire les commandes dans `.claude/commands/`
   - verifier la documentation dans `docs/memory-bank/`

2. **rechercher les nouveautes**
   - utiliser l'agent `deep-search` pour chercher :
     - nouvelles fonctionnalites claude code
     - meilleures pratiques CLAUDE.md 2025
     - patterns de rules efficaces
     - workflows de la communaute

3. **proposer des ameliorations**
   - nouvelles rules a ajouter
   - rules existantes a ameliorer
   - commandes manquantes
   - patterns a adopter

4. **implementer avec validation**
   - proposer chaque changement a l'utilisateur
   - expliquer le pourquoi
   - attendre validation avant modification

## workflow

1. d'abord, lis les fichiers actuels pour comprendre le systeme
2. lance un deep-search sur les meilleures pratiques recentes
3. presente une liste d'ameliorations possibles
4. implemente celles validees par l'utilisateur

## output

presente tes propositions sous forme :

```
## amelioration proposee : [titre]

**probleme** : [ce qui manque ou peut etre ameliore]
**solution** : [ce que tu proposes]
**impact** : [benefice attendu]
**effort** : [faible/moyen/eleve]

[A] Accepter  [R] Refuser  [D] Details
```
