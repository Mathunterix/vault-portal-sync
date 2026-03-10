# Prisma + Supabase : Guide Complet

> Documentation de reference pour utiliser Prisma avec Supabase PostgreSQL.
> Pour les regles quotidiennes, voir `.claude/rules/prisma-supabase.md` et `.claude/rules/database-workflow.md`.

---

## Table des matieres

1. [TL;DR - L'essentiel](#tldr)
2. [Pourquoi Prisma + Supabase](#pourquoi)
3. [Configuration](#configuration)
4. [Choix de stack](#choix-de-stack)
5. [Migrations](#migrations)
6. [Seed idempotent](#seed-idempotent)
7. [RLS (Row Level Security)](#rls)
8. [Multi-projet](#multi-projet)
9. [Performance](#performance)
10. [Erreurs communes](#erreurs)
11. [Checklist production](#checklist)

---

## TL;DR - L'essentiel {#tldr}

```
┌─────────────────────────────────────────────────────────────┐
│                         PRISMA                              │
│                                                             │
│   → Gere la STRUCTURE (schema, tables, colonnes)            │
│   → Cree les migrations SQL automatiquement                 │
│   → Genere les types TypeScript                             │
│   → Utilise uniquement en DEVELOPPEMENT                     │
│                                                             │
│   = L'architecte qui dessine les plans                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                          │
│                                                             │
│   → Gere les DONNEES (lecture, ecriture, CRUD)              │
│   → Utilise a RUNTIME dans le frontend                      │
│   → Supporte RLS, Realtime, Auth, Storage                   │
│                                                             │
│   = L'ouvrier qui fait le travail                           │
└─────────────────────────────────────────────────────────────┘
```

**En pratique** :
- Tu modifies `schema.prisma` → `prisma db push` ou `migrate dev` → SQL genere automatiquement
- Ton frontend utilise Supabase client → `supabase.from('table').select()`
- Les deux sont synchronises, tu n'ecris plus jamais de SQL manuellement

---

## Pourquoi Prisma + Supabase {#pourquoi}

### Le probleme avec les requetes SQL directes

| Probleme SQL direct | Solution Prisma |
|---------------------|-----------------|
| L'IA ne connait pas la structure DB | `schema.prisma` = source de verite lisible |
| Pas de versioning Git de l'architecture | `prisma/migrations/` commitees dans Git |
| Migration SQL cassee = DB perdue | Migrations avec historique, rollback possible |
| Requetes SQL = risque injection | Prisma = requetes typees et securisees |
| Pas de types | Types generes automatiquement |

### Qui fait quoi

| Action | Outil | Exemple |
|--------|-------|---------|
| CRUD server-side | Prisma | `prisma.user.findMany()` |
| CRUD client-side avec RLS | Supabase | `supabase.from('users').select()` |
| Relations complexes | Prisma | `include`, `select` nested |
| Transactions | Prisma | `prisma.$transaction()` |
| Realtime | Supabase | `supabase.channel().on()` |
| Storage | Supabase | `supabase.storage.from()` |
| Auth | Supabase | `supabase.auth.signIn()` |

---

## Configuration {#configuration}

### 1. Deux URLs (obligatoire)

Supabase expose deux types de connexions :
- **Port 6543** : Connexion "pooled" via Supavisor (proxy qui gere les connexions)
- **Port 5432** : Connexion directe a PostgreSQL

```bash
# .env

# URL poolee pour l'application (runtime)
DATABASE_URL="postgres://postgres.[project]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# URL directe pour les migrations (CLI)
DIRECT_URL="postgres://postgres.[project]:[password]@db.[project-ref].supabase.co:5432/postgres"
```

| URL | Port | Usage | Pourquoi |
|-----|------|-------|----------|
| `DATABASE_URL` | 6543 | Runtime app | Pooled = partage des connexions |
| `DIRECT_URL` | 5432 | Migrations CLI | Direct = acces complet pour DDL |

### 2. Parametres obligatoires

#### `pgbouncer=true`

Supavisor (port 6543) ne supporte pas les "prepared statements". Sans ce parametre :
```
Error: prepared statement "s0" already exists
```

#### `connection_limit=1` (serverless)

En serverless (Vercel, Lambda), chaque requete peut creer une nouvelle instance. Limiter a 1 connexion par instance evite de saturer le pool.

### 3. Schema Prisma

```prisma
// schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled (runtime)
  directUrl = env("DIRECT_URL")        // Direct (migrations)
}

generator client {
  provider = "prisma-client-js"
}
```

### 4. External tables (Prisma 7+)

Supabase cree des tables dans plusieurs schemas (`auth`, `storage`, `realtime`). Prisma peut les considerer comme du "drift" et vouloir les supprimer.

```typescript
// prisma.config.ts (Prisma 7+)
import { defineConfig } from '@prisma/client/generator-helper'

export default defineConfig({
  datasource: {
    provider: 'postgresql',
    url: env('DATABASE_URL'),
    directUrl: env('DIRECT_URL'),
    externalTables: [
      'auth.*',      // Tables auth Supabase
      'storage.*',   // Tables storage Supabase
      'realtime.*',  // Tables realtime Supabase
    ]
  }
})
```

Pour Prisma 5-6 :
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  schemas  = ["public"]  // PAS "auth", "storage", "realtime"
}
```

### 5. Shadow database

`prisma migrate dev` a besoin d'une base temporaire pour valider les migrations. Supabase ne permet pas de creer des DBs a la volee.

**Solutions :**
1. Projet Supabase gratuit dedie
2. Docker local : `docker run -p 5433:5432 -e POSTGRES_PASSWORD=shadow postgres:16`

```bash
SHADOW_DATABASE_URL="postgres://postgres:shadow@localhost:5433/postgres"
```

### 6. Client singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Choix de stack {#choix-de-stack}

### Workflow recommande

```
Phase 1 (MVP/Prototypage)        Phase 2 (Production)
────────────────────────         ────────────────────
Prisma + SQLite                  Prisma + Supabase PostgreSQL
- Zero config                    - Pooling, backups, RLS
- Fichier local (dev.db)         - Multi-user ready
- Dev ultra rapide               - Scalable
```

### Quand utiliser quoi

| Situation | Choix | Pourquoi |
|-----------|-------|----------|
| Nouveau projet, MVP, prototype | SQLite | Zero config, iteration rapide |
| App deja en prod, multi-user | PostgreSQL (Supabase) | RLS, backups, scaling |
| Single-user app definitive | SQLite peut suffire | Simple, pas de maintenance |
| Besoin Realtime/Storage | Supabase | Features natives |

### Setup SQLite

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

```bash
npx prisma db push
npx prisma generate
```

### Migration SQLite → Supabase

```bash
# 1. exporter les donnees SQLite (si besoin)
sqlite3 prisma/dev.db ".dump" > backup.sql

# 2. modifier schema.prisma
# - changer provider: "sqlite" → "postgresql"
# - ajouter url + directUrl

# 3. pousser le schema
npx prisma db push

# 4. migrer les donnees (script custom ou pgloader)
```

---

## Migrations {#migrations}

### Comparatif des commandes

| Commande | Shadow DB | Interactif | Claude Code | Migrations Git |
|----------|-----------|------------|-------------|----------------|
| `db push` | Non | Non | Oui | Non |
| `migrate dev` | Requise | Oui | Non | Oui |
| `migrate diff` | Non | Non | Oui | Oui |
| `migrate deploy` | Non | Non | Oui | Oui |

### Workflow db push (simple)

```bash
# 1. modifier schema.prisma
# 2. appliquer
npx prisma db push
# 3. commiter
git add prisma/schema.prisma && git commit
```

**Avantages** : Simple, Claude Code compatible.
**Inconvenient** : Pas de fichiers migration dans Git.

### Workflow migrations versionnees (Claude Code compatible)

```bash
# 1. modifier schema.prisma

# 2. generer le SQL
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql

# 3. creer le dossier + deplacer
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_description
mv migration.sql prisma/migrations/*/migration.sql

# 4. marquer comme appliquee
npx prisma migrate resolve --applied NOM_MIGRATION

# 5. commiter
git add prisma/ && git commit
```

### Baseline migration (projet existant)

Quand tu as une DB existante et tu veux ajouter Prisma :

```bash
# 1. introspection (genere schema.prisma depuis la DB)
npx prisma db pull

# 2. creer baseline migration (sans executer)
mkdir -p prisma/migrations/0_init

npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 3. marquer comme deja appliquee
npx prisma migrate resolve --applied 0_init

# 4. generer le client
npx prisma generate
```

### Deploiement production

```bash
npx prisma migrate deploy
```

---

## Seed idempotent {#seed-idempotent}

**Idempotent** = Executer plusieurs fois produit le meme resultat.

### Pattern upsert (recommande)

```typescript
// prisma/seed.ts
await prisma.role.upsert({
  where: { code: 'admin' },
  update: {},  // ne rien faire si existe
  create: { code: 'admin', displayName: 'Admin' },
})
```

**Condition** : Le champ doit avoir `@unique` dans le schema.

### Protection donnees utilisateur

```typescript
// Ne jamais ecraser les donnees user
if (setting.category === 'user') {
  const existing = await prisma.setting.findUnique({ where: { key } })
  if (existing) continue // skip
}
```

### createMany avec skipDuplicates

```typescript
await prisma.post.createMany({
  data: [...],
  skipDuplicates: true,
})
```

### Configuration package.json

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## RLS (Row Level Security) {#rls}

### DANGER : Prisma bypass RLS par defaut

Prisma se connecte avec le user `postgres` qui a `bypassrls`. Toutes les politiques RLS sont ignorees.

### Solution 1 : User non-superuser

```sql
-- Creer user dedie
CREATE USER prisma_user WITH PASSWORD 'secure_password';

-- Permissions
GRANT USAGE ON SCHEMA public TO prisma_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO prisma_user;
```

```bash
DATABASE_URL="postgres://prisma_user:secure_password@..."
```

### Solution 2 : Activer RLS manuellement

Les tables creees par Prisma n'ont PAS RLS active par defaut.

```sql
-- Apres chaque migration
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own posts" ON posts
FOR SELECT USING (auth.uid() = user_id);
```

### Pieges RLS

| Piege | Solution |
|-------|----------|
| Vues bypassent RLS | `WITH (security_invoker = true)` (Postgres 15+) |
| Functions "Security Definer" | Utiliser `SECURITY INVOKER` |
| Tables Prisma sans RLS | Activer manuellement apres migration |

---

## Multi-projet {#multi-projet}

Si plusieurs projets sur meme DB, utiliser un schema PostgreSQL dedie par projet.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  schemas   = ["monprojet"]  // PAS "public"
}

model Agent {
  // ...
  @@schema("monprojet")  // OBLIGATOIRE sur chaque model
}
```

```typescript
// Supabase client avec schema
const { data } = await supabase.schema('monprojet').from('agents').select('*')
```

---

## Performance {#performance}

### Connection limit

**Supabase Free Plan** :
- Max 60 connections directes (port 5432)
- Max 200 connections poolees (port 6543)

**Serverless** : `connection_limit=1` recommande.

### Eviter les N+1 queries

```typescript
// MAUVAIS - N+1
const posts = await prisma.post.findMany()
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } })
}

// BON - include
const posts = await prisma.post.findMany({
  include: { author: true }
})
```

### Limiter les champs

```typescript
// BON - seulement les champs necessaires
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
})
```

### Pagination cursor

```typescript
const posts = await prisma.post.findMany({
  take: 10,
  skip: 1,
  cursor: { id: lastPostId },
  orderBy: { createdAt: 'desc' }
})
```

---

## Erreurs communes {#erreurs}

| Erreur | Cause | Solution |
|--------|-------|----------|
| `prepared statement "s0" already exists` | Manque `pgbouncer=true` | Ajouter a DATABASE_URL |
| `P1001: Can't reach database server` | Timeout | `?connect_timeout=60` |
| `Max client connections reached` | Trop de connexions | `connection_limit=1` + port 6543 |
| `Schema drift detected` | DB modifiee hors Prisma | `prisma db pull` + baseline |
| `Unable to create shadow database` | Supabase limite | Utiliser `db push` ou `migrate diff` |
| `P3005: Table already exists` | Baseline manquante | Faire une baseline migration |

---

## Checklist production {#checklist}

### Configuration
- [ ] `DATABASE_URL` port 6543 + `?pgbouncer=true&connection_limit=1`
- [ ] `DIRECT_URL` port 5432
- [ ] Schemas declares (pas `auth`, `storage`, `realtime`)
- [ ] Shadow database configuree (si `migrate dev`)

### Securite
- [ ] User Prisma non-superuser (pas `postgres`)
- [ ] RLS active sur tables sensibles
- [ ] Politiques RLS definies

### Code
- [ ] Client Prisma singleton (`lib/prisma.ts`)
- [ ] Seed idempotent (upsert)
- [ ] Migrations commitees dans Git

### CI/CD
- [ ] `prisma generate` dans le build
- [ ] `prisma migrate deploy` avant deploiement
- [ ] Variables d'environnement configurees

---

## Scripts npm recommandes

```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:pull": "prisma db pull",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "postinstall": "prisma generate"
  }
}
```

---

## Ressources

- [Prisma with Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase)
- [Supabase Prisma Guide](https://supabase.com/docs/guides/database/prisma)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate)
- [Connection Pooling](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)

---

*Derniere mise a jour : 2025-01*
