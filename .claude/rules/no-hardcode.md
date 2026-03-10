# pas de valeurs hardcodees

## utiliser config/env

| type | ou le mettre |
|------|--------------|
| secrets | `.env.local` (jamais commite) |
| config publique | `.env` ou config.ts |
| urls api | variables d'environnement |
| feature flags statiques | config ou env |
| config dynamique (sans redeploy) | table settings en DB (voir `runtime-config.md`) |

## exemple

```typescript
// mauvais
const apiUrl = "https://api.example.com"

// bon
const apiUrl = process.env.NEXT_PUBLIC_API_URL

// mauvais
if (userId === "123") { ... }

// bon
if (userId === process.env.ADMIN_USER_ID) { ... }
```
