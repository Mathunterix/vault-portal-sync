---
paths: "**/services/**,**/repositories/**,**/actions/**"
---

# architecture 3-layer

architecture stricte pour projets next.js + supabase.

## les 3 couches

```
UI (components) → Server Actions → Services → Repositories → Database
```

| couche | role | peut appeler |
|--------|------|--------------|
| **UI** | affichage uniquement | server actions seulement |
| **Services** | logique métier | repositories |
| **Repositories** | accès données | supabase/prisma |

## règles strictes

### UI / components
- jamais d'accès direct à supabase
- jamais de `createClient` dans un component
- appeler uniquement les server actions

### server actions (`actions/*.action.ts`)
- point d'entrée unique pour les mutations
- valider les inputs avec zod
- appeler les services, pas les repositories directement

### services (`services/*.service.ts`)
- toute la logique métier ici
- jamais d'accès direct à la db
- retourner des DTOs, pas des rows bruts

### repositories (`db/repositories/*.repository.ts`)
- opérations db uniquement
- pas de logique métier
- utilisé uniquement par les services

## workflow pour nouvelle feature

```
1. définir l'entité (types)
2. créer le validator zod
3. créer le repository
4. créer le service
5. créer la server action
6. créer l'UI
```

## exemple

```typescript
// ❌ mauvais - accès direct depuis UI
export function UserList() {
  const users = await supabase.from('users').select('*')
  return <ul>{users.map(...)}</ul>
}

// ✅ bon - passer par les couches
// 1. repository
export const userRepository = {
  findAll: () => supabase.from('users').select('*')
}

// 2. service
export const userService = {
  getActiveUsers: async () => {
    const { data } = await userRepository.findAll()
    return data?.filter(u => u.status === 'active') ?? []
  }
}

// 3. action
export async function getUsers() {
  return userService.getActiveUsers()
}

// 4. UI
export function UserList() {
  const users = await getUsers()
  return <ul>{users.map(...)}</ul>
}
```
