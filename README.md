# Vault Portal Sync

Plugin Obsidian pour synchroniser votre vault vers Vault Portal via l'API collab.

## Installation (via BRAT)

1. Installer le plugin [BRAT](https://github.com/TfTHacker/obsidian42-brat) depuis les Community plugins
2. `Cmd+P` > **BRAT: Add a beta plugin for testing**
3. Coller : `Mathunterix/vault-portal-sync`
4. Activer **Vault Portal Sync** dans Settings > Community plugins

## Configuration

1. Ouvrir les settings du plugin
2. Renseigner l'**URL du portail** (fournie par l'admin)
3. Renseigner le **token** (fourni par l'admin)
4. Cliquer **Tester la connexion**

## Usage

### Rules de scope

Configurer quels dossiers, tags ou notes liees partager avec vos audiences. Les rules sont organisees en groupes :
- Rules dans un meme groupe = **AND** (intersection)
- Groupes entre eux = **OR** (union)

On peut aussi ajouter des **exclusions** qui retirent des fichiers du scope apres les inclusions.

Le bouton **preview** affiche la liste des fichiers partages avec l'audience (visibles dans le wiki).

### Fichiers de contexte (metadonnees)

Certains fichiers sont synchronises automatiquement grace a leurs metadonnees frontmatter, mais ne sont **pas visibles** par les audiences :

| Metadonnee | Role | Visible wiki |
|------------|------|---|
| `user-portal: slug` | Contexte chatbot per-user (notes du coach sur un eleve) | Non |
| `audience-portal: slug` | Contexte chatbot per-audience (system prompt) | Non |
| `audience: slug` | Assigne le fichier a une audience | **Oui** |
| `share: false` | Empeche tout partage | Non (exclu) |

Les fichiers de contexte (`user-portal`, `audience-portal`) apparaissent dans un bloc dedie en haut des settings, separe des audiences. Ils ne sont pas comptes dans les "fichiers partages" de chaque audience.

Les fichiers avec `audience: nom-de-laudience` sont comptes dans les fichiers partages de l'audience correspondante (car visibles dans le wiki).

### Synchronisation

| Mode | Description |
|------|-------------|
| **Sync manuelle** | Bouton "Sync" dans les settings ou icone ribbon (nuage). Toujours disponible |
| **Sync a la modification** | Synchronise automatiquement quand un fichier partage est modifie (debounce 5s) |
| **Sync periodique** | Synchronise en arriere-plan toutes les X minutes. Silencieuse si rien n'a change |

Le toggle **Synchronisation automatique** controle les deux modes auto (modification + periodique). Quand il est desactive, seule la sync manuelle fonctionne.

## Fonctionnalites

- Sync selective par dossiers, tags et notes liees
- Groupes de rules AND/OR pour un controle fin
- Preview des fichiers partages par audience (sans les fichiers de contexte chatbot)
- Sync des pieces jointes (images, PDF)
- Sync a la modification (fichiers partages uniquement)
- Sync periodique silencieuse (notifie seulement quand il y a des changements)
- Suppression complete des rules possible (un collab peut arreter de partager)
