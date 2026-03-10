---
name: update-conventions
description: Regenerate project structure and tech stack documentation. Updates docs/memory-bank/structure.md and tech-stack.md by scanning the codebase. Use after structural changes or new dependencies.
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Bash(tree *), Bash(cat package.json)
---

# Update Conventions

Regenere les fichiers de conventions du projet dans `docs/memory-bank/`.

## Etape 1 : Generer la structure

```bash
tree -I 'node_modules|dist|.git|.next|__pycache__|.venv|coverage|build|.claude|.bmad|changes' -L 3
```

Analyse le resultat pour identifier :
- Organisation des dossiers et leurs roles
- Conventions de nommage observees
- Fichiers importants
- Patterns d'architecture

## Etape 2 : Mettre a jour structure.md

Mets a jour `docs/memory-bank/structure.md` :

```markdown
# structure du projet

> genere par `/update-conventions`

## vue d'ensemble

[ARBORESCENCE TREE]

## organisation des dossiers

| dossier | role | conventions |
|---------|------|-------------|
| `app/` | routes next.js | app router |

## fichiers importants

| fichier | role |
|---------|------|
| `prisma/schema.prisma` | schema db |

## composants reutilisables

| composant | emplacement | usage |
|-----------|-------------|-------|
| Button | components/ui/button.tsx | bouton standard |

---
*regenerer avec `/update-conventions`*
*derniere maj : [DATE]*
```

## Etape 3 : Analyser le tech stack

Lis `package.json` et identifie :
- Framework principal et version
- Dependencies majeures par categorie
- Scripts disponibles
- Variables d'environnement (depuis .env.example ou code)

## Etape 4 : Mettre a jour tech-stack.md

Mets a jour `docs/memory-bank/tech-stack.md` :

```markdown
# tech stack

> genere par `/update-conventions`

## framework principal

| framework | version | documentation |
|-----------|---------|---------------|
| next.js | [version] | https://nextjs.org/docs |

## dependencies principales

### core
| package | version | usage |
|---------|---------|-------|

### ui
| package | version | usage |
|---------|---------|-------|

## scripts npm

| script | commande | usage |
|--------|----------|-------|
| dev | `pnpm dev` | developpement |

## variables d'environnement

| variable | description | obligatoire |
|----------|-------------|-------------|

---
*regenerer avec `/update-conventions`*
*derniere maj : [DATE]*
```

## Etape 5 : Confirmer

```
## Conventions mises a jour

- [x] structure.md : [N] dossiers, [N] composants
- [x] tech-stack.md : [framework] [version], [N] deps, [N] scripts

---
Conventions regenerees.
```

## Regles

- Garder les fichiers sous 200 lignes chacun
- Focus sur les regles actionables
- Les fichiers sont dans `docs/memory-bank/` (pas `docs/`)
