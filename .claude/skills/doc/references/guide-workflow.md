# Guide Workflow

Workflow pour documenter un apprentissage ou pattern reutilisable.

**Dossier cible** : `docs/memory-bank/references/`

## Quand creer un guide

- Deep-search effectuee pendant la session
- Pattern technique complexe decouvert
- Integration avec service externe (Stripe, Supabase Auth, etc.)
- Solution a un probleme non trivial
- Best practices apprises

## Nommage

Format : `[topic].md`

**topic** : sujet en kebab-case

**Exemples** :
- `stripe-webhooks.md`
- `server-actions-patterns.md`
- `prisma-transactions.md`
- `supabase-rls-guide.md`

## Etape 1 : Identifier le sujet

Si argument fourni, utilise ce nom.
Sinon, deduis de la session : quel apprentissage merite d'etre documente ?

## Etape 2 : Detecter le mode

Verifie si `docs/memory-bank/references/[topic].md` existe deja.

### Mode A : ENRICHIR (guide existant)

Le guide existe deja. Ajouter les nouveaux apprentissages :

1. Lis le guide existant
2. Identifie ce qui est nouveau :
   - Nouvelles sections ?
   - Nouveaux pieges a eviter ?
   - Nouveaux exemples de code ?
3. Enrichis chirurgicalement (Edit, pas Write)
4. Mettre a jour la date si presente

### Mode B : CREER (nouveau guide)

Creer le fichier complet.

**FRONTMATTER** (optionnel mais recommande) :
```yaml
---
guide: [topic]
category: integration | pattern | tooling | troubleshooting
source_session: YYYY-MM-DD
related_features: []
related_decisions: []
---
```

**Template Guide** :
```markdown
---
guide: [topic]
category: [integration|pattern|tooling|troubleshooting]
source_session: YYYY-MM-DD
related_features: []
related_decisions: []
---

# [Sujet] - Guide

*Issu de la session du YYYY-MM-DD*

## Contexte

[Quand utiliser ce guide]
[Quel probleme ca resout]

## Implementation

### Etape 1 : [Titre]

[Explication]

```typescript
// Code example
```

### Etape 2 : [Titre]

[Explication]

## Pieges a eviter

### [Piege 1]
[Description et comment l'eviter]

### [Piege 2]
[Description et comment l'eviter]

## Checklist

- [ ] [Etape 1]
- [ ] [Etape 2]
- [ ] [Verification]

## References

- [Lien doc officielle]
- [Lien deep-search si pertinent]

---
*Cree le [DATE]*
```

## Etape 3 : Generer INDEX.md

Mettre a jour l'index des references.

L'index est simple (pas de script automatique pour l'instant) :

```markdown
# References Index

*Derniere mise a jour: YYYY-MM-DD*

## Guides disponibles

| Guide | Category | Description |
|-------|----------|-------------|
| [stripe-webhooks](stripe-webhooks.md) | integration | Gestion des webhooks Stripe |
| [server-actions-patterns](server-actions-patterns.md) | pattern | Patterns pour Server Actions |

## Par categorie

### Integration
- [stripe-webhooks](stripe-webhooks.md)
- [supabase-rls-guide](supabase-rls-guide.md)

### Pattern
- [server-actions-patterns](server-actions-patterns.md)

### Tooling
- [prisma-migrations](prisma-migrations.md)

### Troubleshooting
- [common-errors](common-errors.md)

---
*Mettre a jour manuellement apres chaque /doc guide*
```

## Contenu d'un bon guide

Un bon guide doit :
- **Etre autonome** : comprehensible sans contexte externe
- **Avoir des exemples** : code concret, pas juste theorie
- **Lister les pieges** : ce qu'on a appris a la dure
- **Etre actionnable** : etapes claires a suivre

## Difference avec features et decisions

| Type | Quoi | Pourquoi |
|------|------|----------|
| Feature | Ce qu'on a construit | Documentation du code |
| Decision | Ce qu'on a decide | Justification des choix |
| Guide | Ce qu'on a appris | Reutilisation des connaissances |

## Regles specifiques guides

- **Distiller, pas copier** : ne pas copier le deep-search brut, extraire l'essentiel
- **Exemples concrets** : du code qui fonctionne
- **Pieges documentes** : les erreurs qu'on a faites
- **Liens vers sources** : deep-search, docs officielles
