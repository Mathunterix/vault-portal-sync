# configuration runtime (table settings)

pour la config modifiable sans redéploiement → table settings en DB.

## quand utiliser quoi

| type | où | pourquoi |
|------|-----|----------|
| feature flags dynamiques | DB settings | toggle sans redeploy |
| valeurs business (prix, limites, seuils) | DB settings | ajustable par admin |
| messages/textes éditables | DB settings | modifiable sans dev |
| config UI (couleurs, labels) | DB settings | personnalisable |
| **secrets, API keys** | **env vars** | sécurité (jamais en DB) |
| **URLs par environnement** | **env vars** | différent dev/staging/prod |

## schema prisma

```prisma
model Setting {
  key         String   @id
  value       Json
  description String?
  updatedAt   DateTime @updatedAt
}
```

## pattern d'accès

```typescript
// lib/settings.ts
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// cache en mémoire (simple)
let cache: Map<string, unknown> = new Map()
let cacheTime = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function getSetting<T>(
  key: string,
  schema: z.ZodType<T>,
  fallback: T
): Promise<T> {
  // invalidate cache si TTL dépassé
  if (Date.now() - cacheTime > CACHE_TTL) {
    cache.clear()
    cacheTime = Date.now()
  }

  if (cache.has(key)) {
    return cache.get(key) as T
  }

  try {
    const setting = await prisma.setting.findUnique({ where: { key } })
    const value = setting ? schema.parse(setting.value) : fallback
    cache.set(key, value)
    return value
  } catch {
    return fallback
  }
}

// usage
const maxUploadSize = await getSetting(
  "app.upload.maxSize",
  z.number(),
  10 * 1024 * 1024 // 10MB fallback
)
```

## conventions de nommage

```
app.feature.setting

exemples:
- app.upload.maxSize
- app.auth.sessionDuration
- billing.stripe.priceId
- ui.theme.primaryColor
```

## sécurité supabase (RLS)

```sql
-- lecture publique (ou authentifiée selon besoin)
CREATE POLICY "Settings are readable by all"
ON settings FOR SELECT USING (true);

-- écriture admin only
CREATE POLICY "Settings are editable by admins"
ON settings FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

## ne pas mettre en DB

- secrets (API keys, tokens) → toujours env vars
- config qui change par environnement → env vars
- valeurs critiques pour le boot de l'app → env vars
