# structure du projet

> genere par `/update-conventions`

## vue d'ensemble

```
[ARBORESCENCE A GENERER]
```

## organisation des dossiers

| dossier | role | conventions |
|---------|------|-------------|
| `app/` | routes next.js | app router |
| `components/` | composants react | |
| `components/ui/` | shadcn/ui | ne pas modifier |
| `lib/` | utilitaires | |
| `actions/` | server actions | *.action.ts |
| `types/` | types typescript | |

## fichiers importants

| fichier | role |
|---------|------|
| `prisma/schema.prisma` | schema db |
| `lib/prisma.ts` | client prisma |
| `lib/supabase/` | clients supabase |

## composants reutilisables

avant de creer un nouveau composant, verifier :

| composant | emplacement | usage |
|-----------|-------------|-------|
| [a completer] | | |

---

*regenerer avec `/update-conventions`*
