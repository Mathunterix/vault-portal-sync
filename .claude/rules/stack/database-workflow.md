---
description: "Choix de stack DB et migrations. S'applique lors de création de projet ou migration."
---

# database workflow

guide pour choisir et faire evoluer la stack. doc complete : `docs/doc-externe/integration_prisma/`

## choix initial

| situation | choix | pourquoi |
|-----------|-------|----------|
| MVP, prototype | SQLite | zero config, iteration rapide |
| multi-user, prod | PostgreSQL (Supabase) | RLS, backups, scaling |
| single-user definitif | SQLite peut suffire | simple |

## setup SQLite (phase 1)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

```bash
npx prisma db push
```

## setup Supabase (phase 2)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // port 6543, pooled
  directUrl = env("DIRECT_URL")     // port 5432, direct
}
```

## migrations : quelle commande ?

| commande | usage | claude code compatible |
|----------|-------|------------------------|
| `db push` | dev rapide, prototype | oui |
| `migrate dev` | migrations versionnees | non (interactif) |
| `migrate deploy` | production CI/CD | oui |
| `migrate diff` | generer SQL sans shadow DB | oui |

### workflow recommande (db push)

```bash
# 1. modifier schema.prisma
# 2. appliquer
npx prisma db push
# 3. commiter
git add prisma/schema.prisma && git commit
```

### workflow migrations versionnees (claude code compatible)

```bash
# 1. modifier schema.prisma
# 2. generer le SQL
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
# 3. creer dossier + deplacer
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_description
mv migration.sql prisma/migrations/*/migration.sql
# 4. marquer comme appliquee
npx prisma migrate resolve --applied NOM_MIGRATION
```

## baseline migration (projet existant)

quand tu as une DB existante et tu veux ajouter prisma :

```bash
# 1. introspection
npx prisma db pull

# 2. creer baseline sans executer
mkdir -p prisma/migrations/0_init
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 3. marquer comme appliquee
npx prisma migrate resolve --applied 0_init
```

## shadow database

`migrate dev` a besoin d'une shadow DB. supabase ne permet pas de creer des DBs a la volee.

solutions :
1. projet supabase gratuit dedie
2. docker local : `docker run -p 5433:5432 -e POSTGRES_PASSWORD=shadow postgres:16`

```bash
SHADOW_DATABASE_URL="postgres://postgres:shadow@localhost:5433/postgres"
```

## scripts npm

```json
{
  "db:push": "prisma db push",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio",
  "db:deploy": "prisma migrate deploy",
  "postinstall": "prisma generate"
}
```
