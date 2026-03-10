---
name: upgrade-docs
description: Upgrade existing feature documentation to the new format with frontmatter, categories, and relationships. Analyzes legacy features without metadata and helps migrate them. Also detects duplications and proposes merges. Use on projects with existing documentation that need to adopt the new structured format.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(python *), Bash(tree *), Bash(ls *)
argument-hint: "[all | feature-name]"
---

# Upgrade Documentation

Met a niveau la documentation existante vers le nouveau format avec frontmatter structure.

## Quand utiliser ce skill

- Projet existant avec features sans frontmatter
- Apres avoir adopte vibedev sur un projet brownfield
- Pour nettoyer une documentation desorganisee
- Pour detecter et fusionner les duplications

## Etape 1 : Analyser l'etat actuel

Scanner `docs/memory-bank/features/` :

```bash
python .claude/scripts/generate_feature_index.py
```

Lire le INDEX.md genere pour voir :
- Combien de features ont un frontmatter
- Combien sont "legacy" (sans frontmatter)
- S'il y a des duplications potentielles

## Etape 2 : Identifier les patterns

Analyser les noms de fichiers pour detecter :

### Nommage inconsistant
- Fichiers numerotes (`01-feature.md`, `02-feature.md`)
- Fichiers non numerotes (`feature-name.md`)
- Mix des deux

### Duplications potentielles
Chercher des fichiers qui pourraient documenter la meme chose :
- `alerts-system.md` vs `30-recruiter-alerts-system.md`
- `auth.md` vs `01-auth-login.md`

### Categories implicites
Deduire les categories depuis les noms/contenus :
- `*-auth-*`, `*-login-*`, `*-signup-*` → `auth`
- `*-stripe-*`, `*-payment-*`, `*-credits-*` → `payments`
- `*-message-*`, `*-email-*`, `*-notification-*` → `messaging`

## Etape 3 : Proposer le plan de migration

Presenter a l'utilisateur :

```
## Plan de migration

### Features a migrer (sans frontmatter)
| Fichier | Category proposee | Action |
|---------|------------------|--------|
| auth-login.md | auth | Ajouter frontmatter |
| 01-ai-text.md | api | Ajouter frontmatter |

### Duplications detectees
| Fichiers | Proposition |
|----------|-------------|
| alerts-system.md + 30-recruiter-alerts.md | Fusionner → alerts-recruiter.md |

### Renommages proposes (recommande)
| Ancien | Nouveau | Raison |
|--------|---------|--------|
| 01-auth-login.md | auth-login.md | Convention `[category]-[name].md` |
| feature-random.md | system-feature-random.md | Ajout prefixe categorie |

**Convention de nommage** : `[category]-[feature-name].md`
- Permet le tri alphabetique par categorie
- Facilite la navigation dans le dossier

Confirmer le plan ? [y/N]
```

## Etape 4 : Executer la migration

Pour chaque feature a migrer :

### 4.1 Ajouter le frontmatter

Lire le fichier et deduire les metadata :

```yaml
---
feature: [category]-[name]  # ex: auth-login, payments-stripe
category: [deduire du contenu ou du nom]
status: stable  # par defaut
depends_on: []  # analyser les mentions d'autres features
related: []     # analyser les mentions d'autres features
impacts: []     # laisser vide, sera rempli par d'autres features
files: []       # extraire de la section "Fichiers cles" si presente
last_updated: [date du fichier ou aujourd'hui]
---
```

**Important** : le champ `feature:` doit suivre le format `[category]-[name]`.
Si le fichier n'est pas encore renomme, utiliser quand meme ce format dans le frontmatter.

**Detection automatique des relations** :
- Scanner le contenu pour les mentions d'autres features
- Si le texte mentionne "utilise auth" ou "depend de auth" → `depends_on: [auth]`
- Si le texte mentionne "similaire a X" → `related: [X]`

### 4.2 Fusionner les duplications

Si deux fichiers documentent la meme chose :
1. Identifier le fichier "principal" (plus complet ou plus recent)
2. Extraire les infos uniques du fichier secondaire
3. Enrichir le fichier principal avec ces infos
4. Supprimer le fichier secondaire (ou deplacer vers `.to-delete/`)
5. Mettre a jour les references dans les autres fichiers

### 4.3 Renommer vers convention (recommande)

**Convention obligatoire** : `[category]-[feature-name].md`

Par defaut, renommer tous les fichiers pour suivre la convention :
1. Determiner la categorie (voir tableau "Detection des categories")
2. Renommer : `01-auth-login.md` → `auth-login.md`
3. Renommer : `feature-x.md` → `[category]-feature-x.md`
4. Mettre a jour `feature:` dans le frontmatter
5. Mettre a jour les references dans les autres fichiers

**Si l'utilisateur refuse** :
```
⚠️ Le fichier gardera son nom actuel mais ne suivra pas la convention.
   Les fichiers non-conformes seront moins faciles a trouver.
   Continuer quand meme ? [y/N]
```

## Etape 5 : Regenerer INDEX.md

```bash
python .claude/scripts/generate_feature_index.py
```

## Etape 6 : Rapport final

```
## Migration terminee

### Stats
- Features migrees: X
- Duplications fusionnees: Y
- Renommages effectues: Z

### Features avec frontmatter
- Total: N (100%)

### Prochaines etapes
- Verifier les relations (depends_on, impacts) manuellement
- Enrichir les frontmatters au fur et a mesure avec /doc

INDEX.md regenere : docs/memory-bank/features/INDEX.md
```

## Options

### Mode interactif (defaut)
```
/upgrade-docs
```
Propose chaque changement et attend confirmation.

### Mode batch
```
/upgrade-docs all
```
Migre toutes les features automatiquement (sans renommage, sans fusion).

### Feature unique
```
/upgrade-docs auth-login
```
Migre uniquement la feature specifiee.

## Regles

- **Ne jamais supprimer** : deplacer vers `.to-delete/` plutot que supprimer
- **Confirmer les fusions** : toujours demander avant de fusionner des fichiers
- **Renommage par defaut** : toujours proposer `[category]-[name].md`, avertir si refuse
- **Conserver l'historique** : ne pas perdre d'information lors des fusions
- **Frontmatter minimal** : si impossible de deduire, mettre des valeurs par defaut
- **Convention de nommage** : `[category]-[feature-name].md` est la norme (pas optionnel)

## Detection des categories

| Mots-cles dans le nom/contenu | Category |
|------------------------------|----------|
| auth, login, signup, password, session, permission | auth |
| stripe, payment, credit, wallet, billing, invoice | payments |
| database, table, schema, migration, prisma | database |
| component, ui, form, button, modal, layout | ui |
| api, route, endpoint, webhook | api |
| cron, monitoring, log, error, system, infra | system |
| message, email, notification, smtp | messaging |
| admin, dashboard, moderation | admin |
| config, setting, feature-flag, env | config |
