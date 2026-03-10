---
paths: "**/*.ts, **/*.tsx"
---

# typescript conventions

## types

- prefer `type` over `interface` sauf pour extension
- types explicites pour fonctions publiques
- generics nommes de facon explicite (pas `T`, mais `TData`)

## patterns

```typescript
// types pour props
type ButtonProps = {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

// types pour api response
type ApiResponse<T> = {
  data: T
  error: string | null
}

// zod pour validation runtime
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
})
type User = z.infer<typeof userSchema>
```
