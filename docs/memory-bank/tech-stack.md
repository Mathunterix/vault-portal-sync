# tech stack

> genere par `/update-conventions`

## framework principal

| framework | version | documentation |
|-----------|---------|---------------|
| next.js | 15.x | https://nextjs.org/docs |
| react | 19.x | https://react.dev |

## dependencies principales

### core

| package | version | usage |
|---------|---------|-------|
| typescript | 5.x | typage |
| prisma | 6.x | orm |
| @supabase/supabase-js | 2.x | client supabase |

### ui

| package | version | usage |
|---------|---------|-------|
| tailwindcss | 4.x | styles |
| shadcn/ui | latest | composants |

### validation

| package | version | usage |
|---------|---------|-------|
| zod | 3.x | validation schemas |
| next-safe-action | 7.x | server actions typees |

## scripts npm

| script | commande | usage |
|--------|----------|-------|
| dev | `pnpm dev` | developpement |
| build | `pnpm build` | production |
| lint | `pnpm lint` | linting |
| db:push | `npx prisma db push` | sync schema |
| db:studio | `npx prisma studio` | gui prisma |

## variables d'environnement

| variable | description | obligatoire |
|----------|-------------|-------------|
| DATABASE_URL | url postgres | oui |
| NEXT_PUBLIC_SUPABASE_URL | url supabase | oui |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | cle publique | oui |
| SUPABASE_SERVICE_ROLE_KEY | cle admin | oui (server) |

---

*regenerer avec `/update-conventions`*
