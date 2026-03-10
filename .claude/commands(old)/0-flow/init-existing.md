---
description: Initialiser le workflow vibedev sur un projet existant (brownfield) - documentation complete
---

# Init Existing Project

Tu vas configurer le workflow vibedev sur un projet existant. C'est un processus complet qui documente TOUT le projet.

**Durée estimée** : 30-60 min selon la taille du projet

---

## Phase 1 : Exploration Profonde (15-30 min)

Lance **plusieurs instances** de l'agent `explore-codebase` en parallèle pour une analyse exhaustive :

### 1.1 Structure et Architecture

```
Explore le codebase pour comprendre :
- L'architecture globale (monolithe, microservices, monorepo)
- Les patterns utilisés (MVC, Clean Architecture, etc.)
- La structure des dossiers et leur rôle
- Les points d'entrée de l'application
- Les dépendances entre modules
```

### 1.2 Stack Technique Complète

```
Identifie TOUTES les technologies :
- Framework principal + version exacte
- Langage + version
- Database + ORM
- Auth solution
- UI framework + composants
- State management
- Fetching/cache
- Testing framework
- Build tools
- CI/CD
- Hosting/deploy
```

### 1.3 Features Existantes

```
Liste TOUTES les features implémentées :
- Pour chaque feature :
  - Nom et description
  - Fichiers principaux
  - Routes/endpoints associés
  - Composants UI
  - Logique métier
  - État (complète, partielle, deprecated)
```

### 1.4 API et Endpoints

```
Documente tous les endpoints :
- Routes API (REST, GraphQL)
- Server actions
- Webhooks
- Intégrations externes
```

### 1.5 Modèles de Données

```
Analyse la structure de données :
- Schéma base de données
- Types/interfaces TypeScript
- Relations entre entités
- Validations (Zod, etc.)
```

### 1.6 Patterns et Conventions

```
Identifie les conventions du projet :
- Nommage (fichiers, fonctions, composants)
- Structure des composants
- Gestion des erreurs
- Logging
- Tests
```

---

## Phase 2 : Génération Documentation (10-15 min)

Génère TOUS les fichiers de documentation :

### 2.1 docs/memory-bank/context.md

```markdown
# Contexte Projet

## Projet
[Nom] - [Description détaillée]

## Stack
| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | [ex: Next.js] | [15.x] |
| Langage | [TypeScript] | [5.x] |
| Database | [PostgreSQL + Prisma] | [x.x] |
| Auth | [NextAuth/Supabase Auth] | [x.x] |
| UI | [Tailwind + shadcn/ui] | [x.x] |
| State | [Zustand/Context] | [x.x] |
| Testing | [Vitest/Jest + Playwright] | [x.x] |

## Architecture
[Description détaillée du pattern architectural]
[Diagramme en ASCII ou description des couches]

## Modules Principaux
| Module | Chemin | Responsabilité |
|--------|--------|----------------|
| [nom] | [path/] | [description] |

## Intégrations Externes
| Service | Usage | Config |
|---------|-------|--------|
| [ex: Stripe] | [paiements] | [env vars] |

## Focus Actuel
[Aucun - projet venant d'être initialisé avec vibedev]

## Historique
- [DATE] : Initialisation workflow vibedev-V3
```

### 2.2 docs/memory-bank/structure.md

```markdown
# Structure du Projet

## Arborescence Complète

```
[nom-projet]/
├── [dossier]/           # [description détaillée]
│   ├── [sous-dossier]/  # [description]
│   │   └── ...
│   └── ...
├── ...
```

## Dossiers Clés

### [dossier1] - [Rôle]
[Description de ce que contient ce dossier, patterns utilisés, conventions]

### [dossier2] - [Rôle]
[idem]

## Fichiers Clés

| Fichier | Rôle | Notes |
|---------|------|-------|
| [path/file.ext] | [description] | [patterns, dépendances] |

## Points d'Entrée

| Type | Fichier | Description |
|------|---------|-------------|
| App | [path] | Point d'entrée principal |
| API | [path] | Routes API |
| Config | [path] | Configuration |

## Conventions Détectées

### Nommage
- Fichiers : [convention]
- Composants : [convention]
- Fonctions : [convention]
- Types : [convention]

### Organisation
- [Pattern détecté et expliqué]
```

### 2.3 docs/memory-bank/tech-stack.md

```markdown
# Tech Stack

## Versions Exactes

| Package | Version | Rôle | Notes |
|---------|---------|------|-------|
| [package] | [x.x.x] | [rôle] | [notes importantes] |

## Scripts Disponibles

| Script | Commande | Description |
|--------|----------|-------------|
| dev | `[pnpm dev]` | Développement local |
| build | `[pnpm build]` | Build production |
| start | `[pnpm start]` | Lancer en prod |
| test | `[pnpm test]` | Tests unitaires |
| test:e2e | `[pnpm test:e2e]` | Tests E2E |
| lint | `[pnpm lint]` | Linting |
| db:push | `[pnpm db:push]` | Push schema DB |
| db:studio | `[pnpm db:studio]` | UI base de données |

## Variables d'Environnement

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| [DATABASE_URL] | [Connexion DB] | Oui | [postgres://...] |
| [NEXT_PUBLIC_*] | [Variables publiques] | ... | ... |

## Configuration

### TypeScript
- Strict mode : [oui/non]
- Paths aliases : [liste]

### ESLint
- Config : [base utilisée]
- Rules custom : [liste]

### Base de Données
- Type : [PostgreSQL/MySQL/etc.]
- ORM : [Prisma/Drizzle/etc.]
- Migrations : [où et comment]
```

### 2.4 docs/memory-bank/architecture.md

```markdown
# Architecture

## Vue d'Ensemble

[Diagramme ASCII ou description détaillée]

## Pattern Architectural

**Type** : [ex: Clean Architecture, MVC, Feature-based]

**Description** :
[Explication détaillée du pattern et pourquoi il a été choisi]

## Couches

### [Couche 1 - ex: Presentation]
- **Responsabilité** : [description]
- **Dossiers** : [paths]
- **Patterns** : [patterns utilisés]

### [Couche 2 - ex: Business Logic]
- **Responsabilité** : [description]
- **Dossiers** : [paths]
- **Patterns** : [patterns utilisés]

### [Couche 3 - ex: Data Access]
- **Responsabilité** : [description]
- **Dossiers** : [paths]
- **Patterns** : [patterns utilisés]

## Flux de Données

```
[User] → [UI Component] → [Server Action/API] → [Service] → [Repository] → [Database]
                ↓                    ↓
           [State]              [Validation]
```

## Décisions Techniques (ADRs)

### ADR-001 : [Titre]
- **Contexte** : [Pourquoi cette décision]
- **Décision** : [Ce qui a été choisi]
- **Conséquences** : [Impacts]

## Dépendances Entre Modules

| Module | Dépend de | Utilisé par |
|--------|-----------|-------------|
| [A] | [B, C] | [D] |

## Points d'Attention

- [Dette technique identifiée]
- [Couplages forts]
- [Zones à risque]
```

### 2.5 docs/memory-bank/decisions/INDEX.md

Creer le dossier et l'index pour les ADRs :

```bash
mkdir -p docs/memory-bank/decisions
```

```markdown
# Decisions (ADRs)

Index des decisions d'architecture du projet.

## Decisions

| # | Decision | Status | Date |
|---|----------|--------|------|
| - | - | - | - |

---

*Creer une decision : ajouter un fichier `NNNN-titre.md` dans ce dossier*
```

### 2.6 docs/memory-bank/references/INDEX.md

Creer le dossier et l'index pour les guides :

```bash
mkdir -p docs/memory-bank/references
```

```markdown
# References

Guides et apprentissages issus des sessions de travail.

## Guides disponibles

| Guide | Description | Cree le |
|-------|-------------|---------|
| - | - | - |

---

*Creer avec `/doc [feature] guide`*
```

### 2.7 docs/memory-bank/features/[feature].md

Pour CHAQUE feature majeure, créer un fichier avec **frontmatter** :

```markdown
---
feature: [category]-[name]
category: [auth|payments|database|ui|api|system|messaging|admin|config]
status: stable
depends_on: []
related: []
impacts: []
files: []
last_updated: [DATE]
---

# Feature : [Nom]

## Status
[active / deprecated / en-cours]

## Description
[Ce que fait cette feature, pour qui, pourquoi]

## Fichiers Principaux

| Fichier | Rôle |
|---------|------|
| [path] | [description] |

## Routes / Endpoints

| Route | Méthode | Description |
|-------|---------|-------------|
| [/api/...] | [GET/POST] | [description] |

## Composants UI

| Composant | Chemin | Rôle |
|-----------|--------|------|
| [Nom] | [path] | [description] |

## Logique Métier

[Description des règles métier implémentées]

## Dépendances

- **Internes** : [autres features/modules]
- **Externes** : [packages, APIs]

## Tests

| Type | Fichier | Couverture |
|------|---------|------------|
| [unit/e2e] | [path] | [description] |

## Notes Techniques

[Décisions spécifiques, workarounds, dette technique]

---
*Documenté le [DATE]*
```

---

## Phase 3 : Adaptation des Rules (5-10 min)

### 3.1 Analyser les Rules Existantes

Compare la stack détectée avec les rules dans `.claude/rules/` :

### 3.2 Désactiver les Rules Non Pertinentes

```bash
# Exemple si pas de Next.js
mv .claude/rules/stack/nextjs.md .claude/rules-disabled/

# Exemple si pas de Prisma
mv .claude/rules/stack/prisma-supabase.md .claude/rules-disabled/

# Exemple si pas de shadcn
mv .claude/rules/stack/shadcn.md .claude/rules-disabled/
```

**Proposer les commandes exactes à exécuter.**

### 3.3 Créer des Rules Spécifiques

Si des patterns spécifiques au projet sont détectés, proposer de créer des rules :

```markdown
---
paths: "[pattern]"
---
# [Nom de la Rule]

## Contexte
[Pourquoi cette rule existe]

## Conventions
- [Convention 1]
- [Convention 2]

## Exemple

```typescript
// bon
[code correct]

// mauvais
[code incorrect]
```
```

---

## Phase 4 : Mise à Jour CLAUDE.md (2 min)

Proposer une mise à jour complète de CLAUDE.md :

```markdown
# [nom-projet]

## stack

[stack complète sur une ligne]

---

## regles

voir `.claude/rules/` pour les conventions de code

---

## contexte

voir `docs/memory-bank/` pour la documentation projet :
- `context.md` : projet, focus actuel, architecture
- `structure.md` : arborescence, fichiers clés
- `tech-stack.md` : versions, scripts, env vars
- `architecture.md` : patterns, ADRs, flux de données
- `features/` : doc par feature

---

## commandes

### workflow quotidien
| commande | usage |
|----------|-------|
| `/start` | debut session |
| `/plan` | planifier feature |
| `/create-tasks` | creer taches depuis plan |
| `/implement` | executer tache |
| `/log` | log rapide petite modif |
| `/doc` | documenter + archiver feature |

---

## [projet specifique]

### conventions detectees
- [Convention 1]
- [Convention 2]

### points d'attention
- [Point 1]
- [Point 2]

### integrations
- [Service 1] : [description]
- [Service 2] : [description]
```

---

## Phase 5 : Exécuter update-conventions (2 min)

Lancer la commande pour s'assurer que tout est cohérent :

```
/update-conventions
```

Cela régénère `structure.md` et `tech-stack.md` si besoin.

---

## Phase 6 : Validation Finale (5 min)

### 6.1 Vérifier la Documentation

```bash
# Lister tous les fichiers créés
ls -la docs/memory-bank/
ls -la docs/memory-bank/features/
```

### 6.2 Tester le Workflow

```
/start
```

Vérifier que :
- [ ] Le contexte se charge correctement
- [ ] La stack est correcte
- [ ] Les features sont listées
- [ ] Pas d'erreurs

### 6.3 Afficher le Résumé

```
## Init Existing - Terminé

**Projet** : [nom]
**Stack** : [stack résumée]
**Features** : [X features documentées]
**Durée** : [temps passé]

### Documentation Créée
- docs/memory-bank/context.md
- docs/memory-bank/structure.md
- docs/memory-bank/tech-stack.md
- docs/memory-bank/architecture.md
- docs/memory-bank/decisions/INDEX.md
- docs/memory-bank/references/INDEX.md
- docs/memory-bank/features/[X fichiers avec frontmatter]

### Rules Adaptées
- Désactivées : [liste]
- Créées : [liste si applicable]

### Prochaines Étapes
1. Relire la documentation générée
2. Corriger les erreurs/imprécisions
3. Ajouter les détails manquants (secrets, configs spécifiques)
4. `/start` pour commencer à travailler

---
Workflow vibedev-V3 initialisé.
Projet prêt pour le développement assisté.
```

---

## Notes Importantes

- **NE PAS modifier le code** - uniquement analyser et documenter
- **Être exhaustif** - documenter TOUT, pas juste les grandes lignes
- **Validation humaine** - demander confirmation pour les zones d'incertitude
- **Pas d'hallucination** - si incertain, noter "[à compléter]" ou demander
- **Créer les features** - une doc par feature majeure, pas juste un résumé global
