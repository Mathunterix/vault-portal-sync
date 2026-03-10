# Feature Workflow

Workflow pour documenter une feature implementee.

**Dossier cible** : `docs/memory-bank/features/`

## Nommage

Format : `[category]-[feature-name].md`

**Categories** : `auth`, `payments`, `database`, `ui`, `api`, `system`, `messaging`, `admin`, `config`

**Exemples** : `auth-login.md`, `payments-stripe.md`, `messaging-privacy.md`

Note : les anciens fichiers numerotes (`01-feature.md`) restent valides.

## Etape 1 : Identifier la feature

Si argument fourni, utilise ce nom.
Sinon, deduis de la session : sur quoi vient-on de travailler ?

## Etape 2 : Detecter le mode

Verifie si `docs/memory-bank/features/[feature-name].md` existe deja.

### Mode A : ENRICHIR (le fichier existe)

La feature a deja une doc. Ne pas recreer from scratch.

1. Lis la doc existante
2. Compare avec ce que tu viens de faire dans la session
3. Identifie ce qui a change :
   - Nouvelles sections a ajouter ?
   - Sections existantes a mettre a jour ?
   - Nouveaux fichiers cles ?
   - Nouvelles tables/colonnes ?
   - Changements d'architecture ?
   - Notes techniques a ajouter ?
   - **Nouvelles dependances ou impacts ?** (mettre a jour le frontmatter)
4. Enrichis chirurgicalement (Edit, pas Write) :
   - Ajouter les nouvelles infos dans les sections existantes
   - Creer de nouvelles sections si besoin
   - Mettre a jour le status si pertinent
   - Mettre a jour `last_updated` dans le frontmatter
   - Ajouter une entree dans `## Historique`

**Principe** : ne toucher qu'a ce qui a change.

### Mode B : CREER (le fichier n'existe pas)

Premiere documentation de la feature. Creer le fichier complet.

Voir `references/templates.md` pour le template complet.

**FRONTMATTER OBLIGATOIRE** :
```yaml
---
feature: [category]-[name]
category: [auth|payments|database|ui|api|system|messaging|admin|config]
status: [stable|beta|alpha|deprecated]
depends_on: []      # features dont celle-ci depend
related: []         # features connexes/similaires
impacts: []         # features qui dependent de celle-ci
files: []           # fichiers cles (3-5 max)
last_updated: YYYY-MM-DD
---
```

**Sections obligatoires** :
- Description
- Fichiers cles
- Usage (avec exemples concrets)
- Notes techniques

**Sections conditionnelles** (si pertinent) :
- Architecture (flow complexe)
- Tables Database (nouvelles tables)
- Configuration (cron, env vars)
- Migrations (SQL)
- Debug SQL (queries utiles)

## Etape 3 : Impact Analysis

Apres avoir documente, analyser les impacts.

1. Lis le frontmatter de la feature documentee
2. Pour chaque feature dans `depends_on` et `impacts` :
   - Verifie si elle existe dans `features/`
   - Si oui, verifie si elle devrait etre mise a jour
3. Cherche dans les autres features celles qui mentionnent cette feature dans leur `depends_on`

**Si impacts detectes** :
```
### Impact Analysis

Cette feature impacte potentiellement :
- `auth-login.md` (liste cette feature dans depends_on)
- `dashboard.md` (utilise des donnees de cette feature)

Veux-tu les review ? [y/N]
```

Si l'utilisateur accepte, ouvrir chaque fichier et proposer les mises a jour.

## Etape 4 : Verifier la completion

Si `changes/[feature]/tasks.md` existe, compte les taches :
- Toutes cochees → `completed`
- Sinon → `in-progress`

Si pas de tasks.md (documentation ad-hoc), considere `completed`.

## Etape 5 : Archiver (si completed)

**SEULEMENT si status = completed ET changes/[feature]/ existe** :

```bash
mkdir -p changes/.to-delete
mv changes/[feature]/ changes/.to-delete/
```

Si in-progress → ne rien deplacer.

## Etape 6 : Generer INDEX.md

Regenerer l'index des features automatiquement.

```bash
python .claude/scripts/generate_feature_index.py
```

Ce script :
1. Scanne tous les fichiers `docs/memory-bank/features/*.md`
2. Parse les frontmatters YAML
3. Genere `INDEX.md` avec :
   - Liste par categorie
   - Graphe de dependances (mermaid)
   - Features recemment modifiees
   - Features sans frontmatter (legacy)

Si le script n'existe pas, generer INDEX.md manuellement (voir `references/index-format.md`).

## Regles specifiques features

- **Frontmatter obligatoire** : toute nouvelle feature doit avoir le frontmatter complet
- **Nommage categorise** : `[category]-[name].md`
- **Archiver UNIQUEMENT si completed**
- **La doc doit etre EXHAUSTIVE** pour qu'on n'ait pas a chercher la prochaine fois
