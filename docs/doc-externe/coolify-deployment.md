# Deploiement Coolify - Guide IA

> Guide generique pour deployer une app Next.js (+ Prisma + Supabase) sur Coolify v4, VPS auto-heberge.
> Concu pour etre donne a une IA qui preparera et deploiera le projet.

---

## Arbre de decision

```
Le projet a-t-il plusieurs services independants (API separee, workers...) ?
│
├── NON → Scenario A : Dockerfile seul (90% des cas etudiants)
│         Un seul service Next.js, Coolify gere tout.
│
└── OUI → Scenario B : Docker Compose
          Plusieurs containers qui communiquent entre eux.
```

**Regle** : Commencer TOUJOURS par le Scenario A. Passer au B uniquement si :
- Le projet est un monorepo avec une API separee (Hono, Express, Fastify...)
- Le projet a besoin de workers/crons dans un container separe
- Le projet doit se connecter a un service Docker sur le meme VPS (ex: Supabase self-hosted)

---

## Scenario A : Dockerfile seul (recommande)

### A1. Prerequis dans le code

#### next.config.ts

```typescript
const nextConfig = {
  output: "standalone", // OBLIGATOIRE pour Docker
  // ... reste de la config
}
```

#### Endpoint health check

Creer `app/api/health/route.ts` :

```typescript
export async function GET() {
  return Response.json({ status: "ok" }, { status: 200 })
}
```

#### Pages avec acces DB

Toute page qui utilise Prisma doit avoir `dynamic = 'force-dynamic'` :

```typescript
// OBLIGATOIRE si la page fait des requetes DB
export const dynamic = "force-dynamic"

export default async function Page() {
  const data = await prisma.table.findMany()
  return <div>{/* ... */}</div>
}
```

**Pourquoi** : Sans ca, Next.js tente de pre-rendre la page au build Docker, mais `DATABASE_URL` n'est pas disponible au build (seulement au runtime).

### A2. Dockerfile

Creer `Dockerfile` a la racine :

```dockerfile
FROM node:20-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# --- Builder ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma : generer le client AVANT le build Next.js
RUN npx prisma generate

# Build-time env vars (NEXT_PUBLIC_* uniquement)
# Decommenter et adapter si besoin :
# ARG NEXT_PUBLIC_SUPABASE_URL
# ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
# ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN corepack enable pnpm && pnpm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers necessaires du build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma : copier le schema (necessaire au runtime pour certaines operations)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
```

### A3. .dockerignore

Creer `.dockerignore` a la racine :

```
.next
node_modules
.git
.env*.local
.env
*.md
.vscode
.idea
.claude
docs
changes
```

### A4. Configuration Coolify

1. **Projects** → **Add Resource** → **Public/Private Repository (via GitHub)**
2. Selectionner le repo
3. **Build Pack** : `Dockerfile`
4. **Ports Exposes** : `3000`
5. Verifier :
   - **Base Directory** : `/`
   - **Dockerfile Location** : `/Dockerfile`

#### Variables d'environnement

Dans **Environment Variables**, ajouter :

```
# Database (Prisma)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**IMPORTANT sur les NEXT_PUBLIC_*** :
- Ces variables sont injectees au **build** (dans le bundle JS client)
- Coolify les passe automatiquement comme build args
- Si ca ne fonctionne pas, utiliser la section `ARG` / `ENV` dans le Dockerfile (voir commentaires dans A2)

#### Domaine

Dans **Configuration** → **Domains** :

```
https://monapp.mondomaine.com
```

- Toujours `https://` (Coolify gere le certificat SSL via Let's Encrypt)
- Si l'app n'ecoute pas sur le port 80, ajouter le port : `https://monapp.mondomaine.com:3000`

#### DNS

Creer un enregistrement A chez le registrar DNS :

```
monapp.mondomaine.com    A    <IP_DU_VPS>
```

#### Deployer

Cliquer **Deploy**. Coolify va :
1. Cloner le repo
2. Builder l'image Docker
3. Demarrer le container
4. Attendre que le health check passe
5. Configurer Traefik (reverse proxy + TLS)

---

## Scenario B : Docker Compose (multi-service)

### B1. Quand utiliser Docker Compose

- Monorepo avec API separee + frontend
- Besoin de connecter des containers entre eux via reseau Docker interne
- Service qui doit rejoindre un reseau Docker existant (Supabase self-hosted)

### B2. Structure type

```
/
├── Dockerfile              # ou Dockerfile.web
├── Dockerfile.api          # API separee (si applicable)
├── docker-compose.yaml
├── apps/
│   ├── api/
│   └── web/
└── packages/
    └── shared/
```

### B3. docker-compose.yaml

**REGLE CRITIQUE** : Ne PAS mettre de labels Traefik manuels. Coolify les genere via l'UI.

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      # Vars runtime (injectees par Coolify)
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    networks:
      - coolify
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
    networks:
      - coolify
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s

networks:
  coolify:
    external: true
```

### B4. Communication entre services

Dans Docker Compose, les services se parlent par leur nom :

```typescript
// Dans le service "web", pour appeler le service "api" :
const API_URL = process.env.INTERNAL_API_URL || "http://api:4000"
```

**Important** : Cette URL interne fonctionne uniquement cote serveur (Server Components, Route Handlers, Server Actions). Le navigateur ne peut pas resoudre `http://api:4000`.

Pour le client (navigateur), deux options :
1. **Proxy server-side** : le frontend proxie les appels via une Route API Next.js
2. **Domaine public** : l'API a son propre domaine (`api.mondomaine.com`)

### B5. Connexion a un reseau Docker existant (Supabase self-hosted)

Si le VPS heberge aussi Supabase (ou autre service Docker), il faut rejoindre son reseau :

```bash
# Trouver l'ID du reseau sur le VPS
docker network ls | grep supabase
```

Puis dans `docker-compose.yaml` :

```yaml
services:
  web:
    networks:
      - coolify
      - supabase_network

networks:
  coolify:
    external: true
  supabase_network:
    external: true
    name: <ID_DU_RESEAU>  # ex: s00ko48c44o0g44804wg8o8o
```

### B6. Configuration Coolify (Docker Compose)

1. **Projects** → **Add Resource** → **Public/Private Repository (via GitHub)**
2. **Build Pack** : `Docker Compose`
3. **Docker Compose Location** : `/docker-compose.yaml`
4. **Base Directory** : `/`

#### Domaines par service

Apres le premier deploiement, configurer les domaines de chaque service dans l'UI :

| Service | Domaine |
|---------|---------|
| web | `https://monapp.mondomaine.com:3000` |
| api | `https://api.monapp.mondomaine.com:4000` |

**Format** : `https://domaine:PORT_INTERNE_DU_CONTAINER`

Le port indique a Traefik sur quel port interne router. L'utilisateur final accede toujours en HTTPS (443).

#### DNS

```
monapp.mondomaine.com        A    <IP_DU_VPS>
api.monapp.mondomaine.com    A    <IP_DU_VPS>
```

---

## Variables d'environnement : build-time vs runtime

| Type | Quand | Exemple | Comment |
|------|-------|---------|---------|
| **Build-time** | Injecte dans le JS client au `pnpm build` | `NEXT_PUBLIC_SUPABASE_URL` | ARG + ENV dans Dockerfile, ou via UI Coolify |
| **Runtime** | Lu par le serveur Node.js au demarrage | `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | ENV dans Coolify UI uniquement |

**Piege classique** : Les `NEXT_PUBLIC_*` ne sont PAS disponibles au runtime si elles n'etaient pas presentes au build. Coolify les passe normalement comme build args, mais si ca ne marche pas, les declarer explicitement dans le Dockerfile :

```dockerfile
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
```

---

## Tailwind v4 dans Docker

`tailwindcss` et `@tailwindcss/postcss` doivent etre dans `dependencies` (pas `devDependencies`) pour que le build Docker fonctionne :

```json
{
  "dependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  }
}
```

**Pourquoi** : Certains setups Docker installent uniquement les `dependencies` en production. Meme avec `--frozen-lockfile`, verifier que ces packages sont accessibles au build.

---

## Prisma dans Docker

### Checklist Prisma

- [ ] `prisma generate` est execute AVANT `pnpm build` dans le Dockerfile
- [ ] Le client genere (`.prisma/` et `@prisma/`) est copie dans le runner
- [ ] `DATABASE_URL` est defini dans les env vars Coolify (runtime, pas build)
- [ ] Les pages avec requetes DB ont `export const dynamic = "force-dynamic"`

### postinstall (recommande)

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Cela garantit que le client Prisma est genere apres chaque `pnpm install`.

---

## Pieges courants et solutions

### 1. Erreur 502/503 "Bad Gateway"

| Cause | Solution |
|-------|----------|
| App ecoute sur `127.0.0.1` | Ajouter `HOSTNAME=0.0.0.0` dans le Dockerfile |
| Port mal configure | Verifier que le port dans Coolify correspond au `EXPOSE` du Dockerfile |
| Container unhealthy | Verifier le health check (voir piege 2) |
| Domaine sans port | Ajouter `:3000` apres le domaine dans Coolify si le service n'est pas sur le port 80 |

### 2. Container "unhealthy"

| Cause | Solution |
|-------|----------|
| Endpoint health n'existe pas | Creer `/api/health` (voir A1) |
| `wget` absent dans Alpine | Utiliser `node -e "fetch(...)"` a la place |
| App lente au demarrage | Augmenter `start_period` (30s minimum pour Next.js) |

### 3. Build echoue : "DATABASE_URL not found"

**Cause** : Next.js pre-rend des pages qui appellent Prisma au build.

**Solution** : Ajouter `export const dynamic = "force-dynamic"` sur chaque page qui fait des requetes DB.

### 4. Build echoue : dependances manquantes

**Cause** : `tailwindcss`, `@tailwindcss/postcss` ou `autoprefixer` en `devDependencies`.

**Solution** : Les deplacer dans `dependencies`.

### 5. NEXT_PUBLIC_* vide en production

**Cause** : La variable n'etait pas presente au moment du build Docker.

**Solution** :
1. Verifier qu'elle est dans les env vars Coolify
2. Si ca ne suffit pas, ajouter `ARG` + `ENV` dans le Dockerfile (section builder)
3. Rebuild (pas juste restart)

### 6. Prisma client introuvable au runtime

**Cause** : Le client genere n'est pas copie dans le stage runner.

**Solution** : Ajouter dans le Dockerfile runner :
```dockerfile
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
```

### 7. pnpm symlinks casses dans Docker

**Cause** : pnpm utilise des symlinks, le runner n'y a pas acces.

**Solution** : Le mode `standalone` de Next.js resout ce probleme car il copie tous les fichiers necessaires. Si le probleme persiste (monorepo), copier tous les `node_modules` du builder.

### 8. Labels Traefik ignores dans docker-compose

**Cause** : Coolify gere Traefik automatiquement.

**Solution** : Ne JAMAIS mettre de labels Traefik dans `docker-compose.yaml`. Configurer les domaines via l'UI Coolify.

### 9. Services Docker ne communiquent pas entre eux

**Cause** : Pas sur le meme reseau Docker.

**Solution** : Tous les services doivent etre sur le network `coolify` (externe). Voir B3.

---

## Checklist pre-deploiement

### Code

- [ ] `output: "standalone"` dans `next.config.ts`
- [ ] Endpoint `/api/health` existe
- [ ] `HOSTNAME=0.0.0.0` dans le Dockerfile
- [ ] Pages DB ont `export const dynamic = "force-dynamic"`
- [ ] `tailwindcss` dans `dependencies` (pas devDependencies)
- [ ] `prisma generate` dans le Dockerfile (ou `postinstall`)
- [ ] `.dockerignore` present

### Coolify

- [ ] Build pack correct (Dockerfile ou Docker Compose)
- [ ] Variables d'environnement definies
- [ ] Domaine configure avec `https://` (+ port si != 80)
- [ ] DNS : enregistrement A vers l'IP du VPS

### Apres deploiement

- [ ] Status "Running (healthy)"
- [ ] Site accessible en HTTPS
- [ ] Pas d'erreurs dans la console navigateur (F12)
- [ ] Tester : `curl https://monapp.mondomaine.com/api/health`

---

## Commandes de debug (SSH sur le VPS)

```bash
# Voir les containers en cours
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs d'un container (les 50 dernieres lignes, en continu)
docker logs <container-name> --tail 50 -f

# Tester le health check depuis le container
docker exec <container-name> node -e "fetch('http://localhost:3000/api/health').then(r=>console.log(r.status))"

# Verifier les labels Traefik generes par Coolify
docker inspect <container-name> | grep -A 30 Labels

# Logs du reverse proxy Traefik
docker logs coolify-proxy --tail 50 -f

# Lister les reseaux Docker
docker network ls

# Inspecter un reseau (voir quels containers y sont connectes)
docker network inspect coolify
```

---

## Rollback

Si un deploiement casse tout :

1. **Via Coolify UI** : Aller dans **Deployments** → cliquer **Redeploy** sur une version precedente
2. **Via Git** : `git revert <commit>` → push → Coolify redeploy automatiquement

**Attention** : Un rollback du code ne rollback PAS les migrations Prisma. Si une migration a ete appliquee, il faut la reverter manuellement.

---

_Sources : [Coolify Docs - Next.js](https://coolify.io/docs/applications/nextjs), [Coolify Docs - Docker Compose](https://coolify.io/docs/knowledge-base/docker/compose), [Coolify Docs - Domains](https://coolify.io/docs/knowledge-base/domains), [Coolify Docs - Dockerfile Build Pack](https://coolify.io/docs/applications/build-packs/dockerfile)_
