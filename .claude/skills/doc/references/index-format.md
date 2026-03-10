# Format INDEX.md (generation manuelle)

Si le script Python n'est pas disponible, generer INDEX.md manuellement avec ce format.

## Structure

```markdown
# Features Index

*Auto-genere le YYYY-MM-DD HH:MM*

**Total**: X features (Y avec metadata, Z legacy)

---

## Par categorie

### Auth

| Feature | Status | Derniere MAJ |
|---------|--------|--------------|
| [auth-login](auth-login.md) | ✅ stable | 2026-02-05 |
| [auth-signup](auth-signup.md) | ✅ stable | 2026-02-03 |

### Payments

| Feature | Status | Derniere MAJ |
|---------|--------|--------------|
| [payments-stripe](payments-stripe.md) | ✅ stable | 2026-02-01 |

[... autres categories ...]

---

## Graphe de dependances

```mermaid
graph LR
    auth[auth] --> database_users[database-users]
    payments_stripe[payments-stripe] --> auth[auth]
    dashboard[dashboard] --> auth[auth]
    dashboard[dashboard] --> payments_stripe[payments-stripe]
```

---

## Recemment modifiees

1. [auth-login](auth-login.md) - 2026-02-05
2. [payments-stripe](payments-stripe.md) - 2026-02-03
3. [dashboard](dashboard.md) - 2026-02-01

---

## Features legacy (sans frontmatter)

Ces features n'ont pas de metadata. Utiliser `/upgrade-docs` pour les migrer.

- [old-feature](old-feature.md)
- [legacy-thing](legacy-thing.md)

---

*Regenerer avec: `python .claude/scripts/generate_feature_index.py`*
```

## Status emojis

| Status | Emoji |
|--------|-------|
| stable | ✅ |
| beta | 🔶 |
| alpha | 🔷 |
| deprecated | ⚠️ |

## Graphe mermaid

Pour le graphe de dependances :
- Utiliser `graph LR` (left to right)
- Remplacer les `-` par `_` dans les IDs (mermaid n'aime pas les tirets)
- Format: `source[label] --> target[label]`
- Les fleches representent "depend de" ou "impacte"

Exemple:
```
A depends_on B  →  B --> A
A impacts B     →  A --> B
```

## Process manuel

1. Lister tous les fichiers `features/*.md` (sauf INDEX.md, README.md)
2. Pour chaque fichier, lire le frontmatter
3. Grouper par categorie
4. Pour le graphe, collecter tous les `depends_on` et `impacts`
5. Trier les "recemment modifiees" par date de fichier
6. Lister les fichiers sans frontmatter comme "legacy"
