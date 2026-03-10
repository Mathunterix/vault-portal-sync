---
description: Regenerate project structure and tech stack documentation
---

# Update Conventions

Regenere les fichiers de conventions du projet dans `docs/memory-bank/`.

## Etape 1: Generer la structure

Execute la commande tree pour obtenir l'arborescence :

```bash
tree -I 'node_modules|dist|.git|.next|__pycache__|.venv|coverage|build|.claude|.bmad|changes' -L 3
```

Analyse le resultat pour identifier :
- Organisation des dossiers et leurs roles
- Conventions de nommage observees
- Fichiers importants
- Patterns d'architecture

## Etape 2: Mettre a jour structure.md

Mets a jour le fichier `docs/memory-bank/structure.md` avec :

```markdown
# structure du projet

> genere par `/update-conventions`

## vue d'ensemble

\`\`\`
[ARBORESCENCE TREE]
\`\`\`

## organisation des dossiers

| dossier | role | conventions |
|---------|------|-------------|
| `app/` | routes next.js | app router |
| ... | ... | ... |

## fichiers importants

| fichier | role |
|---------|------|
| `prisma/schema.prisma` | schema db |
| ... | ... |

## composants reutilisables

| composant | emplacement | usage |
|-----------|-------------|-------|
| Button | components/ui/button.tsx | bouton standard |
| ... | ... | ... |

---

*regenerer avec `/update-conventions`*
*derniere maj : [DATE]*
```

## Etape 3: Analyser le tech stack

Lis le fichier `package.json`.

Identifie :
- Framework principal et version
- Dependencies majeures par categorie
- Scripts disponibles
- Variables d'environnement (depuis .env.example ou code)

## Etape 4: Mettre a jour tech-stack.md

Mets a jour le fichier `docs/memory-bank/tech-stack.md` avec :

```markdown
# tech stack

> genere par `/update-conventions`

## framework principal

| framework | version | documentation |
|-----------|---------|---------------|
| next.js | [version] | https://nextjs.org/docs |
| react | [version] | https://react.dev |

## dependencies principales

### core

| package | version | usage |
|---------|---------|-------|
| typescript | [version] | typage |
| ... | ... | ... |

### ui

| package | version | usage |
|---------|---------|-------|
| tailwindcss | [version] | styles |
| ... | ... | ... |

## scripts npm

| script | commande | usage |
|--------|----------|-------|
| dev | `pnpm dev` | developpement |
| ... | ... | ... |

## variables d'environnement

| variable | description | obligatoire |
|----------|-------------|-------------|
| DATABASE_URL | url postgres | oui |
| ... | ... | ... |

---

*regenerer avec `/update-conventions`*
*derniere maj : [DATE]*
```

## Etape 5: Confirmer

```
## Conventions mises a jour

### docs/memory-bank/structure.md
- [x] Arborescence regeneree
- [x] [N] dossiers documentes
- [x] [N] composants reutilisables identifies

### docs/memory-bank/tech-stack.md
- [x] Framework: [nom] [version]
- [x] [N] dependencies documentees
- [x] [N] scripts npm documentes

---
Conventions regenerees.
```

## Notes

- Garde les fichiers sous 200 lignes chacun
- Focus sur les regles actionables, pas les descriptions
- Inclus des exemples de code pour les patterns importants
- Les fichiers sont dans `docs/memory-bank/` (pas `docs/`)
