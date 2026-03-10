# amélioration continue des rules

quand proposer d'améliorer les rules du projet.

## déclencheurs

proposer une nouvelle rule quand :
- un pattern est utilisé dans 3+ fichiers
- un bug récurrent pourrait être évité par une rule
- une nouvelle lib/techno est adoptée
- un feedback de code review revient souvent

## process

1. **identifier** le pattern récurrent
2. **proposer** la rule à l'utilisateur
3. **créer** dans `.claude/rules/` si validé
4. **documenter** avec exemples good/bad

## format de rule

```markdown
---
paths: "**/*.tsx"  # optionnel, pour path-scoped
---

# nom de la rule

description courte.

## règle

- point 1
- point 2

## exemple

// ✅ bon
code correct

// ❌ mauvais
code incorrect
```

## maintenance

- supprimer les rules obsolètes → `.claude/rules-disabled/`
- mettre à jour les exemples quand le code évolue
- fusionner les rules qui se chevauchent

## quand NE PAS créer de rule

- cas isolé (1-2 occurrences)
- déjà couvert par une rule existante
- trop spécifique à un contexte
