# pas de any

typescript strict = pas de any

## alternatives a any

| situation | utiliser |
|-----------|----------|
| type inconnu | `unknown` |
| objet quelconque | `Record<string, unknown>` |
| fonction quelconque | `(...args: unknown[]) => unknown` |
| json parse | `as` cast apres validation |

## exemple

```typescript
// mauvais
const data: any = JSON.parse(response)

// bon
const data = JSON.parse(response) as unknown
const validated = schema.parse(data) // validation zod
```
