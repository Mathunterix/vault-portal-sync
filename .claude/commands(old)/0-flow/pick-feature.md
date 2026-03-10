---
description: Extract features from PRD/architecture and create implementation plans
argument-hint: [feature-name or "all"]
---

# Pick Feature

Extrait les features des documents BMAD et cree un plan d'implementation global pret pour `/implement`.

C'est la **transition entre BMAD et le workflow quotidien**.

## Etape 1: Charger les documents BMAD

Lis tous les documents disponibles :
- `docs/prd.md` (requis)
- `docs/architecture.md` (recommande)
- `docs/project-brief.md` (optionnel)

Si le PRD n'existe pas, demande a l'utilisateur de d'abord utiliser `/bmad/pm`.

## Etape 2: Identifier et lister les features

Analyse le PRD et extrait toutes les features/fonctionnalites.
Pour chaque feature, identifie :
- Nom (en kebab-case)
- Description courte
- Dependances (autres features requises avant)
- Complexite estimee (S/M/L) avec temps estime

**Estimation de temps** (indicatif) :
- **S** (Small) : ~2h
- **M** (Medium) : ~1 jour (4-8h)
- **L** (Large) : ~2-3 jours

Affiche la liste :

```
## Features identifiees

| # | Feature | Description | Deps | Taille | Temps |
|---|---------|-------------|------|--------|-------|
| 01 | user-auth | Authentification utilisateur | - | M | ~1j |
| 02 | dashboard | Tableau de bord principal | 01 | L | ~2-3j |
| 03 | settings | Page parametres | 01 | S | ~2h |

Total: 3 features (~4-5 jours)

Ordre d'implementation propose base sur les dependances.
Modifier l'ordre ? (y/n ou liste "01,03,02")
```

## Etape 3: Confirmer l'ordre

Si `$1` est fourni :
- Si c'est "all" → accepter l'ordre propose
- Si c'est un nom → extraire uniquement cette feature (pas de plan global)
- Si c'est une liste "1,3,2" → utiliser cet ordre

Sinon, demande confirmation ou modification de l'ordre.

## Etape 4: Creer le plan d'implementation global

Cree `changes/implementation-plan.md` :

```markdown
# Plan d'implementation

> Genere depuis PRD le [DATE]
> Sources: prd.md, architecture.md, project-brief.md

## Projet

**Nom** : [extrait du project-brief ou PRD]
**Vision** : [1-2 phrases]
**Stack** : [extrait de architecture.md]

## Features a implementer

| # | Feature | Description | Status | Temps | Deps |
|---|---------|-------------|--------|-------|------|
| 01 | user-auth | Authentification | pending | ~1j | - |
| 02 | dashboard | Tableau de bord | pending | ~2-3j | 01 |
| 03 | settings | Parametres | pending | ~2h | 01 |

**Estimation totale** : ~4-5 jours

## Progression

- **Feature actuelle** : -
- **Completees** : 0/3
- **Prochaine** : 01-user-auth

## Notes

[decisions importantes, risques identifies]

---
*Lancer `/implement implementation-plan` pour commencer*
```

## Etape 5: Creer les sous-dossiers pour chaque feature

Pour chaque feature, cree `changes/[##-feature]/plan.md` :

```markdown
# [##] [Feature Name]

## References
- PRD : `docs/prd.md` (section [X])
- Architecture : `docs/architecture.md` (section [Y])

## Quoi
[Extrait du PRD]

## Pourquoi
[Besoin metier]

## Scope
- [x] Inclus : [element 1]
- [ ] Hors scope : [element exclu]

## Approche
[Base sur l'architecture]

## Etapes
1. [ ] [etape 1]
2. [ ] [etape 2]

## Fichiers
- `path/to/file.ts` : [action]

## Criteres de succes
- [ ] [critere 1]
```

## Etape 6: Initialiser la documentation projet

### 6.1 Mettre a jour context.md

Initialise `docs/memory-bank/context.md` avec les infos du projet :

```markdown
# contexte

> mis a jour par `/start` et `/doc`

## projet

**nom** : [nom du projet]
**vision** : [extrait PRD/project-brief]
**public** : [pour qui]
**stack** : [stack de architecture.md]

## focus actuel

Implementation du plan global. Voir `changes/implementation-plan.md`.

## features en cours

| feature | status | derniere activite |
|---------|--------|-------------------|
| 01-user-auth | pending | [DATE] |
| 02-dashboard | pending | - |
| 03-settings | pending | - |

## prochaines etapes

1. `/implement implementation-plan` pour commencer
2. Implementer les features dans l'ordre

## historique recent

- [DATE] : plan d'implementation cree (X features)

---

*mis a jour : [DATE]*
```

### 6.2 Generer structure.md et tech-stack.md

Execute `/update-conventions` pour generer :
- `docs/memory-bank/structure.md`
- `docs/memory-bank/tech-stack.md`

### 6.3 Mettre a jour CLAUDE.md

Ajoute/met a jour la section `[projet specifique]` dans CLAUDE.md :

```markdown
## [projet specifique]

**projet** : [nom]
**stack** : [stack]

voir `changes/implementation-plan.md` pour le plan global.
```

## Etape 7: Archiver les docs BMAD (optionnel)

Propose :
> Les docs BMAD (prd, architecture, project-brief) ont ete utilises pour generer le plan.
> Veux-tu les archiver dans `docs/archive-bmad/` ? (y/n)

Si oui, deplace les fichiers.

## Etape 8: Resume final

```
## Plan d'implementation cree

**Projet** : [nom]
**Features** : [N] features numerotees
**Plan** : changes/implementation-plan.md

### Structure creee
changes/
├── implementation-plan.md
├── 01-user-auth/plan.md
├── 02-dashboard/plan.md
└── 03-settings/plan.md

### Documentation initialisee
- [x] context.md
- [x] structure.md
- [x] tech-stack.md
- [x] CLAUDE.md

---
Pret. Lance `/implement implementation-plan` pour commencer.
```

## Regles

- Toujours extraire du PRD, pas inventer
- Numeroter les features (01, 02, 03...)
- Respecter les dependances pour l'ordre
- Un plan.md par feature
- Toujours initialiser la doc (context, structure, tech-stack)
- Le plan global est la source de verite pour l'ordre
