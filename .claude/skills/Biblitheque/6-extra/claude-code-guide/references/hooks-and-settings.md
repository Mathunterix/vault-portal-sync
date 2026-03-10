# Hooks et Configuration Claude Code

> Derniere mise a jour : 4 fevrier 2026
> Sources : claude-code-hooks-guide.md, claude-code-cli-advanced-tips.md, docs officielles, skills-comprehensive-guide.md

## Hooks : 12 evenements

### Bloquants (peuvent empecher l'action)

| Hook | Quand | Blocage | Usage |
|------|-------|---------|-------|
| **PreToolUse** | Avant execution outil | `exit 2` ou `decision: "block"` | Validation commandes, blocage patterns, modification inputs |
| **UserPromptSubmit** | Apres prompt, avant traitement | `exit 2` | Injection contexte, validation, enrichissement prompt |
| **PermissionRequest** | Permission demandee | `decision: "allow"/"deny"` | Auto-approbation commandes sures |
| **Stop** | Claude finit de repondre | `decision: "block"` force continuation | Validation tests avant fin, forced eval |

### Non-bloquants (feedback uniquement)

| Hook | Quand | Usage |
|------|-------|-------|
| **PostToolUse** | Apres execution reussie | Auto-format, lint, logs audit |
| **PostToolUseFailure** | Apres echec outil | Rollback, alertes |
| **Notification** | Notification envoyee | Slack, desktop notifications, Telegram |
| **SessionStart** | Debut session | Charger contexte git, TODOs, env vars |
| **SessionEnd** | Fin session | Cleanup, sauvegarde, stats |
| **SubagentStart** | Sous-agent demarre | Monitoring |
| **SubagentStop** | Sous-agent termine | Validation output (bloquant) |
| **PreCompact** | Avant compaction | Backup transcript |

**Note** : `SessionStart`, `SessionEnd`, `Notification` non disponibles dans le Python SDK.

### Trois types de hooks

| Type | Syntaxe | Execution | Quand utiliser |
|------|---------|-----------|----------------|
| **Command** | `{ "type": "command", "command": "bash script.sh" }` | Script shell (rapide, deterministe) | Lint, format, validation, notifications |
| **Prompt** | `{ "type": "prompt", "prompt": "Evalue si...", "model": "sonnet" }` | LLM decide (flexible, contextuel). Retourne `{"ok": true/false, "reason": "..."}` | Evaluation semantique, decisions complexes |
| **Agent** | `{ "type": "agent", "prompt": "Verify tests...", "model": "sonnet" }` | Agent complet avec outils (Read, Grep, Glob). Max 50 turns. | Verification multi-fichiers, validation complexe |

### Async hooks

```json
{
  "type": "command",
  "command": "./long-task.sh",
  "async": true,
  "timeout": 300
}
```

Execution en arriere-plan. Claude continue sans attendre. Output delivre au prochain tour de conversation. Pas de decision control (action deja executee).

## Configuration

### Exit code 2 : comportement par event

| Event | Peut bloquer ? | Effet du exit 2 |
|-------|---------------|-----------------|
| PreToolUse | Oui | Bloque l'appel d'outil |
| PermissionRequest | Oui | Refuse la permission |
| UserPromptSubmit | Oui | Bloque + efface le prompt |
| Stop | Oui | Empeche l'arret, Claude continue |
| SubagentStop | Oui | Empeche l'arret du subagent |
| PostToolUse | Non | stderr montre a Claude |
| PostToolUseFailure | Non | stderr montre a Claude |
| Autres | Non | stderr montre a l'utilisateur uniquement |

## Configuration

### Emplacements (ordre de priorite)

| Fichier | Portee | Git | Priorite |
|---------|--------|-----|----------|
| Managed (enterprise) | Organisation | N/A | 1 (plus haute) |
| `~/.claude/settings.json` | User global | N/A | 2 |
| `.claude/settings.json` | Projet equipe | Oui | 3 |
| `.claude/settings.local.json` | Projet local | Non | 4 (plus basse) |

### Format JSON

```json
{
  "hooks": {
    "EventName": [
      {
        "name": "Description (optionnel)",
        "matcher": "ToolPattern (optionnel, ignore pour certains events)",
        "run_in_background": false,
        "hooks": [
          { "type": "command", "command": "bash script.sh" },
          { "type": "prompt", "prompt": "Evalue si..." }
        ]
      }
    ]
  }
}
```

Le champ `run_in_background` permet d'executer le hook de maniere non-bloquante.
```

### Syntaxe matchers

| Pattern | Match |
|---------|-------|
| `"Write"` | Outil Write uniquement |
| `"Write\|Edit"` | Write OU Edit (pipe = OR) |
| `"*"` ou `""` | Tous les outils |
| `"Bash(npm test*)"` | Bash avec args commencant par "npm test" |
| `"mcp__memory__.*"` | Regex pour outils MCP |

**Matchers ignores** pour : Stop, SubagentStop, SessionStart, SessionEnd, Notification, PreCompact.

## Payloads

### Entree (stdin JSON)

Champs communs :
```json
{
  "session_id": "...",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/dir",
  "hook_event_name": "PreToolUse"
}
```

Champs specifiques :
- **PreToolUse** : `tool_name`, `tool_input`
- **PostToolUse** : `tool_name`, `tool_input`, `tool_response`
- **UserPromptSubmit** : `prompt`, `timestamp`
- **SessionStart** : `source` (`"startup"`, `"resume"`, `"clear"`, `"compact"`)
- **SessionEnd** : `reason` (`"clear"`, `"logout"`, `"prompt_input_exit"`, `"bypass_permissions_disabled"`, `"other"`)
- **Notification** : matcher values = `"permission_prompt"`, `"idle_prompt"`, `"auth_success"`, `"elicitation_dialog"`
- **PreCompact** : matcher values = `"manual"`, `"auto"`

### Sortie (stdout JSON)

**Universel** :
```json
{ "continue": true, "stopReason": "...", "systemMessage": "..." }
```

**PreToolUse** :
```json
{
  "decision": "block",
  "reason": "Commande dangereuse",
  "updatedInput": { "command": "..." }
}
```

`updatedInput` (v2.0.10+) : **modifie les inputs avant execution sans bloquer**. Cas d'usage :
- Rewrite de commandes Bash (ajouter flags de securite)
- Modification de chemins de fichiers
- Injection de parametres supplementaires
- Transformation de commandes dangereuses en versions sures

**Decisions** : `"approve"`, `"block"`, `"allow"`, `"deny"`

### Exit codes

| Code | Effet |
|------|-------|
| `0` | Succes, stdout traite |
| `2` | **Bloquant** : stderr = message erreur |
| Autre | Non-bloquant, stderr en verbose |

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `CLAUDE_PROJECT_DIR` | Racine du projet |
| `CLAUDE_FILE_PATHS` | Fichiers modifies (espaces) |
| `CLAUDE_TOOL_NAME` | Outil en cours |
| `CLAUDE_WORKING_DIR` | Repertoire de travail |
| `CLAUDE_SESSION_ID` | ID session |
| `CLAUDE_CODE_REMOTE` | "true" si env web |
| `CLAUDE_ENV_FILE` | (SessionStart uniquement) Fichier pour persister env vars entre hooks |

**`CLAUDE_ENV_FILE`** : ecrire `KEY=VALUE` dans ce fichier pendant SessionStart rend les variables disponibles pour tous les hooks suivants de la session.

**Toujours quoter** : `"$CLAUDE_PROJECT_DIR"/.claude/hooks/script.sh`

## Settings et permissions

### Permissions

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Edit(src/**/*.ts)"
    ],
    "deny": [
      "Bash(rm:*)",
      "Read(./.env)",
      "Bash(git push --force:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "WebFetch(*)"
    ]
  }
}
```

**Priorite** : `deny` override toujours `allow`.

### Modes de permission

| Mode | Comportement | Raccourci |
|------|-------------|-----------|
| `default` | Demande au premier usage | - |
| `acceptEdits` | Auto-approuve fichiers | - |
| `plan` | **Lecture seule** | `shift+tab` x2 |
| `bypassPermissions` | Skip tout | `--dangerously-skip-permissions` |

**Bug connu** : Rules `deny` pour Read/Write non-fonctionnelles dans certains cas (Issue #6631). Ne pas se fier uniquement aux permissions Claude.

### Settings additionnels (recents)

| Setting | Type | Description |
|---------|------|-------------|
| `plansDirectory` | string | Chemin pour stocker les plans (versionnable dans git). Ex: `"plansDirectory": "./plans"` |
| `language` | string | Langue de la session. Ex: `"language": "french"`. Claude maintient la langue tout au long. |

### Wildcard permissions

Syntaxe avancee pour les permissions :

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test *)",
      "mcp__github__*"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env*)"
    ]
  }
}
```

`mcp__server__*` approuve tous les outils d'un serveur MCP d'un coup.

### MCP configuration

```json
{
  "mcpServers": {
    "server-name": {
      "command": "mcp-server-xxx",
      "args": ["--flag"],
      "env": { "KEY": "value" }
    }
  }
}
```

Debug : `claude --mcp-debug`

### MCP Tool Search (janvier 2026)

Quand les descriptions MCP depassent 10% du context window, Claude Code active le **chargement dynamique** des outils MCP au lieu de tout precharger.

- Reduction : 51K → 8.5K tokens (46.9%)
- S'active automatiquement
- Permet de connecter des dizaines de MCP servers sans exploser le contexte

## Settings.json : cles disponibles

```json
{
  "model": "claude-sonnet-4-5-20250929",
  "cleanupPeriodDays": 30,
  "language": "french",
  "plansDirectory": "./plans",
  "alwaysThinkingEnabled": false,
  "autoUpdatesChannel": "stable",

  "permissions": {
    "allow": ["Bash(npm run *)"],
    "deny": ["Bash(curl *)"],
    "ask": ["Bash(git push *)"],
    "additionalDirectories": ["../docs/"],
    "defaultMode": "default",
    "disableBypassPermissionsMode": "disable"
  },

  "attribution": { "commits": true, "pullRequests": true },

  "hooks": {},
  "disableAllHooks": false,

  "mcpServers": {},
  "enableAllProjectMcpServers": false,

  "env": { "NODE_ENV": "production" },

  "sandbox": {
    "enabled": true,
    "autoAllowBashIfSandboxed": true,
    "network": {
      "allowedDomains": ["github.com"],
      "allowLocalBinding": true
    }
  }
}
```

**Cles notables** :
- `additionalDirectories` : dossiers supplementaires accessibles
- `attribution` : co-author automatique dans commits/PRs
- `sandbox` : isolation des commandes Bash (domains reseau, sockets)
- `env` : variables d'environnement injectees dans tous les hooks
- `alwaysThinkingEnabled` : force extended thinking

## Exemples essentiels

### Auto-format apres edition

```json
{
  "PostToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{ "type": "command", "command": "prettier --write \"$CLAUDE_FILE_PATHS\"" }]
  }]
}
```

### Blocage commandes dangereuses

```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{ "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/security-check.sh" }]
  }]
}
```

### Contexte git au demarrage

```json
{
  "SessionStart": [{
    "hooks": [{ "type": "command", "command": "bash .claude/hooks/load-git-context.sh" }]
  }]
}
```

### Tests obligatoires avant fin

```json
{
  "Stop": [{
    "hooks": [{ "type": "command", "command": "bash .claude/hooks/check-tests.sh" }]
  }]
}
```

### Desktop notification

```json
{
  "Notification": [{
    "hooks": [{ "type": "command", "command": "osascript -e 'display notification \"$NOTIFICATION_TEXT\" with title \"Claude Code\"'" }]
  }]
}
```
