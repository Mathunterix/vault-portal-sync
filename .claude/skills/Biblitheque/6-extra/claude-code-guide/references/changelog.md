# Changelog des mises a jour

> Historique des mises a jour des references du skill claude-code-guide.
> Chaque entree = une decouverte ou mise a jour, tracee avec date et source.

## 2026-02-06 : Agent Teams (experimental)

**Source** : https://code.claude.com/docs/en/agent-teams
**References modifiees** : `architecture.md`, `known-limitations.md`

**`architecture.md`** :
- Nouvelle section "Agent Teams (experimental)" apres Subagents
- Architecture complete (team lead, teammates, task list, mailbox)
- Tableau comparatif Subagents vs Agent Teams
- Modes d'affichage (in-process, split-panes)
- Cas d'usage (research, debug, cross-layer)
- Delegate mode et plan approval

**`known-limitations.md`** :
- Nouvelle section Agent Teams avec 8 limitations documentees
- Workarounds pour resume et task stuck

**Note** : Feature experimentale, necessite `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

---

## 2026-02-04 : Enrichissement v3 - Couverture complete

**Source** : doc officielle Claude Code (skills-comprehensive-guide), claude-md-best-practices.md, claude-code-architecture-deep-dive.md, experience directe

**`skills-and-rules.md`** (185 → 429 lignes) :
- Ajout frontmatter complet (10 champs documentes : name, description, argument-hint, disable-model-invocation, user-invocable, allowed-tools, model, context, agent, hooks)
- Ajout arguments et substitution de variables ($ARGUMENTS, $N, ${CLAUDE_SESSION_ID})
- Ajout types de contenu (Reference vs Task)
- Ajout extended thinking (ultrathink)
- Ajout controle d'invocation (tableau 3 modes)
- Ajout fusion commands → skills (priorite, compatibilite)
- Ajout discovery automatique monorepos (sous-dossiers)
- Ajout emplacements et portee (4 niveaux : Enterprise > Personnel > Projet > Plugin)
- Ajout restrictions d'acces (3 methodes : deny all, allow/deny par skill, disable individuel)
- Ajout injection contexte dynamique (!`command`)
- Ajout CLAUDE.md best practices (framework WHAT-WHY-HOW, contenu essentiel, 6 anti-patterns, emphasis keywords, imports @, CLAUDE.local.md, file references, living document)
- Ajout patterns glob supportes pour rules
- Ajout pattern hybride Skills + MCP avec tableau comparatif

**`architecture.md`** (177 → 279 lignes) :
- Ajout enterprise config paths par OS (macOS, Linux, Windows)
- Ajout lookup recursif details (sous-dossiers, monorepos)
- Ajout imports @ dans CLAUDE.md (regles, limites)
- Ajout CLAUDE.local.md (.gitignore auto)
- Ajout stack technique 4 couches
- Ajout fusion commands → skills
- Ajout Skills vs MCP tableau comparatif
- Ajout deux types de hooks (command vs prompt)
- Ajout agents custom exemple avec skills: precharges
- Ajout architecture max-1-branch details
- Ajout /clear vs /compact comparaison
- Ajout contexte comme ressource finie (attention budget)
- Ajout handoff pattern

**`cli-and-workflows.md`** (209 → 258 lignes) :
- Ajout commandes manquantes : /memory, /permissions, /status, /mcp, /vim, /doctor, /config
- Reorganisation en 3 categories (session/contexte, config/diagnostic, modes)
- Ajout statusline feature
- Ajout mode acceptEdits, YOLO, MCP debug
- Ajout piege Ctrl+C (quitte au lieu de stopper)
- Ajout /clear entre taches (best practice)
- Ajout quick update avec # (detail)

**`hooks-and-settings.md`** (+20 lignes) :
- Ajout deux types de hooks (command vs prompt) avec tableau
- Ajout run_in_background dans format JSON
- Ajout updatedInput cas d'usage detailles
- Ajout CLAUDE_ENV_FILE explication

**`known-limitations.md`** (+20 lignes) :
- Ajout instruction overload (budget ~100-150)
- Ajout commands → skills merge (priorite)
- Ajout hooks non-disponibles en SDK Python

**`troubleshooting.md`** (+25 lignes) :
- Ajout instruction overload diagnostic et solutions
- Ajout skills dans subagents troubleshooting
- Ajout context: fork workaround

**Enrichissement supplementaire** (Context7 + deep-search) :

**`hooks-and-settings.md`** :
- 3 types de hooks (pas 2) : command, prompt, **agent** (avec outils Read/Grep/Glob, max 50 turns)
- Async hooks (`"async": true` pour background execution)
- SessionStart matchers detailles : `startup`, `resume`, `clear`, `compact`
- Exit code 2 comportement par event (tableau complet)
- Settings.json schema complet (sandbox, attribution, env, alwaysThinkingEnabled, cleanupPeriodDays)
- MCP Tool Search (janvier 2026) : chargement dynamique 51K→8.5K tokens

**`architecture.md`** :
- Custom agents frontmatter complet (disallowedTools, permissionMode, hooks)
- Portee des agents custom (4 niveaux avec priorites)
- Limitations subagents (pas de spawn recursif, background restrictions)

**`agent-sdk.md`** :
- ClaudeAgentOptions complet (denied_tools, permission_mode, max_turns, max_tokens, agents, plugins)

**`known-limitations.md`** :
- Inconsistances quotas fevrier 2026 (Issue #22435)
- Regression qualite janvier 2026 (Issue #21431)

**`ecosystem.md`** :
- Plugin system officiel + community marketplaces

**Volume** : 10 fichiers / 1609 lignes → 10 fichiers / ~2350 lignes (+46%)

---

## 2026-02-03 : Enrichissement massif (v2)

**Source** : Consolidation de ~500KB de sources (5 deep searches Claude Code, 5 articles doc-externe, docs officielles, experience directe)
**Fichiers crees** :
- `hooks-and-settings.md` : guide complet hooks (12 events, matchers, payloads, exit codes, env vars) + settings.json + permissions
- `agent-sdk.md` : Claude Agent SDK (installation, API query/client, custom tools MCP, hooks programmatiques, sessions, auth)
- `models-and-costs.md` : modeles (IDs, pricing), context windows, rate limits par tier, optimisation tokens
- `cli-and-workflows.md` : commandes slash, raccourcis clavier, headless mode, worktrees, feedback loops, tips power user
- `troubleshooting.md` : /compact (bugs, workarounds), debug MCP/skills, images, installation, performance, compliance degradation
- `ecosystem.md` : marketplaces (aitmpl, SkillsMP), cross-platform, outils tiers, documentation officielle + interne

**Fichiers enrichis** :
- `architecture.md` : +prompt structure & tokens, context management (compaction, compliance, memory tool), philosophie de design
- `skills-and-rules.md` : +arbre de decision (skills vs commands vs MCP vs agents), patterns avances (atomic/orchestrator, chaining, context:fork, injection dynamique)
- `known-limitations.md` : +/compact (5 bugs documentes), rate limits controverses jan 2026, skills metadata budget, images bugs, permissions deny bug

**SKILL.md** : description enrichie, 10 references organisees en 3 categories, sources internes referencies

**Volume** : 4 fichiers (~280 lignes) → 10 fichiers (~1200 lignes) de references actionnables

---

## 2026-02-03 : Creation initiale

**Source** : Consolidation de 5 deep searches + doc-externe/doc-claude-code/ + experience directe
**Fichiers crees** :
- `architecture.md` : hierarchie memoire, skills, rules, MCP, hooks, subagents, context engineering
- `skills-and-rules.md` : guide ecriture skills/rules/CLAUDE.md, progressive disclosure, activation
- `known-limitations.md` : sub-agents+MCP background, context:fork bugged, path-scoped rules, activation 20%, context degradation
- `changelog.md` : ce fichier

**Trouvailles cles** :
- Sub-agents background ne supportent pas les MCP (pas de fix annonce)
- `context: fork` ignore ~95% du temps (Issue #17283)
- Skills imbriques cassent le workflow (Issue #17351)
- Path-scoped rules chargees au demarrage quand meme (Issue #16299)
- Activation skills : 20% baseline, 84% avec forced eval hook

---

*Format pour les futures entrees :*

```
## YYYY-MM-DD : [titre court]

**Source** : [url ou description]
**Reference modifiee** : [fichier]
**Changement** : [description de ce qui a ete ajoute/modifie]
```
