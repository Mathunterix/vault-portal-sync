# Templates de documentation

Templates pour features, decisions (ADRs), et guides.

---

# Features

## Frontmatter Schema (OBLIGATOIRE pour nouvelles features)

```yaml
---
feature: [category]-[name]           # ex: auth-login, payments-stripe
category: auth | payments | database | ui | api | system | messaging | admin | config
status: stable | beta | alpha | deprecated
depends_on:                          # features dont celle-ci depend
  - auth                             # sans le .md
  - database-users
related:                             # features connexes/similaires
  - auth-signup
  - auth-password-reset
impacts:                             # features qui dependent de celle-ci
  - dashboard
  - admin-users
files:                               # fichiers cles (3-5 max)
  - src/lib/auth.ts
  - app/api/auth/route.ts
  - src/components/LoginForm.tsx
last_updated: YYYY-MM-DD
---
```

### Categories disponibles

| Category | Usage |
|----------|-------|
| `auth` | Authentification, login, signup, permissions |
| `payments` | Stripe, credits, wallet, facturation |
| `database` | Tables, schemas, migrations |
| `ui` | Composants, layouts, design system |
| `api` | Routes API, webhooks |
| `system` | Infra, cron, monitoring, logs |
| `messaging` | Messages, notifications, emails |
| `admin` | Dashboard admin, moderation |
| `config` | Configuration, feature flags, settings |

### Status

| Status | Signification |
|--------|---------------|
| `stable` | Production, bien teste |
| `beta` | Fonctionne mais peut evoluer |
| `alpha` | Experimental, peut changer |
| `deprecated` | A remplacer, ne plus utiliser |

---

## Template complet (mode creation)

Utilise ce template quand `features/[name].md` n'existe pas encore. Adapte les sections selon la feature.

```markdown
---
feature: [category]-[name]
category: [category]
status: stable
depends_on: []
related: []
impacts: []
files:
  - [fichier1]
  - [fichier2]
last_updated: [YYYY-MM-DD]
---

# [Feature Name]

## Description

[1-2 phrases sur ce que fait cette feature]

---

## Architecture

[Diagramme ASCII du flow si pertinent]

```
source → traitement → destination
```

---

## Tables Database

### [table_name]
[Description de la table]

| colonne | type | description |
|---------|------|-------------|
| id | uuid | PK |
| ... | ... | ... |

[Si JSONB, montrer la structure du payload]

---

## Fichiers cles

### Services / Actions
| fichier | role |
|---------|------|
| `src/lib/...` | ... |

### API Routes
| fichier | role |
|---------|------|
| `app/api/...` | ... |

### UI Components
| fichier | role |
|---------|------|
| `src/components/...` | ... |

---

## Configuration

### Env vars
```bash
VAR_NAME=value  # description
```

### Cron / Scheduled tasks
[Comment c'est configure, comment modifier]

---

## Usage

### Cote utilisateur
[Ou aller, comment utiliser]

### Cote admin
[Page admin, configuration]

### API / Curl
```bash
curl -X POST "..." -H "..." -d '...'
```

### Debug SQL
```sql
SELECT ... FROM ... WHERE ...;
```

---

## Notes techniques

### [Point important 1]
[Explication]

---

## Migrations associees

| migration | description |
|-----------|-------------|
| `YYYYMMDD_name.sql` | ... |

---

## Historique

### [DATE]
- Creation de la feature
- [details]

---
*cree le [DATE]*
```

## Sections obligatoires vs conditionnelles

| Section | Obligatoire | Quand l'inclure |
|---------|-------------|-----------------|
| **Frontmatter** | **OUI** | toujours (nouvelles features) |
| Description | oui | toujours |
| Fichiers cles | oui | toujours |
| Usage | oui | toujours (avec exemples concrets) |
| Notes techniques | oui | toujours (decisions, pieges) |
| Architecture | non | flow complexe, multi-services |
| Tables Database | non | nouvelles tables ou modifications |
| Configuration | non | cron, env vars, webhooks |
| Migrations | non | migrations SQL |
| Debug SQL | non | tables interrogeables |
| Historique | non | feature existante mise a jour |
| Progression | non | feature in-progress |

## Mode enrichissement (la doc existe deja)

En mode enrichissement, ne PAS reecrire le fichier. Modifier chirurgicalement :

1. **Mettre a jour le frontmatter** si nouvelles dependances/impacts
2. **Mettre a jour `last_updated`** dans le frontmatter
3. **Ajouter de nouvelles sections** si le changement couvre un aspect non documente
4. **Mettre a jour les tableaux existants** (fichiers cles, tables, etc.)
5. **Ajouter une entree Historique** :
   ```markdown
   ### [DATE]
   - [description du changement]
   - Fichiers: [fichiers modifies]
   ```
6. **Mettre a jour le status** si pertinent (in-progress → completed)

**Ne PAS** :
- Reecrire la description si elle est toujours correcte
- Supprimer des sections existantes
- Reformuler ce qui existe sans raison
- Recreer le frontmatter (juste l'enrichir)

## Features legacy (sans frontmatter)

Les features existantes sans frontmatter restent valides.
Lors d'un enrichissement, AJOUTER le frontmatter en haut du fichier.

```markdown
---
feature: [deduire du nom de fichier]
category: [deduire du contenu]
status: stable
depends_on: []
related: []
impacts: []
files: [extraire de la section "Fichiers cles"]
last_updated: [aujourd'hui]
---

[contenu existant inchange]
```

---

# Decisions (ADRs)

## Frontmatter Schema

```yaml
---
decision: [NNNN]-[short-title]      # ex: 0001-use-server-actions
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
deciders: [qui a pris la decision]
category: architecture | library | pattern | convention | infrastructure
supersedes: []                       # decisions que celle-ci remplace
superseded_by: []                    # decision qui remplace celle-ci
related: []                          # decisions connexes
---
```

### Categories

| Category | Usage |
|----------|-------|
| `architecture` | Structure du code, patterns macro |
| `library` | Choix de librairies/frameworks |
| `pattern` | Patterns de code, conventions micro |
| `convention` | Conventions de nommage, style |
| `infrastructure` | Deploiement, CI/CD, monitoring |

### Status

| Status | Signification |
|--------|---------------|
| `proposed` | En discussion, pas encore validee |
| `accepted` | Validee et en application |
| `deprecated` | Obsolete, ne plus appliquer |
| `superseded` | Remplacee par une autre decision |

## Template ADR complet

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

## Implementation

[Comment cette decision est implementee dans le code]
[Fichiers/patterns concernes]

---
*Decision prise le [DATE]*
```

## Nommage

Format : `[NNNN]-[short-title].md`

Exemples :
- `0001-use-server-actions.md`
- `0002-prisma-over-drizzle.md`
- `0003-feature-flags-in-db.md`

---

# Guides

## Frontmatter Schema (optionnel)

```yaml
---
guide: [topic]
category: integration | pattern | tooling | troubleshooting
source_session: YYYY-MM-DD
related_features: []
related_decisions: []
---
```

### Categories

| Category | Usage |
|----------|-------|
| `integration` | Integration avec service externe (Stripe, Supabase, etc.) |
| `pattern` | Pattern de code reutilisable |
| `tooling` | Outils, CLI, configuration |
| `troubleshooting` | Resolution de problemes courants |

## Template Guide complet

```markdown
---
guide: [topic]
category: [integration|pattern|tooling|troubleshooting]
source_session: YYYY-MM-DD
related_features: []
related_decisions: []
---

# [Sujet] - Guide

*Issu de la session du YYYY-MM-DD*

## Contexte

[Quand utiliser ce guide]
[Quel probleme ca resout]

## Implementation

### Etape 1 : [Titre]

[Explication]

\`\`\`typescript
// Code example
\`\`\`

### Etape 2 : [Titre]

[Explication]

## Pieges a eviter

### [Piege 1]
[Description et comment l'eviter]

### [Piege 2]
[Description et comment l'eviter]

## Checklist

- [ ] [Etape 1]
- [ ] [Etape 2]
- [ ] [Verification]

## References

- [Lien doc officielle]
- [Lien deep-search si pertinent]

---
*Cree le [DATE]*
```

## Nommage

Format : `[topic].md`

Exemples :
- `stripe-webhooks.md`
- `server-actions-patterns.md`
- `prisma-transactions.md`
