# Decision Workflow (ADRs)

Workflow pour documenter une decision technique (Architecture Decision Record).

**Dossier cible** : `docs/memory-bank/decisions/`

## Quand documenter une decision

- Choix de librairie/framework
- Pattern architectural adopte
- Trade-off technique significatif
- Convention etablie pour le projet
- Changement d'approche technique

## Nommage

Format : `[NNNN]-[short-title].md`

**NNNN** : numero sequentiel (0001, 0002, ...)
**short-title** : titre court en kebab-case

**Exemples** :
- `0001-use-server-actions.md`
- `0002-prisma-over-drizzle.md`
- `0003-feature-flags-in-db.md`

Pour trouver le prochain numero :
```bash
ls docs/memory-bank/decisions/*.md | wc -l
```

## Etape 1 : Identifier la decision

Si argument fourni, utilise ce nom.
Sinon, deduis de la session : quelle decision technique a ete prise ?

## Etape 2 : Detecter le mode

Verifie si une decision similaire existe deja dans `docs/memory-bank/decisions/`.

### Mode A : ENRICHIR (decision existante)

La decision a deja ete documentee. Mettre a jour si :
- Le status change (proposed → accepted, accepted → deprecated)
- De nouvelles consequences sont identifiees
- Le contexte a evolue

Ajouter une section `## Mise a jour [DATE]` en bas.

### Mode B : CREER (nouvelle decision)

Creer le fichier complet avec le template ADR.

**FRONTMATTER OBLIGATOIRE** :
```yaml
---
decision: [NNNN]-[short-title]
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
deciders: [qui a pris la decision]
category: architecture | library | pattern | convention | infrastructure
supersedes: []      # decisions que celle-ci remplace
superseded_by: []   # decision qui remplace celle-ci
related: []         # decisions connexes
---
```

**Template ADR** :
```markdown
---
decision: NNNN-short-title
status: accepted
date: YYYY-MM-DD
deciders: [equipe/personne]
category: [architecture|library|pattern|convention|infrastructure]
supersedes: []
superseded_by: []
related: []
---

# [Titre de la decision]

## Contexte

[Quel probleme on resout ? Pourquoi cette decision est necessaire ?]

## Options considerees

### Option 1 : [Nom]
- **Avantages** : [liste]
- **Inconvenients** : [liste]

### Option 2 : [Nom]
- **Avantages** : [liste]
- **Inconvenients** : [liste]

[Autres options si pertinent]

## Decision

[Ce qu'on a decide et pourquoi]

**Choix** : Option [N] - [Nom]

**Justification** : [Raison principale]

## Consequences

### Positif
- [Avantage 1]
- [Avantage 2]

### Negatif
- [Inconvenient 1]
- [Inconvenient 2]

### Neutre
- [Impact neutre si pertinent]

## Implementation

[Comment cette decision est implementee dans le code]
[Fichiers/patterns concernes]

---
*Decision prise le [DATE]*
```

## Etape 3 : Generer INDEX.md

Regenerer l'index des decisions automatiquement.

```bash
python .claude/scripts/generate_decisions_index.py
```

Ce script :
1. Scanne tous les fichiers `docs/memory-bank/decisions/*.md`
2. Parse les frontmatters YAML
3. Genere `INDEX.md` avec :
   - Liste par status (accepted, proposed, deprecated)
   - Liste par categorie
   - Timeline des decisions
   - Graphe des supersedes (si pertinent)

Si le script n'existe pas, generer INDEX.md manuellement :

```markdown
# Decisions Index (ADRs)

*Auto-genere le YYYY-MM-DD*

**Total**: X decisions

## Par status

### Accepted
| # | Decision | Date | Category |
|---|----------|------|----------|
| 0001 | [Use Server Actions](0001-use-server-actions.md) | 2026-02-01 | pattern |

### Proposed
[decisions en attente de validation]

### Deprecated
[decisions obsoletes]

## Par categorie

### Architecture
- [0001-use-server-actions](0001-use-server-actions.md)

### Library
- [0002-prisma-over-drizzle](0002-prisma-over-drizzle.md)

## Timeline

1. 2026-02-01 - [0001-use-server-actions](0001-use-server-actions.md)
2. 2026-02-03 - [0002-prisma-over-drizzle](0002-prisma-over-drizzle.md)

---
*Regenerer avec: `python .claude/scripts/generate_decisions_index.py`*
```

## Status des decisions

| Status | Signification |
|--------|---------------|
| `proposed` | En discussion, pas encore validee |
| `accepted` | Validee et en application |
| `deprecated` | Obsolete, ne plus appliquer |
| `superseded` | Remplacee par une autre decision |

## Regles specifiques decisions

- **Un fichier = une decision** : pas de decisions multiples
- **Immutable** : ne pas modifier l'historique, ajouter des mises a jour
- **Lier les supersedes** : si une decision en remplace une autre, mettre a jour les deux
- **Justifier** : toujours expliquer POURQUOI, pas juste QUOI
