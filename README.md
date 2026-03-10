# Vault Portal Sync

Plugin Obsidian pour synchroniser votre vault vers [Vault Portal](https://portal.matthieucousin.com) via l'API collab.

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

1. Configurer les **rules de scope** (quels dossiers/tags/notes partager)
2. Lancer la sync via la commande `Vault Portal Sync: Sync` ou le bouton ribbon

## Fonctionnalites

- Sync selective par dossiers, tags et notes liees
- Groupes de rules AND/OR pour un controle fin
- Preview des fichiers en scope avant sync
- Sync des pieces jointes (images, PDF)
- Watch mode (sync automatique a la modification)
