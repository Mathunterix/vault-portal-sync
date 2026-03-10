# securite pre-deploiement

## OBLIGATOIRE avant tout deploiement prod

### verification rapide (sans agent)

1. lire `docs/security-check.md`
2. si dernier check < 7 jours ET versions inchangees → OK
3. sinon → lancer le check complet

### quand lancer un check complet

- versions dans package.json ont change
- dernier check > 7 jours
- nouvelle CVE annoncee

---

## check complet

### 1. audit des dependances

```bash
pnpm audit
# ou
npm audit
```

### 2. verifier les packages critiques

| package | pourquoi critique |
|---------|-------------------|
| `next` | RSC, Server Actions = surface d'attaque RCE |
| `react` | Server Components = deserialisation |
| `react-dom` | doit matcher react |

```bash
cat package.json | grep -E '"next"|"react"'
```

### 3. rechercher les CVE recentes

AVANT chaque deploy prod, chercher les CVE :
- https://nextjs.org/blog (security advisories)
- https://react.dev/blog
- https://nvd.nist.gov/vuln/search

**Ou lancer l'agent** :
```
lance l'agent security-check pour verifier les vulnerabilites
```

### 4. si vulnerabilite detectee

1. **NE PAS DEPLOYER**
2. Mettre a jour vers version patchee
3. Tester la mise a jour
4. Re-auditer
5. Deployer

### 5. post-incident (si deja en prod)

si l'app etait vulnerable en prod :
- rotation des secrets (env vars)
- audit des logs (requetes suspectes)
- monitoring accru

## CVE critiques connues (Next.js/React)

| CVE | Package | Type | CVSS | Versions vulnerables | Versions patchees | Statut |
|-----|---------|------|------|----------------------|-------------------|--------|
| CVE-2025-55182 | React | RCE | 10.0 | 19.0.0, 19.1.0-19.1.1, 19.2.0 | 19.0.3+, 19.1.4+, 19.2.3+ | CRITIQUE - Exploitation active (CISA KEV) |
| CVE-2025-66478 | Next.js | RCE | 10.0 | 15.0.0-15.5.6, 16.0.0-16.0.6, 14.3.0-canary.77+ | 14.2.35+, 15.0.7+, 15.1.11+, 15.2.8+, 16.0.10+ | REJETÉ (duplicate de CVE-2025-55182) |
| CVE-2025-55184 | React/Next.js | DoS | High | React 19.x, Next.js 13.3+ | React 19.0.3+, Next.js 14.2.35+ | Patche |
| CVE-2025-55183 | React/Next.js | Info | Medium | React 19.x, Next.js 13.3+ | React 19.0.3+, Next.js 14.2.35+ | Patche |
| CVE-2025-29927 | Next.js | Auth Bypass | 9.1 | <12.3.5, <13.5.9, <14.2.25, <15.2.3 | 12.3.5+, 13.5.9+, 14.2.25+, 15.2.3+ | Patche - PoC publique |

**Derniere mise a jour**: 23 decembre 2025

**Versions recommandees actuellement**:
- Next.js: 14.2.35+ (pour 14.x), 15.5.9+ (pour 15.x), 16.0.10+ (pour 16.x)
- React: 19.0.3+, 19.1.4+, ou 19.2.3+

**IMPORTANT**: Apres mise a jour, ROTER TOUS LES SECRETS (CVE-2025-55182 exploitee activement depuis dec 2025).

Voir `docs/deepsearch/nextjs-react-cve-2025-security-analysis.md` pour l'analyse complete.
