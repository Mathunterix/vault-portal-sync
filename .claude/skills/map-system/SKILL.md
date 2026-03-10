---
name: map-system
description: Create comprehensive system design documentation for complex projects. Generates C4-style diagrams (Mermaid), data flows, and arc42-lite overview. Use manually when a project grows complex and needs visual architecture documentation.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(tree *), Bash(ls *), Bash(mkdir *)
argument-hint: "[full | diagrams | flows | overview]"
---

# Map System

Cree une documentation visuelle de l'architecture pour les projets complexes.

**Quand utiliser** : Manuellement, quand tu sens que le projet devient complexe et qu'un graphe des interactions aiderait a comprendre.

Charge `references/templates.md` pour les templates de diagrammes.

## Ce que ce skill cree

```
docs/system-design/
├── README.md             # Vue d'ensemble arc42-lite
├── diagrams/
│   ├── system-context.md    # C4 Level 1 : systeme dans son environnement
│   ├── containers.md        # C4 Level 2 : unites deployables
│   └── data-flow.md         # Flux de donnees principal
└── flows/
    └── [flow-name].md       # Diagrammes de sequence (auth, checkout, etc.)
```

**Format** : Fichiers `.md` avec blocs mermaid (pas `.mmd`).
- Preview VS Code avec "Markdown Preview Mermaid Support"
- Rendu natif GitHub
- Permet d'ajouter du contexte autour des diagrammes

## Etape 1 : Analyser le projet

Lire pour comprendre l'architecture :
- `docs/memory-bank/context.md` - focus actuel
- `docs/memory-bank/structure.md` - arborescence
- `docs/memory-bank/tech-stack.md` - stack
- `docs/memory-bank/features/INDEX.md` - graphe des dependances entre features

Scanner le code si besoin :
- `app/` pour les routes
- `src/lib/` ou `lib/` pour les services
- `prisma/schema.prisma` pour le modele de donnees

## Etape 2 : Creer la structure

```bash
mkdir -p docs/system-design/diagrams docs/system-design/flows
```

## Etape 3 : Generer les diagrammes

### 3.1 system-context.md (C4 Level 1)

Montre le systeme dans son environnement :
- Qui l'utilise (users, admins)
- Quels systemes externes (Stripe, Supabase, SendGrid, etc.)

```markdown
# System Context (C4 Level 1)

Description du systeme dans son environnement.

## Diagramme

\`\`\`mermaid
graph TD
    User[Utilisateur] --> App[Application]
    Admin[Admin] --> App
    App --> Supabase[(Supabase)]
    App --> Stripe[Stripe API]
    App --> Resend[Resend Emails]
\`\`\`

## Acteurs / Systemes externes
| Element | Description |
|---------|-------------|
| ... | ... |
```

### 3.2 containers.md (C4 Level 2)

Montre les unites deployables :
- Frontend (Next.js)
- API (routes, server actions)
- Database (PostgreSQL)
- Services externes

### 3.3 data-flow.md

Montre comment les donnees circulent :
- De l'input utilisateur
- A travers les transformations
- Jusqu'au stockage

### 3.4 flows/*.md (Sequences)

Pour chaque flow complexe (auth, checkout, etc.) :

```markdown
# Auth Flow

Description du flow.

## Diagramme

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database

    U->>F: Action
    F->>A: Request
    A->>D: Query
    D-->>A: Result
    A-->>F: Response
    F-->>U: Update UI
\`\`\`

## Points cles
- Point 1
- Point 2
```

## Etape 4 : Creer README.md (arc42-lite)

Vue d'ensemble avec :
1. Introduction et objectifs
2. Contraintes techniques
3. Contexte (lien vers system-context.mmd)
4. Strategie de solution
5. Vue deploiement
6. Decisions (lien vers decisions/)
7. Risques et dette technique

## Etape 5 : Confirmer

```
## System Design cree

**Dossier** : docs/system-design/

### Fichiers generes
- [x] README.md (arc42-lite)
- [x] diagrams/system-context.md
- [x] diagrams/containers.md
- [x] diagrams/data-flow.md
- [x] flows/[N] diagrammes de sequence (.md)

### Prochaines etapes
- Reviser les diagrammes
- Ajouter des flows manquants avec `/map-system flows`
- Mettre a jour quand l'architecture change
```

## Options

| Argument | Action |
|----------|--------|
| (aucun) ou `full` | Genere tout |
| `diagrams` | Seulement les diagrammes C4 |
| `flows` | Seulement les diagrammes de sequence |
| `overview` | Seulement le README arc42-lite |

## Regles

- **Fichiers `.md`** avec blocs ` ```mermaid ` (pas de `.mmd`)
- Preview VS Code + rendu GitHub natif
- Garder les diagrammes **simples** (7-9 elements max)
- **Labels courts** (3-4 mots)
- Flow **gauche-droite** ou **haut-bas**
- Ajouter du contexte (tableaux, points cles) autour des diagrammes
- Mettre a jour manuellement quand l'architecture evolue
