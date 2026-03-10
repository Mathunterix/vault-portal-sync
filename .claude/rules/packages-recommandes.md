# packages recommandés

quand tu as besoin de ces fonctionnalités, utilise ces packages.

## base de données

| besoin | package | pourquoi |
|--------|---------|----------|
| ORM | `prisma` | schema-first, types auto, migrations |

## état / données

| besoin | package | pourquoi |
|--------|---------|----------|
| query params URL | `nuqs` | type-safe, sync avec URL |
| state global | `zustand` | simple, pas de boilerplate |
| fetching / cache | `tanstack-query` | cache, invalidation, loading states |

## formulaires / validation

| besoin | package | pourquoi |
|--------|---------|----------|
| validation schemas | `zod` | inference TS, composable |
| formulaires | `react-hook-form` + `zod` | performant, validation intégrée |
| server actions typées | `next-safe-action` | type-safe, error handling |

## dates / utils

| besoin | package | pourquoi |
|--------|---------|----------|
| manipulation dates | `date-fns` | léger, immutable, tree-shakable |
| formatage relatif | `date-fns/formatDistanceToNow` | "il y a 5 min" |

## UI

| besoin | package | pourquoi |
|--------|---------|----------|
| composants | `shadcn/ui` | accessible, customizable |
| icônes | `lucide-react` | cohérent avec shadcn |
| toast/notifications | `sonner` | simple, beau |

## ne pas utiliser

| éviter | utiliser à la place |
|--------|---------------------|
| `moment.js` | `date-fns` (plus léger) |
| `axios` | `fetch` natif (suffisant avec next.js) |
| `redux` | `zustand` (plus simple) |
| `URLSearchParams` manuel | `nuqs` (type-safe) |
