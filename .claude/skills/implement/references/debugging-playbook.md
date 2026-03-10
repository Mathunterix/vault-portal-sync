# Playbook de debugging IA

Condense depuis 3 deep searches (~1500 lignes) sur le debugging avec IA et les strategies de deblocage.

## Pourquoi l'IA tourne en rond

### Degradation exponentielle

- 1ere tentative : ameliore le code
- 5eme tentative : **80% de perte d'efficacite** (Debugging Decay Index, Oxford/McGill 2024)
- Messages 1-5 : ~95% compliance
- Messages 6-10 : 20-60% compliance

### 3 causes racines

1. **Perte de contexte silencieuse** : le contexte se dilue au fil des messages
2. **Pattern locking** : l'IA repete les memes patterns meme quand ils ne marchent pas
3. **Derive semantique** : perte progressive de l'intention originale

### Formule de pollution du contexte

- < 0.10 : aligne, tout va bien
- 0.25-0.45 : derive notable, reponses hors sujet possibles
- > 0.45 : risque eleve, re-ancrage obligatoire

## Quand s'arreter et changer de strategie

**Regle des 2 tentatives** : si l'IA n'a pas resolu le bug en 2 rounds, changer d'approche. Ne PAS insister.

### Signaux d'alerte

- L'IA propose la meme solution reformulee
- Le code "marche presque" mais un detail change a chaque fois
- Les modifications deviennent de plus en plus grosses
- L'IA commence a casser des choses qui marchaient

## Strategies de deblocage (par ordre d'escalade)

### Niveau 1 : Recentrer (30 secondes)

- Reformuler le probleme avec WHY/WHAT au lieu de HOW
- Donner le contexte fichier explicite (@file references)
- Inclure l'erreur exacte + le code qui la genere

### Niveau 2 : Reset le contexte (1 minute)

- `/clear` pour un contexte propre
- Resumé de l'etat + nouvelle session
- Decomposer en sous-problemes (chain of thought)

### Niveau 3 : Changer d'angle (2 minutes)

- Role hack : "tu es un expert en [domaine specifique du bug]"
- Montrer du code qui marche comme pattern de reference
- Iteration pas a pas au lieu de regeneration complete

### Niveau 4 : Isoler (5 minutes)

- Subagent avec contexte isole pour la partie bloquante
- Tester le comportement minimal (REPL, test unitaire isole)
- Commiter ce qui marche, travailler sur le reste dans une session propre

## 8 patterns d'echec du code IA

| Pattern | Description | Detection |
|---------|-------------|-----------|
| APIs hallucinees | Appel a des fonctions/methodes qui n'existent pas | TypeError, undefined |
| Vulnerabilites security | Injection, XSS, mauvaise auth | Review security |
| Anti-patterns performance | N+1 queries, boucles inutiles | Profiling |
| Error handling absent | try/catch manquants, erreurs silencieuses | Tests edge cases |
| Edge cases ignores | Arrays vides, null, boundaries | Tests limites |
| Libs obsoletes | Versions deprecees, APIs changees | npm audit |
| Modele de donnees decale | Schema presume different du reel | Comparaison DB |
| Contexte manquant | Code qui assume des deps non presentes | Import errors |

## Checklist avant de demander un debug a l'IA

1. [ ] J'ai l'erreur exacte (stack trace ou comportement)
2. [ ] J'ai le code concerne (pas tout le fichier, juste la partie)
3. [ ] J'ai le comportement attendu vs observe
4. [ ] J'ai verifie que le probleme est reproductible
5. [ ] Je n'ai pas deja essaye 2+ fois sans succes (→ changer de strategie)
