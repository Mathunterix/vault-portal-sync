---
paths: "**/api/**/*.ts, **/api/**/route.ts"
---

# api routes conventions

## structure

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // validation avec zod
  const validated = schema.parse(body)
  const user = await prisma.user.create({ data: validated })
  return NextResponse.json(user, { status: 201 })
}
```

## bonnes pratiques

- toujours valider les inputs avec zod
- gerer les erreurs avec try/catch
- retourner les bons status codes
- preferer server actions pour mutations simples
