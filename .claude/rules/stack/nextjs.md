---
paths: "app/**, **/api/**, **/actions/**"
---

# next.js app router conventions

## structure

```
app/
├── (auth)/           # groupe de routes
│   ├── login/
│   └── register/
├── api/              # api routes
│   └── [route]/
├── layout.tsx        # layout racine
└── page.tsx          # page d'accueil
```

## server vs client

- **server components** par defaut (pas de directive)
- **`use client`** seulement pour : useState, useEffect, event handlers, browser APIs
- **server actions** pour mutations (fichiers .action.ts)

## metadata

```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}
```
