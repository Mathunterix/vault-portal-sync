# règles création notes obsidian

## avant de créer une note

1. **chercher des liens pertinents** via `suggest_links` ou `search_notes`
2. **proposer des liens** vers des notes existantes si pertinent (compas, contenu, source)
3. **ne pas forcer** les liens si rien de pertinent n'existe

## contenu des notes (CRITIQUE)

### règle fondamentale

**JAMAIS halluciner de contenu.** Le second cerveau ne contient que des informations VALIDÉES par l'utilisateur.

> "Écrites dans nos propres mots car si on a réussi à utiliser nos propres mots cela nous prouve qu'on ne rentre que des informations qu'on a comprises" - MFGC

### ce qui est INTERDIT

- inventer du contenu qui sort de nulle part (hallucination)
- créer une note avec des infos sur un sujet jamais discuté

### ce qui est OK

- utiliser ce qu'on a discuté dans la conversation
- reformuler/structurer ce que l'utilisateur donne
- proposer des recherches web → présenter → utilisateur valide
- suggérer des liens vers des notes existantes du vault
- déduire des choses logiques du contexte de la conversation
- enrichir avec des propositions (liens, structure, recherches)

### workflow contenu

```
1. utilisateur demande de créer une note
2. SI sujet déjà discuté → utiliser le contexte de la conversation
3. SI sujet inconnu → proposer :
   - "Tu veux me donner le contenu ?"
   - "Recherche web d'abord ?"
   - "Note vide pour l'instant ?"
4. enrichir avec liens du vault, structure, propositions
5. créer la note
```

### en cas de doute

**DEMANDER.** Une note vide vaut mieux qu'une note avec du contenu inventé.

## structure des notes

### anatomie d'une note

```
---
frontmatter YAML (en-tete)
---

[contenu avec hierarchie de titres H2, H3...]

***
MOC ::
Localisation ::
Projet ::
Tags ::
annee ::
Date ::
Note N°::
```

### regles de structure

- **pas de H1** dans le contenu (Obsidian affiche le nom du fichier)
- **statut** : uniquement pour fleeting (Not Processed par défaut), pas obligatoire ailleurs
- **liens** : uniquement vers des notes existantes
- **metadonnees de fin** : TOUJOURS apres `***`, RIEN ne doit etre insere apres

### frontmatter YAML (IMPORTANT)

Le frontmatter YAML (entre `---`) a des règles strictes :

- **PAS de `[[liens]]`** dans le frontmatter - YAML ne supporte pas cette syntaxe
- Utiliser le **texte brut** : `auteurs: Yoann Lopez` (pas `auteurs: [[Yoann Lopez]]`)
- Les liens vers créateurs/sources vont dans les **métadonnées du BAS** (après `***`)

```yaml
# BON
---
auteurs: Yoann Lopez
type: Articles
---

# MAUVAIS
---
auteurs: [[Yoann Lopez]]  # ❌ cassera l'affichage
---
```

### nomenclature et préfixes

| préfixe | type | emplacement | exemple |
|---------|------|-------------|---------|
| `_` | MOC | `ATLAS/` | `_FINANCES PERSONNELLES` |
| `%` | Personnalité/Créateur | `SOURCES/` | `%Warren Buffet` |
| `;` | Livre | `SOURCES/Livres/` | `;Atomic Habits` |
| `{` | Source (newsletter, site) | `SOURCES/` | `{Snow ball` |
| `NL` | Note littéraire | `SOURCES/` | `NL Titre article` |
| `=` | Fleeting/idée | `CALENDAR/Fleeting/` | `=Idée random` |

**Pour les personnalités `%` :**
- Emplacement : `SOURCES/` (pas dans `Personnalité/`)
- Ajouter des **aliases** dans le frontmatter pour que les liens sans préfixe fonctionnent :

```yaml
---
aliases:
  - Yoann Lopez
---
```

**Note** : Ne jamais ajouter des orthographes incorrectes comme aliases permanents. Si des liens avec erreurs existent dans le vault, les corriger progressivement.

## edition de notes existantes (IMPORTANT)

### modes de edit_note

| mode | params | description |
|------|--------|-------------|
| **replace** | `old_string` + `new_string` | remplace un texte exact |
| **replace (normalized)** | `old_string` + `new_string` + `normalize_whitespace: true` | remplace en ignorant les espaces/tabs multiples |
| **replace_section** | `heading` + `content` | remplace le contenu sous un heading (garde le heading) |
| **delete_section** | `heading` seul | supprime la section entière (heading + contenu) |
| **insert_after** | `insert_after` + `content` | insère après un heading/texte |
| **append** | `content` seul | ajoute en fin de note |

### append / insertion de contenu

**NE JAMAIS** utiliser append brut - ca risque d'inserer apres le frontmatter ou apres les metadonnees de fin.

**TOUJOURS** :
1. Lire la note d'abord pour comprendre la structure
2. Identifier le bon endroit d'insertion (avant `***`)
3. Utiliser `insert_after` avec le dernier heading H2 pertinent, ou `replace_section` pour remplacer le contenu d'une section
4. Respecter la hierarchie des titres existante

### workflow edition

```
1. read_note pour voir la structure
2. identifier la derniere section H2 avant ***
3. choisir le mode :
   - modifier une section existante → replace_section avec heading
   - ajouter du contenu après → insert_after avec heading
   - remplacer un texte précis → replace avec old_string/new_string
4. le nouveau contenu doit avoir une hierarchie coherente
   - si la note a des H2, ajouter un H2
   - si on ajoute dans une section H2, utiliser H3
```

### exemples

**Ajouter une section :**
```
insert_after: "## Section B"
content: "## Section C\nnouveau contenu..."
```

**Remplacer le contenu d'une section :**
```
heading: "## Section B"
content: "nouveau contenu de la section B..."
```
→ garde le heading `## Section B`, remplace tout en dessous jusqu'au prochain heading de même niveau ou `***`

**Supprimer une section :**
```
heading: "## Section B"
```
→ supprime le heading + tout son contenu

## compas visuel (notes permanentes)

- **Nord** : sources, notes parentes, questions soulevées
- **Sud** : applications, conséquences, notes filles
- **Est** : idées opposées, contre-arguments
- **Ouest** : idées similaires, notes connexes

remplir uniquement si des notes pertinentes existent dans le vault.

## workflow type

```
1. user décrit la note à créer
2. suggest_links pour trouver des liens pertinents
3. DEMANDER le contenu (voir "contenu des notes")
   - "Tu veux mettre quoi dedans ?"
   - "Note vide ?" / "Recherche web ?"
4. proposer la structure avec liens + contenu validé
5. créer la note (confirmed: true)
```

## MOCs (Maps of Content)

- **nomenclature** : `_NOM` (préfixe underscore, majuscules)
- **tag obligatoire** : `#ATLAS/MOC`
- **le champ MOC ::** peut contenir des notes "catégories" même si pas vrais MOCs

### workflow MOC

quand je propose des notes comme MOC dans le champ `MOC ::` :
1. vérifier si la note est bien formatée (commence par `_`, a le tag `#ATLAS/MOC`)
2. si mal formatée → proposer de la transformer via `transform_to_moc`
3. `transform_to_moc` : renomme, ajoute tag, met à jour tous les liens entrants

## tâches (Obsidian Task)

### format
```markdown
- [ ] Description 📅 2025-01-15 ⏫
- [x] Tâche complétée ✅ 2025-01-10
```

### emojis
| emoji | signification |
|-------|---------------|
| 📅 | due date (deadline) |
| ⏫ | high priority (important) |
| 🔼 | medium priority |
| 🔽 | low priority |
| ⏬ | lowest priority |
| ✅ | done date (ajouté auto) |

### matrice d'Eisenhower
- **priorité** → **importance** : ⏫🔼 = important, 🔽⏬∅ = pas important
- **deadline** → **urgence** : ≤3 jours = urgent, >3 jours = pas urgent

| quadrant | critères |
|----------|----------|
| 1. FAIRE | urgent + important |
| 2. PLANIFIER | pas urgent + important |
| 3. DÉLÉGUER | urgent + pas important |
| 4. ÉLIMINER | pas urgent + pas important |

### 32ème jour
tâches expirées > 3 jours + pas importantes → à supprimer ou reporter indéfiniment

### où créer des tâches
- `1 - PROJET/*/` : tâches projets
- `CALENDAR/Fleeting/` : fleeting notes
- `ATLAS/Ma matrice d'Eisenhower.md` section "Tâches sans page" : orphelines
- partout ailleurs : inline dans le contenu

## conflits Syncthing

### workflow intelligent

```
1. detect_sync_conflicts → trouver les conflits
2. compare_sync_conflicts → voir le diff
3. DEMANDER à l'utilisateur :
   - "Garder l'original" → keep_original
   - "Utiliser le conflit" → use_conflict
   - "Garder les deux" → keep_both
   - "Fusionner intelligemment" → lire les deux, éditer l'original, puis keep_original
4. Si "applique à tous" → répéter pour les conflits restants
```

### fusion intelligente (option 4)

l'IA doit :
1. lire les deux versions avec `read_note`
2. comprendre ce qui est différent
3. éditer l'original avec `Edit` pour ajouter le contenu pertinent
4. supprimer le conflit avec `resolve_sync_conflict strategy="keep_original"`

**ne pas scripter** la fusion - utiliser l'intelligence de l'IA pour décider quoi garder.

## notes vides (find_empty_notes)

### usage
`find_empty_notes` trouve les notes avec peu/pas de contenu utile (hors frontmatter et métadonnées).

### interprétation des résultats

**NE PAS supprimer automatiquement** - la plupart des notes vides sont des **placeholders** :
- Lien `[[Concept]]` créé quelque part
- Clic dessus → Obsidian crée la note vide
- Jamais remplie, mais le lien est important

### quand supprimer
- **Erreurs évidentes** : fichiers mal nommés (`.md`, caractères bizarres)
- **Doublons** : même concept avec nom différent

### quand garder
- **Créateurs** (`%Nom`) : placeholders pour futures notes littéraires
- **Concepts GARDEN** : dette de contenu à remplir
- **Notes projet** : peuvent redevenir utiles
- **Notes vin/domaine** : base de connaissance à compléter

### ce que supprimer une note NE fait PAS
Supprimer une note **ne supprime pas les liens** vers elle. Les `[[liens]]` restent mais deviennent "cassés" (pointent vers rien).

## schémas Excalidraw

### deux types de schémas Excalidraw

| type | quand l'utiliser | comment créer |
|------|------------------|---------------|
| **fichier séparé** | schéma standalone, réutilisable | `create_excalidraw` |
| **schéma intégré** | schéma dans une note (ex: SOC cards) | édition manuelle dans Obsidian |

### fichiers séparés (create_excalidraw)

`create_excalidraw` compresse le JSON et crée un fichier `.excalidraw.md` séparé. **L'IA génère le JSON**, l'outil gère la compression.

**JAMAIS avec `create_projet_note`** : les métadonnées cassent le format.

### schémas intégrés (IMPORTANT)

Pour intégrer un schéma dans une note existante (comme les SOC cards du Content Hub), **NE PAS utiliser `create_excalidraw`**. L'outil crée des fichiers séparés avec une section `## Text Elements` vide.

**Workflow schéma intégré :**
1. Créer la note avec le contenu texte
2. Ouvrir dans Obsidian et convertir en Excalidraw manuellement
3. Dessiner le schéma dans l'éditeur Excalidraw d'Obsidian
4. Obsidian génère automatiquement le format correct (Text Elements + compressed-json)

**Format d'un schéma intégré fonctionnel :**
```markdown
---
excalidraw-plugin: parsed
tags:
  - excalidraw
[autres métadonnées...]
---

[contenu de la note...]

# Excalidraw Data

## Text Elements
Titre du schéma ^abc123

Élément 1 ^def456

Élément 2 ^ghi789

%%
## Drawing
\`\`\`compressed-json
[données compressées générées par Obsidian]
\`\`\`
%%
```

**Points critiques :**
- `## Text Elements` doit lister CHAQUE texte avec son ID unique (`^xxxxx`)
- Les IDs doivent correspondre aux références dans le compressed-json
- Le compressed-json est généré par Obsidian, pas par l'IA
- Sans les Text Elements corrects, erreur "No number after minus sign in JSON"

### nomenclature

| contexte | format | emplacement |
|----------|--------|-------------|
| global | `Schéma - {Nom}.excalidraw.md` | `EXTRA/Excalidraw/IA/` |
| projet | `Schéma - {INITIALES} {nom}.excalidraw.md` | dossier du projet |

### structure JSON Excalidraw

Chaque élément doit avoir :

```json
{
  "id": "unique-id",
  "type": "rectangle|ellipse|text|arrow|line",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 80,
  "strokeColor": "#1e1e1e",
  "backgroundColor": "#d4e4f4",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "roughness": 0,
  "opacity": 100,
  "seed": 12345,
  "version": 1,
  "versionNonce": 67890,
  "isDeleted": false,
  "groupIds": []
}
```

### best practices (10 règles d'or)

1. **Simplicité** : compréhensible en 5 secondes
2. **Max 7-9 éléments** : au-delà, difficile à lire
3. **Labels courts** : 3-4 mots maximum
4. **Espacement généreux** : 32px minimum entre boîtes
5. **Flux logique** : gauche→droite ou haut→bas
6. **Palette Paul Tol** (colorblind-safe) :
   - `#4477AA` (bleu) = principal, système
   - `#228833` (vert) = succès, validation
   - `#CCBB44` (jaune) = attention, warnings
   - `#EE6677` (rouge) = erreur, critique
   - `#66CCEE` (cyan) = info, données
   - `#BBBBBB` (gris) = désactivé, neutre
7. **Contraste** : fond clair + texte foncé (#1e1e1e)
8. **Alignement** : grille 20px
9. **Cohérence** : même forme = même type d'élément
10. **Texte libre** : positionner manuellement (éviter `containerId`)

### types d'éléments

| type | usage |
|------|-------|
| `rectangle` | boîtes, conteneurs |
| `ellipse` | débuts/fins, états |
| `diamond` | décisions |
| `text` | labels (toujours libres, pas de containerId) |
| `arrow` | connexions, flux |
| `line` | séparateurs, groupes |

### centrage du texte (IMPORTANT)

**Toujours utiliser du texte libre** positionné manuellement. `containerId` cause des bugs d'affichage.

**Formule de centrage :**
```
text.x = shape.x + (shape.width - textWidth) / 2
text.y = shape.y + (shape.height - textHeight) / 2
```

**Estimation largeur texte :**
- ~10px par caractère (fontSize 16-20)
- Exemple : "Module A" (8 chars) ≈ 80px de large

**Exemple complet :**
```json
// Boîte 200x60 à position (100, 100)
{ "id": "box1", "type": "rectangle", "x": 100, "y": 100, "width": 200, "height": 60, ... }

// Texte "Start" (5 chars ≈ 50px) centré dans la boîte
// x = 100 + (200 - 50) / 2 = 175
// y = 100 + (60 - 20) / 2 = 120 (fontSize 20 ≈ 20px height)
{ "id": "text1", "type": "text", "x": 175, "y": 120, "width": 50, "height": 20, "text": "Start", "fontSize": 20, "textAlign": "center", ... }
```

### formes standard par type de diagramme

**Flowchart :**
- Rectangle 160×60 : étapes/processus
- Ellipse 120×50 : début/fin
- Diamond 120×80 : décisions

**Dimensions recommandées :**
- Largeur boîte : 120-180px
- Hauteur boîte : 48-64px
- Espacement vertical : 40-60px
- Espacement horizontal : 80-120px

### flèches (IMPORTANT)

**Règles de base :**
- Premier point = **toujours `[0, 0]`**
- Tous les points sont **relatifs** à `(x, y)` de la flèche
- Y négatif = remonter, X négatif = aller à gauche

**Flèche simple (droite) :**
```json
{ "type": "arrow", "x": 200, "y": 150, "points": [[0, 0], [0, 50]], "endArrowhead": "triangle" }
```

**Elbow arrows (angles 90°) - RECOMMANDÉ pour flowcharts :**
```json
{
  "type": "arrow",
  "elbowed": true,
  "x": 200, "y": 150,
  "points": [[0, 0], [0, 50], [100, 50]],
  "endArrowhead": "triangle"
}
```

### flèches de loop (retour)

Pour une flèche qui remonte (ex: Fix → Implement) :

**Formule générale :**
```
Source : (sourceX, sourceY) = bord de départ
Cible  : (targetX, targetY) = milieu du bord d'arrivée

deltaX = targetX - sourceX
deltaY = targetY - sourceY

points: [
  [0, 0],              // départ
  [marge, 0],          // sort sur le côté (marge = 40px)
  [marge, deltaY],     // monte/descend jusqu'au niveau exact de la cible
  [deltaX, deltaY]     // va horizontalement jusqu'à la cible
]
```

**Exemple concret :**
```
Fix (340, 350, 120×60) → Implement (120, 230, 160×60)

Source : bord droit Fix     = (460, 380)  // 340+120, 350+30
Cible  : bord droit Impl    = (280, 260)  // 120+160, 230+30

deltaX = 280 - 460 = -180
deltaY = 260 - 380 = -120

points: [[0,0], [40,0], [40,-120], [-180,-120]]
```

**Règles d'or :**
1. `elbowed: true` pour angles 90° propres
2. Calculer `deltaY` **exactement** vers le milieu de la cible
3. `strokeStyle: "dashed"` = convention pour loops
4. Couleur différente (`#EE6677`) pour distinguer du flux normal
