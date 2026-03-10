---
paths: "**/*.prisma, **/prisma/**, **/lib/prisma/**, **/lib/db/**"
---

# prisma + supabase

best practices quotidiennes. doc complete : `docs/doc-externe/integration_prisma/`

## architecture

| action | outil |
|--------|-------|
| CRUD server-side | prisma |
| CRUD client-side avec RLS | supabase client |
| relations complexes, transactions | prisma |
| realtime, storage, auth | supabase client |

## configuration obligatoire

### deux URLs

```bash
# Runtime (pooled)
DATABASE_URL="postgres://...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Migrations (direct)
DIRECT_URL="postgres://...supabase.co:5432/postgres"
```

### schema.prisma

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## client singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## seed idempotent

```typescript
// toujours upsert, jamais create seul
await prisma.role.upsert({
  where: { code: 'admin' },
  update: {},
  create: { code: 'admin', displayName: 'Admin' },
})
```

## pieges critiques

| action | consequence |
|--------|-------------|
| `prisma migrate reset` | **DETRUIT TOUT** (auth, storage inclus) |
| `db push` en prod | pas de rollback possible |
| oublier `pgbouncer=true` | erreur "prepared statement already exists" |
| user `postgres` pour prisma | RLS ignore |

## erreurs communes

| erreur | solution |
|--------|----------|
| `prepared statement "s0" already exists` | ajouter `?pgbouncer=true` |
| `P1001: Can't reach database server` | `?connect_timeout=60` |
| `Max client connections reached` | `connection_limit=1` + port 6543 |

## RLS

prisma avec user `postgres` = bypass RLS. solutions :
1. creer user non-superuser dedie
2. activer RLS manuellement apres chaque migration

## multi-projet (schema dedie)

```prisma
datasource db {
  schemas = ["monprojet"]  // pas "public"
}

model Agent {
  @@schema("monprojet")  // sur chaque model
}
```

```typescript
// supabase client
await supabase.schema('monprojet').from('agents').select('*')
```
