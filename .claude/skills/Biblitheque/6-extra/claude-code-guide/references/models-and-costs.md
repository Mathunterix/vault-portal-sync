# Modeles, Couts et Limites

> Derniere mise a jour : 4 fevrier 2026
> Sources : docs officielles, deep searches, experience directe

## Modeles disponibles

| Modele | ID | Context | Usage | Cout input | Cout output |
|--------|-----|---------|-------|------------|-------------|
| **Opus 4.5** | `claude-opus-4-5-20251101` | 200K | Raisonnement complexe, architecture | ~$15/M | ~$75/M |
| **Sonnet 4.5** | `claude-sonnet-4-5-20250929` | 200K | Balance perf/cout, dev quotidien | ~$3/M | ~$15/M |
| **Haiku 4** | `claude-3-5-haiku-20241022` | 200K | Taches rapides, lecture fichiers | ~$0.25/M | ~$1.25/M |

**Note** : >50% des appels LLM de Claude Code utilisent Haiku pour lecture fichiers, analyse web, git → economies 70-80%.

## Context window

- **Tous les modeles** : 200K tokens input
- **Output max** : 8192 tokens (configurable)
- **Auto-compact** : se declenche a ~75% de capacite (depuis sept 2025)
- **Marge de raisonnement** : 25% du contexte garde libre = "memoire de travail"

## Cout du contexte Claude Code

| Composant | Tokens approximatifs |
|-----------|---------------------|
| System prompt | ~2,800 |
| Descriptions outils | ~9,400 |
| CLAUDE.md + rules | ~1,000-2,000 |
| Chaque MCP serveur | ~8,000+ |
| Skill (metadata seule) | ~100 |
| Skill (active) | ~2,000-5,000 |
| **Budget utilisable** | ~150,000-175,000 |

## Rate limits par tier

### Claude Code (subscription)

| Plan | Prix/mois | Modeles | Limites |
|------|-----------|---------|---------|
| **Pro** | $20 | Sonnet, Haiku | Standard |
| **Max 5x** | $100 | + Opus | 5x Pro limits |
| **Max 20x** | $200 | + Opus | 20x Pro limits |
| **Team** | $30/user | Sonnet, Haiku | Standard |
| **Enterprise** | Custom | Tous | Custom |

### API (pay-as-you-go)

| Tier | Requests/min | Tokens/min |
|------|-------------|------------|
| Free | 5 | 20,000 |
| Build | 50 | 100,000 |
| Scale | Custom | Custom |

### Controverses janvier 2026

- **-60% tokens Opus** depuis 8 janvier 2026 (analyses communautaires)
- Passage de "growth mode" a "governed usage"
- Impact sur workflows longs (debugging, refactors)
- **Ref** : GitHub Issue #17084, The Register

## Quand utiliser quel modele

| Situation | Modele | Pourquoi |
|-----------|--------|----------|
| Questions simples, routing | Haiku | Rapide, pas cher |
| Dev quotidien, features | Sonnet | Balance cout/qualite |
| Architecture, decisions complexes | Opus | Raisonnement superieur |
| Lecture fichiers, analyse git | Haiku | Volume eleve, cout minimal |
| Code review, refactoring | Sonnet | Suffisant pour patterns |
| Debugging complexe | Opus | Meilleur raisonnement |

## Optimisation des couts

### 1. Prompt caching

```python
response = await client.messages.create(
    system=[{
        "type": "text",
        "text": long_system_prompt,
        "cache_control": {"type": "ephemeral"}
    }],
    messages=[...]
)
```

Reduit cout des tokens systeme repetes.

### 2. Token counting pre-vol

```python
count = client.messages.count_tokens(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "Hello"}]
)
# Estimer le cout AVANT l'appel
```

### 3. Conversation summarization

Au-dela de 10 messages :
- Resumer l'historique ancien avec Haiku
- Garder les 5 derniers messages intacts
- Economie significative sur conversations longues

### 4. /clear entre taches

- Reset du contexte = 0 tokens historique
- Plus agressif que /compact mais plus fiable
- **Best practice** : /clear entre chaque tache majeure

### 5. Progressive disclosure

```
100 skills x 100 tokens = 10K tokens (metadata)
vs
5 skills charges complets = 25K tokens

Economie : 70%+ sur contexte initial
```

## Monitoring

### Voir la consommation

```bash
/cost     # Cout de la session
/context  # Repartition tokens
```

### Budgeting quotidien

Pour bot Telegram ou automation :
- Tracker `response.usage.input_tokens` + `output_tokens`
- Definir budget quotidien max
- Alert si depasse
