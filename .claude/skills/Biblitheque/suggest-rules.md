---
description: Analyze code patterns and suggest new rules or CLAUDE.md enrichments
argument-hint: [feature-name]
---

# Suggest Rules

Analyse le code d'une feature et propose des nouvelles rules ou enrichissements CLAUDE.md.

Declenche automatiquement par `/doc`, ou manuellement.

## Etape 1: Identifier la feature

Si `$1` est fourni, utilise ce nom.
Sinon, regarde `changes/` pour trouver la feature la plus recemment modifiee.

## Etape 2: Lister les rules existantes

Liste tous les fichiers dans `.claude/rules/` :

```bash
ls -la .claude/rules/
```

Note les themes couverts (qualite, securite, stack, etc.).

## Etape 3: Analyser le code de la feature

Identifie les fichiers crees/modifies par la feature.

Pour chaque fichier, cherche :

### Patterns repetitifs
- Meme structure utilisee 2+ fois ?
- Helper/util cree qui pourrait etre standardise ?
- Convention de nommage specifique ?

### Decisions techniques
- Choix d'implementation non trivial ?
- Workaround pour un probleme specifique ?
- Integration avec une lib externe ?

### Anti-patterns evites
- Erreur corrigee pendant l'implementation ?
- Approche rejetee pour une bonne raison ?

## Etape 4: Comparer avec les rules existantes

Pour chaque pattern/convention identifie :

1. **Deja couvert ?** → Rien a faire
2. **Generalisation d'une rule existante ?** → Proposer mise a jour
3. **Nouveau pattern generique ?** → Proposer nouvelle rule
4. **Convention specifique au projet ?** → Proposer enrichissement CLAUDE.md

## Etape 5: Proposer les ajouts

### Si nouvelle rule proposee

```markdown
## Rule proposee

**Fichier** : `.claude/rules/[nom].md`
**Theme** : [qualite|stack|security|...]
**Declencheur** : [pattern utilise X fois / decision technique / anti-pattern]

### Contenu propose

\`\`\`markdown
# [nom de la rule]

[description courte]

## regle

- point 1
- point 2

## exemple

// bon
[code correct]

// mauvais
[code incorrect]
\`\`\`

---
Creer cette rule ? [y/n]
```

### Si enrichissement CLAUDE.md propose

```markdown
## Enrichissement CLAUDE.md propose

**Section** : `[projet specifique]`
**Raison** : [convention specifique a ce projet]

### Ajout propose

\`\`\`markdown
### [nom convention]
- [point 1]
- [point 2]
\`\`\`

---
Ajouter a CLAUDE.md ? [y/n]
```

### Si rien a proposer

```markdown
## Analyse terminee

Aucune nouvelle rule ou convention identifiee.

Les patterns de cette feature sont deja couverts par :
- `.claude/rules/[rule1].md`
- `.claude/rules/[rule2].md`
```

## Etape 6: Appliquer si approuve

Si l'utilisateur approuve :

### Pour une nouvelle rule
1. Cree le fichier dans `.claude/rules/[nom].md`
2. Confirme la creation

### Pour un enrichissement CLAUDE.md
1. Lis CLAUDE.md
2. Trouve la section `[projet specifique]`
3. Ajoute le contenu propose
4. Confirme la modification

## Etape 7: Resume

```
## Rules/Conventions mises a jour

### Nouvelles rules
- [x] `.claude/rules/[nom].md` : [description]

### CLAUDE.md enrichi
- [x] Section `[projet specifique]` : [ajout]

### Deja couverts
- Pattern X → `.claude/rules/code-quality.md`
```

## Criteres pour chaque type

### → Nouvelle rule (`.claude/rules/`)

- Pattern **reutilisable** dans d'autres projets
- Convention de **code** (nommage, structure, patterns)
- **Anti-pattern** generique a eviter
- Integration avec une **lib/techno** de la stack

### → CLAUDE.md `[projet specifique]`

- Convention **specifique a ce projet** uniquement
- Noms de variables/fonctions **metier**
- Workflow **custom** de ce projet
- Decision technique **contextuelle**

## Exemples de detection

| Detection | Type | Destination |
|-----------|------|-------------|
| "Toujours utiliser `date-fns` pour les dates" | stack | `.claude/rules/packages-recommandes.md` (mise a jour) |
| "Les actions sont dans `actions/*.action.ts`" | structure | Deja dans `structure.md` |
| "Le champ `metadata` est toujours un JSONB avec schema X" | projet | CLAUDE.md `[projet specifique]` |
| "Ne pas utiliser `fetch` directement, utiliser `apiClient`" | code | `.claude/rules/api-client.md` (nouvelle) |
| "Les prix sont en centimes dans la DB" | projet | CLAUDE.md `[projet specifique]` |

## Notes

- Ne pas creer de rules pour des cas isoles (1 occurrence)
- Preferer enrichir une rule existante plutot qu'en creer une nouvelle
- Les rules doivent etre actionables (pas juste descriptives)
- CLAUDE.md `[projet specifique]` reste court (max 20 lignes)
