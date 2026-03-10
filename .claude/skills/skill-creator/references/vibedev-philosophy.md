# Philosophie Vibedev pour la creation de skills

Guide pour creer des skills qui s'integrent dans le systeme vibedev de Matthieu. A charger quand on cree ou ameliore un skill.

## Principes fondamentaux

### 1. Redistribuer, pas supprimer

Quand on restructure (commands → skills, CLAUDE.md → rules), chaque info doit atterrir quelque part d'accessible. Ne jamais perdre d'information utile.

### 2. Le contexte de session est roi

Claude a deja le contexte de ce qu'il vient de faire. Pas besoin de processus automatiques pour "detecter" ce qui a change. Utiliser ce que l'on sait de la session.

### 3. CLAUDE.md = quickstart + index

Le CLAUDE.md est un point d'entree (60-100 lignes), pas une doc exhaustive. Chaque rule/skill doit etre referencee dans CLAUDE.md avec une ligne de description.

### 4. Progressive disclosure

```
Niveau 1 : CLAUDE.md → pointeurs (~50 tokens)
Niveau 2 : rules / SKILL.md → instructions (~200-500 tokens)
Niveau 3 : references/ ou docs/ → details (a la demande)
```

### 5. Enrichir > Recreer

Quand une doc existe, la mettre a jour chirurgicalement au lieu de la reecrire from scratch.

## Quand creer un skill vs autre chose

| Besoin | Outil | Exemple |
|--------|-------|---------|
| Action manuelle, timing controle | Skill avec `disable-model-invocation: true` | /start, /deploy, /commit |
| Expertise auto-activee | Skill (sans disable) | conventions de code |
| Regles universelles courtes | `.claude/rules/` | no-any, no-hardcode |
| Regles par domaine | `.claude/rules/` path-scoped | supabase-patterns |
| Doc reference | `docs/` | architecture, features |
| Connexion outil externe | MCP | ghost, obsidian, github |

## Structure d'un bon skill vibedev

### Frontmatter

```yaml
---
name: skill-name
description: Description complete et precise. Quand utiliser ce skill. Ce qu'il fait.
disable-model-invocation: true   # Pour les actions manuelles
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(commandes specifiques)
argument-hint: "[argument optionnel]"   # Si le skill prend un argument
---
```

- `disable-model-invocation: true` pour les actions declenchees manuellement (workflow)
- Omettre pour les expertises qui doivent s'activer automatiquement
- `allowed-tools` : lister explicitement les outils necessaires

### Corps du SKILL.md

1. **Titre + 1 ligne de philosophie** : pourquoi ce skill existe
2. **References** : pointer vers les fichiers dans `references/` a charger
3. **Etapes numerotees** : workflow clair, pas ambigu
4. **Template d'output** : format attendu du resultat
5. **Regles** : contraintes et interdits

### references/

Utiliser pour :
- Templates (doc, code)
- Best practices condensees
- Arbre de decisions
- Exemples concrets

Ne PAS mettre dans references/ :
- Le workflow principal (ca va dans SKILL.md)
- Des infos qu'on a besoin a chaque invocation (ca va dans SKILL.md)

## Patterns a suivre

### Pattern "Enrichir l'existant"

Quand le skill modifie un fichier qui peut deja exister :
1. Verifier si le fichier existe
2. Si oui → mode enrichissement (Edit, pas Write)
3. Si non → mode creation (Write avec template)

### Pattern "Verifier la coherence"

Apres avoir deplace ou cree du contenu :
1. Verifier que les chemins references existent (`ls`)
2. Verifier que le CLAUDE.md reference les nouvelles rules/docs
3. Verifier qu'il n'y a pas de doublons

### Pattern "Session context"

Quand le skill documente ce qui vient d'etre fait :
- Utiliser le contexte de la conversation
- Ne pas forcer des processus automatiques (git diff)
- L'utilisateur veut documenter MAINTENANT parce qu'il a le contexte

### Pattern "Credentials et infos frequentes"

Ne jamais supprimer :
- Credentials/connexions utilisees quotidiennement
- Fichiers patterns references constamment
- Dette technique active
- Contexte metier qui conditionne le code

Ces infos doivent rester dans CLAUDE.md ou dans une rule sans path-scope (toujours chargee).

## Organisation des skills

```
.claude/skills/
├── 0-flow/              # Workflow quotidien (timing controle)
│   ├── start/
│   ├── plan/
│   ├── create-tasks/
│   ├── implement/
│   ├── doc/             # Avec references/templates.md
│   ├── log/
│   └── pick-feature/
│
├── 6-extra/             # Maintenance & amelioration
│   ├── improve-workflow/
│   ├── update-conventions/
│   └── suggest-rules/   # (si cree)
│
├── refactor-claude-md/  # Avec references/ best-practices, decision-tree
├── code-reviewer/       # 3-agents paralleles
├── skill-creator/       # Ce skill + references vibedev
└── obsidian-search/     # Recherche vault
```

### Nommage

- kebab-case pour les noms de skills
- Dossiers groupes par contexte (0-flow, 6-extra)
- Un SKILL.md par skill (pas de flat .md pour les skills importants)

## Patterns avances

### Pattern "Lazy loading table"

Dans le SKILL.md, lister chaque reference avec une condition de chargement :

```markdown
| Reference | Description | Charger quand |
|-----------|-------------|---------------|
| `references/workflow.md` | Etapes detaillees du process | Toujours |
| `references/templates.md` | Templates de notes | Creation de notes |
| `references/integrations.md` | APIs et MCPs connectes | Integration technique |
```

Claude charge uniquement les references necessaires a l'operation en cours. Un skill de 10 references ne consomme que 1-2 references par invocation.

### Pattern "Consolidation > copie"

Quand on migre des docs existantes vers un skill :
1. Ne PAS copier chaque fichier source comme reference individuelle
2. Regrouper par theme : 11 docs YouTube → 7 references thematiques
3. Eliminer la duplication entre fichiers
4. Chaque reference < 400 lignes

Bonne consolidation : `principes.md` + `programmes.md` (2 fichiers thematiques)
Mauvaise consolidation : copier 8 fichiers source tels quels dans references/

### Pattern "Contexte dans le projet, methode dans le skill"

Pour les skills utilises dans differents contextes (blog, capture, decision...) :
- Le skill = methode pure (comment faire)
- Le contexte = note MOC du projet / fichier context.md du repo (sur quoi travailler)
- Pas de MEMORIES.md separe : les preferences apprises font partie de la methode

Pour les skills mono-contexte (coach, journal...) :
- Integrer les preferences utilisateur directement dans le SKILL.md
- Le skill est a la fois methode et contexte

## Erreurs a eviter

1. **Trop d'auto-activation** : les skills de workflow doivent etre `disable-model-invocation: true`
2. **Trop de contenu dans SKILL.md** : utiliser `references/` pour la doc lourde (< 500 lignes pour SKILL.md)
3. **Pas de verification post-action** : toujours verifier que les chemins existent, que les references sont a jour
4. **Oublier l'index** : chaque rule/skill cree doit etre reference dans CLAUDE.md
5. **Forcer un template rigide** : adapter le contenu au besoin reel, pas toujours forcer toutes les sections
6. **Creer un fichier MEMORIES** : les preferences apprises vont dans le skill ou ses references, pas dans un fichier separe
7. **Copier sans consolider** : regrouper les docs par theme, pas par source d'origine
8. **Pas de checkpoints** : les skills complexes doivent inclure des moments de validation humaine, pas tourner en autonomie complete
