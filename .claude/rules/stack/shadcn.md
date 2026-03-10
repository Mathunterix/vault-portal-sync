---
paths: "**/components/ui/**, **/components/**/*.tsx"
---

# shadcn/ui conventions

## utilisation

- verifier d'abord si le composant existe dans `components/ui/`
- installer avec `npx shadcn@latest add [component]`
- ne pas modifier les fichiers dans `components/ui/` directement

## customisation

```typescript
// wrapper pour customiser
import { Button } from '@/components/ui/button'

export function PrimaryButton({ children, ...props }) {
  return (
    <Button variant="default" size="lg" {...props}>
      {children}
    </Button>
  )
}
```

## tailwind

- utiliser les classes tailwind
- utiliser `cn()` pour merger les classes conditionnellement

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />
```
