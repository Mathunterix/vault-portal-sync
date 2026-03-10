---
paths: "**/*.tsx, **/components/**"
---

# react conventions

## structure composant

```typescript
// 1. imports
import { useState } from 'react'

// 2. types
type Props = { ... }

// 3. composant
export function MyComponent({ prop }: Props) {
  // hooks en premier
  const [state, setState] = useState()
  
  // handlers
  const handleClick = () => { ... }
  
  // render
  return (...)
}
```

## bonnes pratiques

- composants fonctionnels uniquement
- hooks custom pour logique reutilisable
- `use client` seulement quand necessaire
- preferer server components par defaut
