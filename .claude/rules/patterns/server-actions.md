---
paths: "**/*.action.ts, **/actions/**"
---

# server actions conventions

## nommage

- fichiers : `[name].action.ts`
- fonctions : suffixe `Action` (ex: `createUserAction`)

## structure

```typescript
"use server"

import { z } from "zod"
import { authAction } from "@/lib/safe-action"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

export const createUserAction = authAction
  .schema(schema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await prisma.user.create({
      data: {
        ...parsedInput,
        createdBy: ctx.user.id,
      },
    })
    return { success: true, user }
  })
```

## types d'actions

- `action` : sans auth
- `authAction` : avec user connecte
- `adminAction` : avec role admin
