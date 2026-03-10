# CLI, Commandes et Workflows

> Derniere mise a jour : 4 fevrier 2026
> Sources : claude-code-cli-advanced-tips.md, docs officielles

## Commandes slash integrees

### Session et contexte

| Commande | Effet |
|----------|-------|
| `/clear` | Reset complet du contexte (plus fiable que /compact entre taches) |
| `/compact` | Resume et reduit le contexte |
| `/compact [instructions]` | Resume avec focus specifique ("Preserve auth decisions") |
| `/cost` | Cout de la session en cours |
| `/context` | Repartition tokens du contexte (warnings si skills exclus) |
| `/memory` | Voir tous les fichiers memoire charges (CLAUDE.md, rules, etc.) |
| `/status` | Status de la session |

### Configuration et diagnostic

| Commande | Effet |
|----------|-------|
| `/config` | Configuration Claude Code |
| `/permissions` | Voir les permissions actives (allow/deny) |
| `/mcp` | Voir les serveurs MCP connectes |
| `/doctor` | Diagnostic de l'installation |
| `/init` | Generer un CLAUDE.md initial |
| `/login` | Se connecter |
| `/logout` | Se deconnecter |
| `/bug` | Reporter un bug |

### Modes

| Commande | Effet |
|----------|-------|
| `/vim` | Activer le mode vim (keybindings vim) |
| `/help` | Aide generale |

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Escape` (1x) | Arreter Claude immediatement |
| `Escape` (2x) | Historique des messages |
| `Shift+Tab` | Changer de mode (default ↔ plan ↔ acceptEdits) |
| `Ctrl+C` | **QUITTER** (pas pour arreter, utiliser Escape) |
| `Ctrl+V` | Coller image/screenshot |
| `#` | Quick update du CLAUDE.md (Claude propose les ajouts) |
| `@` | Mentionner un fichier dans le prompt |

**Piege courant** : `Ctrl+C` ne stoppe PAS Claude — il QUITTE l'application. Utiliser `Escape` pour stopper.

## Modes d'utilisation

| Mode | Flag | Comportement |
|------|------|-------------|
| **Interactif** | (defaut) | Conversation dans le terminal |
| **Headless** | `-p "prompt"` | One-shot, sortie stdout |
| **JSON** | `--json` | Sortie structuree JSON |
| **Plan** | `--mode plan` ou `shift+tab` x2 | Lecture seule, propose sans modifier |
| **Accept edits** | `shift+tab` | Auto-approuve les modifications fichiers |
| **Resume** | `--resume` | Reprendre session precedente |
| **Continue** | `--continue` | Continuer la derniere session |
| **MCP debug** | `--mcp-debug` | Voir les erreurs de config MCP |
| **YOLO** | `--dangerously-skip-permissions` | Skip toutes les permissions (dangereux) |

## Headless mode (-p)

```bash
# One-shot simple
claude -p "Liste les fichiers TypeScript avec des TODOs"

# Pipeline (chainer)
claude -p "Analyse ce code" --json | jq -r '.files[]' | xargs -I {} claude -p "Fix {}"

# Fan-out (parallele)
claude -p "Liste les fichiers" --json | jq -r '.[]' | parallel claude -p "Review {}"

# GitHub Actions
claude -p "Analyse this issue: $ISSUE_BODY" | gh issue edit $NUM --add-label
```

## Statusline

Afficher des metrics en temps reel dans la barre de statut :

```bash
# .claude/statuslines/statusline.sh
# Affiche : tokens utilises, cout, branche git, etc.
```

Exemple de output :
```
[main] 12.5k/200k tokens (6.25%) | $0.15 | 3 files modified
```

Aide a comprendre la consommation de contexte en temps reel.

## Workflow : Explore → Plan → Code → Commit

### 1. Exploration (pas de code)

```
"Analyse ce fichier et identifie les edge cases"
```

### 2. Planning (validation humaine)

```
"Propose un plan en 5 etapes pour refactorer ce code"
→ Attendre validation
```

### 3. Implementation incrementale

```
"Implemente seulement l'etape 1, montre-moi le diff"
→ Garder diffs < 200 lignes
→ Feedback precis sur echecs tests
```

### 4. Commit

```
"Commit ces changements avec un message descriptif"
```

## Feedback loops

### TDD avec Claude

```bash
# 1. Ecrire les tests
"Cree des tests pour : input valide, null, array vide"

# 2. Verifier qu'ils echouent
npm test  # Doit echouer

# 3. Implementer
"Implemente la fonction pour passer ces tests"

# 4. Iterer
# Claude ajuste automatiquement
```

### Visual iteration

```
1. Claude genere le code UI
2. Screenshot (cmd+ctrl+shift+4)
3. Coller dans Claude (ctrl+V)
4. "Le padding est trop serre, augmente a 24px"
5. Re-screenshot, iterer 2-3x
```

Reduit iterations de 30% vs descriptions textuelles.

### Hooks pour forcer le loop

```json
{
  "PreToolUse": [{
    "matcher": "Bash(git commit:*)",
    "hooks": [{
      "type": "command",
      "command": "test -f .test-passed || (echo 'Tests must pass' && exit 1)"
    }]
  }]
}
```

## Git worktrees + tmux (parallelisme)

```bash
# Creer worktrees
git worktree add ../feature-auth feature-auth
git worktree add ../feature-ui feature-ui

# Session tmux avec panes
tmux new-session -d -s dev
tmux split-window -h
tmux send-keys -t dev:0.0 "cd ../feature-auth && claude" Enter
tmux send-keys -t dev:0.1 "cd ../feature-ui && claude" Enter
tmux attach -t dev
```

**Outils** : workmux, dmux, Uzi
**Gains** : 5-8x en parallelisant les features
**Limite** : Plan Pro epuise vite, preferer Max

## Handoff pattern (sessions longues)

Quand le contexte devient trop gros :

```
1. "Documente ton progres dans HANDOFF.md"
2. /clear
3. "Lis HANDOFF.md et continue"
```

Alternative : `/compact Focus on preserving [sujet important]`

## Tips power user

### Aliases terminal

```bash
alias c="claude"
alias ch="claude -p"  # headless
```

### Voice input

- SuperWhisper ou MacWhisper (macOS)
- Communique plus vite qu'en tapant

### Copy-paste pour contenu bloque

Sites derriere login (Reddit, etc.) :
1. Ouvrir dans navigateur
2. Cmd+A, Cmd+C
3. Coller dans Claude Code

### Auto-verification

```
"Cree une table avec chaque claim que tu as faite
et verifie-les une par une"
```

### Problem decomposition

```
# Mauvais
"Cree un systeme d'auth complet"

# Bon
"Decompose ce probleme en sous-problemes"
→ Claude propose 1.1, 1.2, 2.1...
"Implemente seulement 1.1"
```

### /clear entre taches

Best practice : `/clear` entre chaque tache majeure.
- Conversation history s'accumule
- Fichiers lus restent en contexte
- Instructions task-specific des messages precedents interferent
- Les CLAUDE.md et rules sont automatiquement recharges

### Quick update avec #

Taper `#` en session pour que Claude :
1. Analyse le contexte actuel
2. Propose d'ajouter de nouvelles instructions au CLAUDE.md
3. Commit pour partager avec l'equipe
