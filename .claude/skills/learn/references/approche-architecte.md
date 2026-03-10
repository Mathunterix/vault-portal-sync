# Approche Architecte

Comment expliquer un concept comme un architecte parle a un autre architecte.

## La difference

```
Tutoriel                          Discussion architecte
─────────────────────────         ───────────────────────────────
"Voici comment utiliser X"        "X existe parce que Y etait un probleme"
Commence par le code              Commence par le contexte
"Fais ca, puis ca"                "Voici les options et leurs trade-offs"
Focus sur le COMMENT              Focus sur le POURQUOI et le OU
Suppose que le choix est fait     Explique pourquoi ce choix
```

## Structure d'explication

### 1. Situer dans le paysage (TOUJOURS en premier)

Avant d'expliquer ce que c'est, montrer OU ca se place.

```
┌─────────────────────────────────────────────────────────────┐
│                     L'ECOSYSTEME                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [Ce qui est au-dessus - qui utilise ce concept]           │
│                          ↓                                   │
│   ┌─────────────────────────────────────────┐               │
│   │     LE CONCEPT QU'ON EXPLIQUE           │ ← on est ici  │
│   └─────────────────────────────────────────┘               │
│                          ↓                                   │
│   [Ce qui est en-dessous - ce que ca utilise]               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Le probleme historique

"Avant [concept], on faisait [ancienne methode]. Le probleme :"
- Probleme 1
- Probleme 2

"[Concept] a ete cree pour resoudre ca."

### 3. Les alternatives (CRUCIAL)

Toujours presenter les autres options. Un architecte doit savoir ce qu'il n'a PAS choisi.

| Solution | Forces | Faiblesses | Quand choisir |
|----------|--------|------------|---------------|
| Option A | ... | ... | Si priorite X |
| Option B | ... | ... | Si priorite Y |
| **Celle qu'on utilise** | ... | ... | Notre contexte |

### 4. Les limites (aussi important que les forces)

"Ce concept n'est PAS adapte pour :"
- Cas 1 → utiliser [alternative] a la place
- Cas 2 → utiliser [autre alternative]

### 5. Les trade-offs (etre honnete)

| Ce qu'on gagne | Ce qu'on perd |
|----------------|---------------|
| Avantage 1 | Inconvenient 1 |
| Avantage 2 | Inconvenient 2 |

### 6. En pratique (optionnel, sur demande)

Seulement si l'utilisateur veut approfondir. Ne pas imposer les details.

## Questions a poser

Questions d'architecte, pas de tuteur :

| Contexte | Question |
|----------|----------|
| Clarifier le besoin | "Quelle contrainte tu essaies de resoudre ?" |
| Comprendre le contexte | "C'est pour un nouveau projet ou tu refactores ?" |
| Identifier les priorites | "Tu privilegies la simplicite ou la flexibilite ?" |
| Valider les hypotheses | "Tu as deja envisage [alternative] ?" |

## Exemples de reponses

### Exemple 1 : "C'est quoi Server Actions ?"

**Reponse architecte** :

```
## Position dans la stack

┌───────────────────────────────────────────────────────────┐
│   Client (navigateur)                                      │
│   └── Composant React avec formulaire                     │
│              │                                             │
│              │ appelle directement (pas de fetch)         │
│              ▼                                             │
│   ┌─────────────────────────────────────┐                 │
│   │      SERVER ACTION                   │ ← on est ici   │
│   │      (fonction 'use server')         │                 │
│   └─────────────────────────────────────┘                 │
│              │                                             │
│              ▼                                             │
│   Serveur (base de donnees, services)                     │
└───────────────────────────────────────────────────────────┘

## Le probleme que ca resout

Avant : pour envoyer des donnees du client au serveur, il fallait :
1. Creer une route API (/api/users)
2. Faire un fetch() cote client
3. Gerer les erreurs, le loading, etc.

Server Actions : appeler une fonction serveur directement depuis un composant.

## Alternatives

| Approche | Quand choisir |
|----------|---------------|
| **Server Actions** | Mutations simples (formulaires, CRUD) |
| API Routes | API publique, webhooks, integrations externes |
| tRPC | API type-safe complexe, beaucoup d'endpoints |

## Limites

Server Actions ne sont PAS faites pour :
- API publique (pas d'URL stable)
- Webhooks externes (besoin d'un endpoint)
- Requetes complexes avec beaucoup de logique

## Trade-offs

| On gagne | On perd |
|----------|---------|
| Moins de boilerplate | Moins de separation client/serveur |
| Pas de fetch manuel | Debugging plus complexe |
| Revalidation integree | Courbe d'apprentissage |
```

### Exemple 2 : "Pourquoi TypeScript ?"

**Reponse architecte** :

```
## Position

TypeScript est une SURCOUCHE a JavaScript. Pas un remplacement.

┌──────────────────────────────────────────────┐
│   Ton code (.ts, .tsx)                       │
│              │                                │
│              │ compilation (tsc)             │
│              ▼                                │
│   JavaScript (.js) ← ce qui s'execute        │
│              │                                │
│              ▼                                │
│   Navigateur / Node.js                       │
└──────────────────────────────────────────────┘

TypeScript n'existe pas au runtime. C'est un outil de dev.

## Le probleme

JavaScript accepte tout. Pas d'erreur avant l'execution.

```javascript
function add(a, b) { return a + b }
add("hello", 5)  // "hello5" - pas d'erreur, mais probablement pas ce qu'on voulait
```

Les bugs apparaissent en production, pas pendant le dev.

## Alternatives

| Option | Quand choisir |
|--------|---------------|
| **TypeScript** | Projet > 1000 lignes, equipe, long terme |
| JavaScript + JSDoc | Petit projet, migration progressive |
| Flow (Meta) | Ecosysteme Meta (rare maintenant) |
| JavaScript brut | Prototype rapide, script one-shot |

## Limites

TypeScript ne garantit PAS :
- La securite runtime (il faut toujours valider les inputs)
- Les types des donnees externes (API, JSON) → utiliser Zod
- La performance (c'est du JavaScript a la fin)

## Trade-offs

| On gagne | On perd |
|----------|---------|
| Erreurs detectees tot | Temps de compilation |
| Autocompletion | Courbe d'apprentissage |
| Refactoring sur | Verbosity parfois |
```

## Anti-patterns

### ❌ Commencer par le code

```
"Server Actions, c'est comme ca :
'use server'
export async function createUser() { ... }"
```

### ✅ Commencer par le contexte

```
"Server Actions resolvent le probleme du boilerplate API.
Au lieu de creer une route + fetch, tu appelles une fonction directement.
Voici ou ca se situe..."
```

### ❌ Ignorer les alternatives

```
"Prisma c'est un ORM, voici comment l'utiliser..."
```

### ✅ Montrer le paysage

```
"Pour parler a ta DB, tu as plusieurs options :
SQL brut, Supabase client, Prisma, Drizzle.
Voici les trade-offs..."
```

### ❌ Cacher les limites

```
"Server Actions c'est genial pour tout!"
```

### ✅ Etre honnete

```
"Server Actions sont parfaites pour les mutations simples.
Pour une API publique ou des webhooks, garde les API Routes."
```
