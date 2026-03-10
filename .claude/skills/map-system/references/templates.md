# Templates pour System Design

## Diagrammes Mermaid

### System Context (C4 Level 1)

```mermaid
graph TD
    %% Utilisateurs
    User[fa:fa-user Utilisateur]
    Admin[fa:fa-user-shield Admin]

    %% Systeme principal
    App[fa:fa-server Application<br/>Next.js]

    %% Systemes externes
    DB[(fa:fa-database PostgreSQL<br/>Supabase)]
    Auth[fa:fa-lock Supabase Auth]
    Storage[fa:fa-cloud Supabase Storage]
    Stripe[fa:fa-credit-card Stripe]
    Email[fa:fa-envelope Resend]

    %% Relations
    User --> App
    Admin --> App
    App --> DB
    App --> Auth
    App --> Storage
    App --> Stripe
    App --> Email
```

### Containers (C4 Level 2)

```mermaid
graph TD
    subgraph "Frontend"
        React[React Components]
        Pages[Pages / Routes]
    end

    subgraph "Backend"
        Actions[Server Actions]
        API[API Routes]
        Middleware[Middleware]
    end

    subgraph "Data"
        DB[(PostgreSQL)]
        Cache[Redis Cache]
    end

    subgraph "External"
        Stripe[Stripe API]
        Email[Email Service]
    end

    Pages --> Actions
    Pages --> API
    Middleware --> Pages
    Actions --> DB
    API --> DB
    API --> Cache
    API --> Stripe
    Actions --> Email
```

### Data Flow

```mermaid
flowchart LR
    subgraph Input
        UI[User Input]
        Webhook[Webhook]
    end

    subgraph Processing
        Validate[Validation<br/>Zod]
        Transform[Transform<br/>Business Logic]
    end

    subgraph Storage
        DB[(Database)]
        Cache[Cache]
    end

    subgraph Output
        Response[API Response]
        Event[Event/Notification]
    end

    UI --> Validate
    Webhook --> Validate
    Validate --> Transform
    Transform --> DB
    Transform --> Cache
    Transform --> Response
    Transform --> Event
```

### Sequence Diagram (Auth Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant M as Middleware
    participant A as API/Action
    participant S as Supabase Auth
    participant D as Database

    U->>F: Click "Sign In"
    F->>S: signInWithOAuth()
    S->>U: Redirect to Provider
    U->>S: Approve
    S->>F: Return session
    F->>M: Request protected page
    M->>S: Verify session
    S-->>M: Valid
    M->>A: Forward request
    A->>D: Fetch user data
    D-->>A: User profile
    A-->>F: Response
    F-->>U: Show dashboard
```

### Sequence Diagram (Payment Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Stripe
    participant D as Database
    participant W as Webhook

    U->>F: Click "Pay"
    F->>A: Create checkout
    A->>S: Create session
    S-->>A: Session URL
    A-->>F: Redirect URL
    F->>S: Redirect to Stripe
    U->>S: Complete payment
    S->>W: payment_intent.succeeded
    W->>A: Webhook handler
    A->>D: Update order status
    A->>D: Add credits/subscription
    S->>F: Redirect to success
    F->>A: Fetch updated data
    A-->>F: Order confirmed
    F-->>U: Show confirmation
```

## README arc42-lite Template

```markdown
# System Design

Vue d'ensemble de l'architecture du projet.

## 1. Introduction et Objectifs

### Objectifs business
- [Objectif 1]
- [Objectif 2]

### Objectifs qualite
| Objectif | Metrique |
|----------|----------|
| Performance | P95 < 200ms |
| Disponibilite | 99.9% uptime |
| Securite | OWASP Top 10 |

## 2. Contraintes

### Techniques
- Next.js 15 (App Router)
- PostgreSQL via Supabase
- Vercel pour l'hebergement

### Organisationnelles
- Equipe : [taille]
- Timeline : [dates]

## 3. Contexte

Voir [system-context.md](diagrams/system-context.md)

### Acteurs
| Acteur | Description |
|--------|-------------|
| Utilisateur | ... |
| Admin | ... |

### Systemes externes
| Systeme | Usage |
|---------|-------|
| Supabase | Auth, DB, Storage |
| Stripe | Paiements |

## 4. Strategie de Solution

### Decisions architecturales cles
- Monolithe Next.js (simplicite)
- Server Components par defaut (performance)
- Server Actions pour mutations (DX)

Voir [decisions/](../memory-bank/decisions/) pour les ADRs.

## 5. Vue Containers

Voir [containers.md](diagrams/containers.md)

## 6. Flux de Donnees

Voir [data-flow.md](diagrams/data-flow.md)

### Flows critiques
- [Auth Flow](flows/auth-flow.md)
- [Payment Flow](flows/payment-flow.md)

## 7. Risques et Dette Technique

| Risque | Impact | Mitigation |
|--------|--------|------------|
| [Risque 1] | [Impact] | [Mitigation] |

### Dette technique connue
- [ ] [Dette 1]
- [ ] [Dette 2]

---

*Genere avec `/map-system` - Mettre a jour manuellement si l'architecture evolue*
```

## Bonnes pratiques Mermaid

### Couleurs (optionnel)

```mermaid
graph TD
    classDef primary fill:#4477AA,color:#fff
    classDef success fill:#228833,color:#fff
    classDef warning fill:#CCBB44,color:#000
    classDef danger fill:#EE6677,color:#fff

    A[Primary]:::primary
    B[Success]:::success
    C[Warning]:::warning
    D[Danger]:::danger
```

### Subgraphs pour grouper

```mermaid
graph TD
    subgraph "Group A"
        A1[Item 1]
        A2[Item 2]
    end

    subgraph "Group B"
        B1[Item 1]
        B2[Item 2]
    end

    A1 --> B1
    A2 --> B2
```

### Liens avec labels

```mermaid
graph LR
    A -->|"HTTP/REST"| B
    B -->|"SQL"| C
    C -.->|"async"| D
```

### Formes

| Syntaxe | Forme |
|---------|-------|
| `[text]` | Rectangle |
| `(text)` | Rectangle arrondi |
| `{text}` | Losange (decision) |
| `[(text)]` | Cylindre (database) |
| `((text))` | Cercle |
