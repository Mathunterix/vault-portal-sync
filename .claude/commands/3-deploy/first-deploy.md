---
description: Checklist pre-deploiement Coolify - verifie que le projet est pret pour le premier deploy Docker
---

# /first-deploy - Checklist Premier Deploiement

Checklist interactive pour preparer un projet Next.js au deploiement sur Coolify (Docker).

Reference complete : `docs/doc-externe/coolify-deployment.md`

## Execution

Parcourir chaque etape dans l'ordre. Pour chaque check :
- lire le fichier concerne
- verifier la condition
- si OK → afficher ✅
- si KO → corriger automatiquement (ou proposer le fix si risque)
- si N/A → afficher ⏭️ (expliquer pourquoi)

A la fin, afficher le recapitulatif.

---

## Etape 1 : next.config.ts → standalone

Lire `next.config.ts` (ou `next.config.mjs`, `next.config.js`).

Verifier que `output: "standalone"` est present.

Si absent, l'ajouter dans le `nextConfig`.

**Pourquoi** : Sans standalone, le build Docker produit un bundle incomplet.

---

## Etape 2 : Health endpoint

Verifier si `app/api/health/route.ts` existe.

Si absent, le creer :

```typescript
export async function GET() {
  return Response.json({ status: "ok" }, { status: 200 })
}
```

**Pourquoi** : Le HEALTHCHECK du Dockerfile en depend. Sans ca, le container sera marque "unhealthy".

---

## Etape 3 : Dockerfile

Verifier si `Dockerfile` existe a la racine.

Si absent, le creer depuis le template de `docs/doc-externe/coolify-deployment.md` section A2.

Si le projet n'utilise PAS Prisma :
- supprimer la ligne `RUN npx prisma generate` du stage builder
- supprimer les lignes `COPY --from=builder /app/node_modules/.prisma` et `COPY --from=builder /app/node_modules/@prisma` du stage runner

---

## Etape 4 : .dockerignore

Verifier si `.dockerignore` existe a la racine.

Si absent, le creer avec le contenu standard :
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

---

## Etape 5 : Pages avec acces DB

Chercher tous les fichiers dans `app/` qui importent `prisma` (grep pour `from.*prisma` ou `import.*prisma`).

Pour chaque fichier page/layout qui fait des requetes DB, verifier que `export const dynamic = "force-dynamic"` est present.

Si absent, le signaler avec le chemin exact et proposer l'ajout.

**Pourquoi** : Sans ca, Next.js tente de pre-rendre au build mais `DATABASE_URL` n'est pas disponible au build Docker.

---

## Etape 6 : Prisma postinstall

Si le projet utilise Prisma, verifier dans `package.json` :
- que `"postinstall": "prisma generate"` est present dans scripts

Si absent, l'ajouter.

---

## Etape 7 : Tailwind dans dependencies

Si le projet utilise Tailwind v4, verifier dans `package.json` :
- `tailwindcss` est dans `dependencies` (pas `devDependencies`)
- `@tailwindcss/postcss` est dans `dependencies` (pas `devDependencies`)

Si dans devDependencies, signaler et proposer le deplacement.

**Pourquoi** : Certains setups Docker n'installent pas les devDependencies en production.

---

## Etape 8 : Variables d'environnement

Lire `.env.local` ou `.env` pour lister les variables utilisees.

Classer chaque variable :

| Variable | Type | Ou la definir dans Coolify |
|----------|------|---------------------------|
| `NEXT_PUBLIC_*` | build-time | Environment Variables (sera passee comme build arg) |
| `DATABASE_URL` | runtime | Environment Variables |
| Autres secrets | runtime | Environment Variables |

Rappeler : si les `NEXT_PUBLIC_*` ne fonctionnent pas en prod, il faudra decommenter les lignes `ARG`/`ENV` dans le Dockerfile.

---

## Etape 9 : Securite pre-deploy

Lancer l'agent `security-check` pour verifier les CVE des dependances critiques (Next.js, React).

Si vulnerabilites trouvees → BLOQUER le deploy et proposer les mises a jour.

---

## Recapitulatif

Afficher un tableau final :

```
# Checklist Premier Deploy

| # | Check                        | Statut |
|---|------------------------------|--------|
| 1 | output: standalone           | ✅/❌  |
| 2 | Health endpoint              | ✅/❌  |
| 3 | Dockerfile                   | ✅/❌  |
| 4 | .dockerignore                | ✅/❌  |
| 5 | Pages DB force-dynamic       | ✅/❌/⏭️ |
| 6 | Prisma postinstall           | ✅/❌/⏭️ |
| 7 | Tailwind dans dependencies   | ✅/❌/⏭️ |
| 8 | Variables d'environnement    | ✅     |
| 9 | Securite (CVE)               | ✅/🚨  |

Pret a deployer : OUI / NON (X blockers)
```

Si tout est ✅ :
```
Le projet est pret. Prochaine etape :
1. Push le code sur GitHub
2. Dans Coolify : Add Resource → GitHub repo
3. Build Pack : Dockerfile
4. Ajouter les env vars (voir tableau etape 8)
5. Configurer le domaine (https://...)
6. Deploy !
```
