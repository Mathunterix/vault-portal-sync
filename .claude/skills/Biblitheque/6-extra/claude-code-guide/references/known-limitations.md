# Limitations connues de Claude Code

> Derniere mise a jour : 4 fevrier 2026
> Maintenu par le skill claude-code-guide (mode refresh)

## Sub-agents

### Sub-agents + MCP custom

| Scenario | Fonctionne ? | Details |
|----------|-------------|---------|
| Sub-agent + skills | Oui | Champ `skills:` dans le frontmatter de l'agent. Contenu complet precharge. |
| Sub-agent + MCP (foreground) | Oui | MCP project-scoped accessibles en foreground. |
| Sub-agent + MCP (background) | **Non** | `run_in_background: true` ne supporte pas les MCP. Limitation Claude Code, pas de fix annonce. |

### context: fork dans les skills

`context: fork` (skill dans un sub-agent isole) est documente mais **bugged** :
- **Issue #17283** : le Skill tool ignore `context: fork` ~95% du temps, le skill s'execute inline
- **Issue #17351** : les skills imbriques (skill A appelle skill B) cassent le workflow

**Workaround** : utiliser des sub-agents custom (`.claude/agents/`) pour l'isolation.

## Path-scoped rules

Les rules avec frontmatter `paths:` sont **quand meme chargees au demarrage**. Le path-scoping affecte la pertinence semantique, pas le chargement initial.

**Impact** : toutes les rules coutent du contexte, meme path-scoped. Garder les rules concises.

**Ref** : Issue #16299

## Activation automatique des skills

Le matching semantique description/prompt est **non-deterministe** :
- 20% de succes baseline
- 84% avec forced eval hook

**Impact** : les skills critiques doivent avoir `disable-model-invocation: true`.

## Context window

### Degradation avec la longueur

- Messages 1-5 : ~95% compliance aux instructions
- Messages 6-10 : 20-60% compliance
- Au-dela : degradation significative

**Impact** : utiliser `/clear` entre les taches majeures. Preferer des sessions courtes et focalisees.

### Compact automatique

Claude Code compacte automatiquement le contexte quand il atteint ~80% de la fenetre. Certaines informations peuvent etre perdues lors du compactage.

**Impact** : les instructions critiques doivent etre dans CLAUDE.md ou rules (toujours recharges), pas dans la conversation.

## Hooks

### Limitations actuelles

- Les hooks ne peuvent pas modifier le comportement de Claude, seulement executer des commandes
- Pas de hook "avant chaque session" (seulement PreToolUse, PostToolUse, Notification)
- Les hooks qui echouent ne bloquent pas l'execution par defaut

## MCP

### Cout en tokens

Chaque serveur MCP ajoute ~8k+ tokens au contexte (descriptions d'outils). Avec 5+ MCPs, ca devient significatif.

**Impact** : minimiser les MCPs actifs. Desactiver ceux non utilises.

### Timeouts

Les MCP servers peuvent timeout silencieusement. Si un outil MCP ne repond plus, relancer la session.

## Instruction overload

### Degradation uniforme avec le nombre d'instructions

- LLMs frontiers suivent ~150-200 instructions de maniere fiable
- System prompt Claude Code utilise deja ~50 instructions
- **Budget restant** : ~100-150 instructions pour CLAUDE.md + rules
- Chaque instruction ajoutee **degrade uniformement** toutes les autres

**Impact** : auditer regulierement le nombre d'instructions. Compter les bullet points.

## CLAUDE.md

### Imports @ recursifs

- Max 5 niveaux de recursion
- Les `@` ne sont PAS evalues dans les code blocks (seulement texte markdown)
- Les fichiers pointes doivent exister sinon erreur silencieuse
- Chemins relatifs et absolus supportes

## /compact

### Pertes de contexte documentees

| Issue | Probleme | Impact |
|-------|----------|--------|
| #13919 | Perte contexte Skills post-compaction | Taches 5-6x plus longues |
| #6004 | Boucle infinie : lit fichiers → compact → perd etat → relit | Quota consomme |
| #2391 | Compact conversation infinite loop | Blocage |
| #7530 | Erreur pendant compaction | Session corrompue |

**Ce qui est perdu en priorite** : procedures complexes (Skills), etat de taches en cours, decisions techniques anterieures.

**Facteurs aggravants** : sessions > 2h, compactions multiples successives, taches avec beaucoup d'etat.

**Amelioration sept 2025** : seuil passe de ~95% a ~75% → garde 50K tokens de marge.

## Rate limits et quotas

### Controverses janvier 2026

- -60% de tokens Opus depuis le 8 janvier 2026
- Limites les plus restrictives depuis le lancement d'Opus 4.5
- Impact : workflows longs (debugging, refactors multi-fichiers)
- **Ref** : Issue #17084, The Register

### Inconsistances quotas (fevrier 2026)

- Taux de consommation inconstants : 5.6%/h a 59.9%/h dans la meme session
- `/context` affiche 0% alors que usage non-zero
- Discordance entre dashboard claude.ai et Claude Code
- **Ref** : Issue #22435

### Regression qualite (janvier 2026)

- Depuis le 26 janvier 2026 : Claude "thinks much less"
- "Multiple broken attempts instead of thinking through"
- Impact sur la qualite du raisonnement
- **Ref** : Issue #21431

### Skills metadata budget

- Defaut : 15,000 caracteres pour toutes les descriptions de skills
- 100+ skills installes → certains exclus silencieusement
- **Check** : `/context` → warning about excluded skills
- **Fix** : env var `SLASH_COMMAND_TOOL_CHAR_BUDGET`

## Images

| Bug | Description |
|-----|-------------|
| #5745 | Drag & drop ne marche plus |
| #13383 | Boucle infinie avec images > 5MB |
| #17957 | Screenshots paste ne fonctionne pas (VS Code) |
| #15880 | upload_image error scope/context |

## Permissions

### deny Read/Write non-fonctionnel

Les regles `deny` pour Read/Write sont "completement non-fonctionnelles" dans certains cas (Issue #6631). Ne jamais se fier uniquement aux permissions Claude pour les fichiers sensibles → utiliser chmod.

## Commands → Skills merge

### Priorite et conflits

- Si un skill et une command partagent le meme nom, le **skill gagne**
- Les `.claude/commands/` existantes continuent de fonctionner
- Les skills sont recommandes pour les nouvelles creations

## Hooks dans subagents

### Hooks non-disponibles en SDK Python

`SessionStart`, `SessionEnd`, `Notification` ne sont PAS disponibles dans le Claude Agent SDK Python.

## Agent Teams (experimental)

> Source : https://code.claude.com/docs/en/agent-teams

### Limitations documentees

| Limitation | Impact |
|------------|--------|
| Pas de `/resume` avec in-process teammates | Les teammates disparaissent apres resume, lead peut tenter de leur parler |
| Task status peut lag | Teammates oublient de marquer complete → bloque dependances |
| Shutdown lent | Attente fin du tool call en cours |
| Un team par session | Cleanup obligatoire avant d'en creer un autre |
| Pas de nested teams | Teammates ne peuvent pas spawner d'equipes |
| Lead fixe | Pas de promotion de teammate, pas de transfert |
| Permissions au spawn | Tous heritent du lead, pas de per-teammate au spawn |
| Split panes limites | Pas supporte : VS Code terminal, Windows Terminal, Ghostty |

### Workarounds

- **Resume** : spawner de nouveaux teammates apres resume
- **Task stuck** : verifier manuellement si termine, update status ou nudge via lead

---

*Ce fichier est maintenu par le skill `/claude-code-guide refresh`. Chaque limitation est datee et sourcee dans changelog.md.*
