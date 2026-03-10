# Stack Vibedev - Vue Architecte

Decisions architecturales et positionnement de chaque element de la stack.

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   NAVIGATEUR (client)                                                   │
│   ├── React (UI, composants)                                            │
│   ├── Client Components ("use client")                                  │
│   └── shadcn/ui (design system)                                         │
│              │                                                           │
│              │ HTTP / Server Actions                                    │
│              ▼                                                           │
│   SERVEUR (Next.js)                                                     │
│   ├── Server Components (par defaut)                                    │
│   ├── Server Actions (mutations)                                        │
│   ├── API Routes (webhooks, API publique)                               │
│   └── Middleware (auth, redirects)                                      │
│              │                                                           │
│              │ Prisma ORM                                               │
│              ▼                                                           │
│   BASE DE DONNEES (Supabase)                                            │
│   ├── PostgreSQL (stockage)                                             │
│   ├── Auth (authentification)                                           │
│   ├── Storage (fichiers)                                                │
│   └── Realtime (optionnel)                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Decisions par couche

### Frontend : React + Next.js

| Decision | Pourquoi | Alternative ecartee |
|----------|----------|---------------------|
| React | Ecosysteme, composants, hooks | Vue, Svelte (moins de jobs, moins de libs) |
| Next.js | SSR, routing, optimisations | Remix (moins mature), Vite (pas de SSR natif) |
| App Router | Server Components, simplicite | Pages Router (legacy) |
| shadcn/ui | Customisable, accessible, Tailwind | MUI (lourd), Chakra (moins flexible) |

### Langage : TypeScript

| Decision | Pourquoi | Alternative ecartee |
|----------|----------|---------------------|
| TypeScript strict | Erreurs detectees tot, autocompletion | JavaScript (erreurs en prod) |
| Zod | Validation runtime, inference | Yup (moins bien integre TS) |

### Data : Prisma + Supabase

| Decision | Pourquoi | Alternative ecartee |
|----------|----------|---------------------|
| PostgreSQL | Standard, robuste, extensions | MongoDB (pas relationnel) |
| Supabase | Hebergement, auth, storage inclus | Self-hosted (maintenance) |
| Prisma pour CRUD | Types auto, logique visible | Supabase client (logique cachee dans RPC) |
| Supabase pour Auth | OAuth, sessions, RLS | NextAuth (plus de config) |

### Ou mettre la logique ?

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REGLE : "La DB stocke, le code decide"               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   DANS LE CODE (TypeScript)          DANS LA DB (SQL)                   │
│   ─────────────────────────          ────────────────                   │
│   ✅ Logique metier                  ✅ Stockage                        │
│   ✅ Validations                     ✅ Indexes                         │
│   ✅ Calculs                         ✅ Contraintes (NOT NULL, FK)      │
│   ✅ Conditions (if/else)            ✅ PostGIS (geo)                   │
│   ✅ Orchestration                   ✅ Agregations 100k+ lignes        │
│                                                                          │
│   ❌ Logique dans des RPC            ❌ Logique metier complexe         │
│      (invisible, non testable)          (maintenance difficile)         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Limites de chaque element

### Next.js

| Force | Limite | Alternative si besoin |
|-------|--------|----------------------|
| SSR integre | Lock-in Vercel partiel | Self-host Docker |
| Server Components | Courbe d'apprentissage | Client-only si simple |
| Optimisations auto | Complexite debugging | Vite pour SPA simple |

### Prisma

| Force | Limite | Alternative si besoin |
|-------|--------|----------------------|
| Types auto | Requetes complexes difficiles | $queryRaw pour SQL brut |
| Migrations | Pas de PostGIS natif | Supabase client pour geo |
| Schema source de verite | Overhead sur grosses tables | SQL direct pour perfs critiques |

### Supabase

| Force | Limite | Alternative si besoin |
|-------|--------|----------------------|
| Tout inclus | Vendor lock-in | PostgreSQL self-hosted |
| Auth facile | Moins flexible que custom | NextAuth si besoin specifique |
| Realtime | Couteux a scale | Pusher, Socket.io |

### TypeScript

| Force | Limite | Alternative si besoin |
|-------|--------|----------------------|
| Securite compile-time | Pas de garantie runtime | Zod pour validation |
| Autocompletion | Verbosity | JSDoc pour petits projets |
| Refactoring sur | Temps de compilation | esbuild, swc |

## Patterns architecturaux

### Server Actions vs API Routes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   SERVER ACTIONS                      API ROUTES                        │
│   ──────────────                      ──────────                        │
│   Mutations internes                  API publique                      │
│   Formulaires                         Webhooks                          │
│   CRUD simple                         Integrations externes             │
│   Revalidation auto                   Endpoints stables                 │
│                                                                          │
│   Exemple: creer un user             Exemple: webhook Stripe            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Server Components vs Client Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   SERVER COMPONENT (defaut)           CLIENT COMPONENT ("use client")   │
│   ─────────────────────────           ───────────────────────────────   │
│   Fetch data                          Interactivite (onClick, etc.)    │
│   Acces DB direct                     State (useState)                  │
│   Code secret                         Effets (useEffect)                │
│   SEO (rendu serveur)                 Hooks React                       │
│                                                                          │
│   Limite: pas d'interactivite         Limite: pas d'acces DB direct    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Ou valider les donnees ?

```
INPUT UTILISATEUR
       │
       ▼
┌──────────────────┐
│  Zod (frontend)  │  ← Feedback immediat, UX
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Zod (server)    │  ← Securite, ne jamais faire confiance au client
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Prisma (types)  │  ← Coherence avec le schema
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  PostgreSQL      │  ← Contraintes ultimes (NOT NULL, FK)
└──────────────────┘
```

## Resume des choix

| Besoin | Outil | Pourquoi celui-la |
|--------|-------|-------------------|
| UI | React + shadcn | Ecosysteme, accessibilite |
| Framework | Next.js 15 | SSR, App Router, DX |
| Langage | TypeScript strict | Erreurs tot, autocompletion |
| ORM | Prisma | Types auto, logique visible |
| DB | Supabase (PostgreSQL) | Tout inclus, scale facile |
| Validation | Zod | Inference TS, composable |
| Auth | Supabase Auth | OAuth simple, RLS |
| State URL | nuqs | Type-safe, sync URL |
| State global | Zustand | Simple, pas de boilerplate |
