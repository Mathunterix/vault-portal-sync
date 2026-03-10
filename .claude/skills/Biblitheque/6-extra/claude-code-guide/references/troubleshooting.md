# Troubleshooting Claude Code

> Derniere mise a jour : 4 fevrier 2026
> Sources : deep searches, GitHub issues, experience directe

## /compact : risques et bonnes pratiques

### Comment ca marche

- Prend l'historique complet → cree un **resume** → redemarre avec ce resume
- `/compact` ≠ `/clear` : resume vs suppression totale
- Auto-compact : se declenche a ~75% capacite (50K tokens libres pour raisonnement)

### Problemes documentes

| Issue | Probleme | Impact |
|-------|----------|--------|
| **#13919** | Perte contexte Skills post-compaction | Taches 5-6x plus longues |
| **#6004** | Boucle infinie de compaction | Consommation rapide du quota |
| **#2391** | Compact conversation infinite loop | Tache jamais completee |
| **#7530** | Erreur pendant compaction | Session corrompue |
| **#13929** | Auto-compact echoue si conversation trop longue | Blocage |

### Symptomes de perte de contexte

- Claude ne suit plus les procedures des Skills
- Repete des erreurs deja corrigees
- Questions repetitives sur des sujets deja discutes
- Output qui se degrade progressivement

### Bonnes pratiques

1. **Ne pas attendre l'auto-compact** : compacter proactivement entre taches
2. **Donner des instructions** : `/compact Preserve authentication decisions`
3. **Tester apres compact** : poser une question sur un element critique
4. **Documenter avant compact** : "Voici ou on en est : [liste]"
5. **Preferer /clear** entre taches distinctes (plus fiable)
6. **Git comme memoire externe** : commits reguliers avec messages detailles

### Ameliorations sept 2025

- Context editing : supprime auto les appels d'outils obsoletes
- Memory tool : persistance cross-session
- Resultats : -84% tokens consommes, +39% performance

## Erreurs courantes

### Context plein

**Symptomes** : "Out of context", ralentissements, Claude mentionne fichiers anciens

**Solutions** :
1. `/compact` (garde resume)
2. `/clear` (reset total)
3. Handoff : documenter dans HANDOFF.md puis /clear

### Escape key

| Action | Resultat |
|--------|----------|
| `Escape` (1x) | Arrete Claude |
| `Escape` (2x) | Historique messages |
| `Ctrl+C` | **QUITTE** (ne pas utiliser pour arreter) |

**Bugs** :
- Double Esc ne marche pas avec images 5MB+ → `/clear`
- Esc n'interrompt pas dans terminal JetBrains → remapper keybinding
- Issue #18266 : Ctrl-Esc focus bug sur VS Code Linux

### Images

| Probleme | Workaround |
|----------|------------|
| Ctrl+V ne fonctionne pas (VS Code) | Glisser-deposer |
| Drag & drop casse (#5745) | Utiliser le chemin absolu |
| Boucle infinie images 5MB+ (#13383) | Reduire taille avant upload |
| upload_image error (#15880) | Scope/context mismatch |

Reduire les images :
```bash
magick input.png -resize 1920x1080 -quality 85 output.png
```

### Installation

**Node.js version** :
```bash
# WSL : utilise Node de Windows par erreur
nvm install 18 && nvm use 18
```

**Permissions** :
```bash
sudo chown -R $(whoami) ~/.npm
```

**Authentication** :
```bash
claude config  # Verifier API key
curl https://status.anthropic.com/api/v2/status.json  # Status
```

### Performance

- **Lent** : switch a Sonnet (plus rapide), `/compact`, preferer Linux/macOS
- **RAM** : minimum 16GB recommande
- **WSL** : configurer `.wslconfig` avec `memory=8GB`

**Reset complet** (dernier recours) :
```bash
npm uninstall -g @anthropic-ai/claude-code
rm ~/.claude.json && rm -rf ~/.claude/
npm install -g @anthropic-ai/claude-code
```

## Debug MCP

```bash
claude --mcp-debug  # Voir les erreurs de config
```

**Problemes courants** :
- Serveur MCP qui timeout silencieusement → relancer session
- Config permissions manquante → verifier `.claude/settings.json`
- Noms d'outils mal orthographies → `mcp__serveur__outil`

## Debug Skills

### Skill ne se declenche pas

1. Verifier que la description contient les mots-cles naturels
2. `"What skills are available?"` pour lister
3. Rephraser la requete pour matcher la description
4. Invoquer directement : `/skill-name`

### Skill se declenche trop souvent

1. Rendre la description plus specifique
2. Ajouter `disable-model-invocation: true`

### Skills non visibles

**Cause** : descriptions depassent le budget caracteres (defaut 15,000)
**Check** : `/context` → warning about excluded skills
**Fix** : `SLASH_COMMAND_TOOL_CHAR_BUDGET` env var

## Bugs connus actifs

| Bug | Description | Statut |
|-----|-------------|--------|
| Path-scoped rules (#16299) | Chargees au demarrage quand meme | Design intended |
| context: fork (#17283) | Ignore ~95% du temps | Open |
| Skills imbriques (#17351) | Skill A appelle skill B → casse | Open |
| Sub-agent + MCP background | MCP inaccessibles en background | Limitation connue |
| Permissions deny Read (#6631) | Non-fonctionnel dans certains cas | Open |
| Activation skills | 20% baseline, 84% avec forced eval hook | Design limitation |

## Compliance instructions

### Degradation avec longueur de conversation

| Messages | Compliance aux instructions |
|----------|---------------------------|
| 1-5 | ~95% |
| 6-10 | 20-60% |
| >10 | Degradation significative |

**Solutions** :
- `/clear` entre taches majeures
- Instructions critiques dans CLAUDE.md/rules (toujours recharges)
- Sessions courtes et focalisees

### Instruction overload

- ~150-200 instructions max fiables pour LLMs frontier
- System prompt Claude Code : ~50 instructions deja utilisees
- Budget restant : ~100-150 pour CLAUDE.md + rules
- Chaque instruction ajoutee degrade uniformement TOUTES les autres

**Solutions** :
- Compter les instructions (1 bullet point ≈ 1 instruction)
- Migrer les instructions contextuelles vers `.claude/rules/`
- Auditer mensuellement : "Cette instruction est-elle vraiment universelle ?"

## Skills dans subagents

### Skills precharges ne trouvent pas les outils

Si un subagent avec `skills:` precharges ne peut pas utiliser certains outils :
- Verifier que les outils sont dans `allowed-tools` du skill OU dans les tools du subagent
- Les MCP ne sont PAS accessibles en background (`run_in_background: true`)

### context: fork ne fonctionne pas

- Comportement attendu : skill s'execute dans subagent isole
- Comportement reel : skill s'execute inline ~95% du temps (Issue #17283)
- **Workaround** : utiliser `.claude/agents/` avec `skills:` precharges
