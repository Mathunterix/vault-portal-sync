# Guidelines officielles Anthropic (condense)

Synthese des docs officielles et best practices Anthropic pour la gestion du contexte Claude Code.

## Taille recommandee

- **Max** : 300 lignes (au-dela, degradation du suivi d'instructions)
- **Ideal** : 60-100 lignes pour projets standards (flexible)
- **Monorepo** : root CLAUDE.md ~40 lignes + sub-CLAUDE.md par app

## Structure WHAT / WHY / HOW

Pattern recommande par Anthropic :

```
WHY  : Description du projet, objectif, utilisateurs, mecanisme principal
WHAT : Stack, structure, technologies
HOW  : Commandes, conventions, regles critiques, index des rules
```

**IMPORTANT** : le WHY ne se delegue pas. Pointer vers context.md ne suffit pas.
Chaque session doit comprendre le produit en lisant les 5 premieres lignes.

## Hierarchie de memoire

| Niveau | Fichier | Charge | Partage |
|--------|---------|--------|---------|
| Enterprise | `/Library/.../CLAUDE.md` | Toujours | Organisation |
| Project | `./CLAUDE.md` | Toujours | Equipe (git) |
| Rules | `.claude/rules/*.md` | Toujours* | Equipe (git) |
| User | `~/.claude/CLAUDE.md` | Toujours | Perso |
| Local | `./CLAUDE.local.md` | Toujours | Perso |

*Rules : charges au demarrage meme avec path-scoping (scoping = pertinence, pas chargement).

**Consequence** : les rules "coutent" du contexte meme path-scoped. Preferer des rules concises.

## Path-scoped rules

`.claude/rules/*.md` avec frontmatter YAML :

```yaml
---
paths:
  - "src/app/api/**/*.ts"
---
```

Avantages :
- Separation des preoccupations
- Haute priorite quand pertinent
- Peut etre detaille sans polluer (en theorie, en pratique tout est charge)

## Le CLAUDE.md comme index

Le CLAUDE.md est un **quickstart + index**, pas une documentation.

Chaque rule deplacee doit apparaitre dans CLAUDE.md :
```markdown
regles detaillees : `.claude/rules/`
- `supabase-patterns.md` - keys, connexion, types, migrations
- `code-quality.md` - DRY, commit, long-term thinking
```

Sans cet index, les nouvelles sessions ne decouvrent pas les rules.

## Progressive disclosure

Principe fondamental Anthropic :

> "Don't tell Claude all the information you could possibly want it to know. Rather, tell it how to find important information."

Pointer vers la doc plutot que l'inclure. Mais garder les infos de **routing** (ou trouver quoi) et les **contraintes** (ne pas faire X) directement dans CLAUDE.md.

## Emphasis keywords

Mots-cles qui ameliorent le suivi :
- **NEVER** : interdit absolu
- **ALWAYS** : obligation
- **IMPORTANT** : attention particuliere
- **CRITICAL** : ne pas ignorer

## Integration workflow vibedev

Si le projet utilise le workflow vibedev :

- `docs/memory-bank/` : documentation persistante (context.md, structure.md, tech-stack.md, features/)
- `docs/logs/` : logs de session quotidiens
- `changes/` : features en cours
- `/start` charge le contexte, `/doc` archive les features
- Le CLAUDE.md doit pointer vers ces emplacements
- `/update-conventions` regenere structure.md + tech-stack.md → ne pas dupliquer dans CLAUDE.md
