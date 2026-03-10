# Claude Agent SDK

> Derniere mise a jour : 4 fevrier 2026
> Sources : claude-code-architecture-deep-dive.md, docs officielles Anthropic

## Vue d'ensemble

Le **Claude Agent SDK** (anciennement Claude Code SDK) = API officielle pour construire des agents avec les memes outils, boucle d'agent et gestion de contexte que Claude Code.

**Renommage** : Claude Code SDK → Claude Agent SDK (reflete la vision plus large).

## Installation

```bash
# Python (3.10+)
pip install claude-agent-sdk

# TypeScript/Node
npm install @anthropic-ai/claude-agent-sdk
```

Le CLI Claude Code est inclus automatiquement.

## Deux API principales

### 1. `query()` - Requetes async simples

```python
from claude_agent_sdk import query, ClaudeAgentOptions

async for message in query(
    prompt="Find and fix the bug in auth.py",
    options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"])
):
    print(message)
```

### 2. `ClaudeSDKClient` - Conversations interactives

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions

async with ClaudeSDKClient(options=options) as client:
    await client.query("Your prompt")
    async for msg in client.receive_response():
        print(msg)
```

## Outils disponibles

| Outil | Fonction |
|-------|----------|
| **Read** | Lire fichiers |
| **Write** | Creer fichiers |
| **Edit** | Modifier fichiers |
| **Bash** | Terminal, git |
| **Glob** | Trouver fichiers par pattern |
| **Grep** | Rechercher contenu fichiers |
| **WebSearch** | Recherche web |
| **WebFetch** | Recuperer/parser pages web |
| **Task** | Spawner subagents |

## Custom Tools (MCP in-process)

Pas besoin de processus separes :

```python
from claude_agent_sdk import tool, create_sdk_mcp_server

@tool("greet", "Greet a user", {"name": str})
async def greet_user(args):
    return {"content": [{"type": "text", "text": f"Hello, {args['name']}!"}]}

server = create_sdk_mcp_server(
    name="my-tools", version="1.0.0", tools=[greet_user]
)

options = ClaudeAgentOptions(
    mcp_servers={"tools": server},
    allowed_tools=["mcp__tools__greet"]
)
```

**Avantages vs MCP externes** : Pas d'overhead IPC, meme processus, debug facile, type safety.

## Hooks programmatiques

```python
from claude_agent_sdk import ClaudeAgentOptions, HookMatcher

async def check_bash(input_data, tool_use_id, context):
    command = input_data.get("tool_input", {}).get("command", "")
    if "dangerous" in command:
        return {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": "Blocked"
            }
        }
    return {}

options = ClaudeAgentOptions(
    hooks={"PreToolUse": [HookMatcher(matcher="Bash", hooks=[check_bash])]}
)
```

## Sessions et contexte

Maintien du contexte entre echanges :

```python
session_id = None

# Premiere requete : capturer session_id
async for msg in query(prompt="Read auth module", options=opts):
    if hasattr(msg, 'subtype') and msg.subtype == 'init':
        session_id = msg.data.get('session_id')

# Reprendre avec contexte complet
async for msg in query(
    prompt="Now find all callers",
    options=ClaudeAgentOptions(resume=session_id)
):
    pass
```

## Authentification

| Methode | Variable |
|---------|----------|
| API key Anthropic | `ANTHROPIC_API_KEY` |
| Amazon Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` |
| Google Vertex AI | `CLAUDE_CODE_USE_VERTEX=1` |
| Microsoft Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` |

**Interdit** : Anthropic n'autorise pas les devs tiers a offrir Claude.ai login pour leurs produits.

## Agent SDK vs autres

### SDK vs Client SDK

```python
# Client SDK : vous implementez la boucle d'outils
response = client.messages.create(...)
while response.stop_reason == "tool_use":
    result = your_executor(response.tool_use)
    response = client.messages.create(tool_result=result, ...)

# Agent SDK : Claude gere les outils de maniere autonome
async for msg in query(prompt="Fix the bug"):
    print(msg)
```

### SDK vs CLI

| Cas d'usage | Meilleur choix |
|-------------|----------------|
| Dev interactif | CLI |
| CI/CD pipelines | SDK |
| Applications custom | SDK |
| Taches ponctuelles | CLI |
| Automation production | SDK |

## Options ClaudeAgentOptions

| Option | Type | Description |
|--------|------|-------------|
| `cwd` | string | Repertoire de travail |
| `system_prompt` | string | Prompt systeme custom |
| `allowed_tools` | list | Outils autorises |
| `denied_tools` | list | Outils interdits |
| `permission_mode` | string | `"default"`, `"acceptEdits"`, `"plan"`, `"bypassPermissions"` |
| `model` | string | Modele a utiliser |
| `max_turns` | int | Nombre max de tours avant arret |
| `max_tokens` | int | Tokens max de sortie |
| `setting_sources` | list | Sources de config (`"project"` charge CLAUDE.md, skills, etc.) |
| `resume` | string | Session ID pour reprise |
| `mcp_servers` | dict | Serveurs MCP custom (in-process ou externes) |
| `hooks` | dict | Hooks programmatiques |
| `agents` | dict | Agents custom inline |
| `plugins` | dict | Plugins a activer |
