# Strategie de tests avec IA

Condense depuis tests-validation-ia-vibecoding.md (743 lignes).

## TDD avec IA : pourquoi ca marche

Le TDD donne a l'IA des **cibles claires** au lieu de la laisser improviser :
- Tests = spec executable → l'IA sait exactement quoi implementer
- Feedback automatise → boucle rapide fail/pass
- Prevention de la speculation → le code doit passer les tests, pas "avoir l'air correct"

## Cycle TDD officiel Anthropic (7 etapes)

```
1. Ecrire les tests (fail attendu)
2. Verifier qu'ils echouent (red)
3. Implementer le minimum pour passer (green)
4. Refactorer si besoin
5. Valider que tout passe encore
6. Commit
7. Repeter
```

**Regle** : toujours ecrire les tests AVANT l'implementation. Le code-first avec l'IA produit des tests superficiels qui ne detectent rien.

## 6 couches de qualite production

| Couche | Quoi | Outils |
|--------|------|--------|
| Tests unitaires | Fonctions isolees | Jest, Vitest |
| Tests integration | Interactions entre modules | Testing Library |
| Tests E2E | Parcours utilisateur complets | Playwright, Cypress |
| Analyse statique | Types, patterns, smells | TypeScript strict, ESLint |
| Security | Vulnerabilites, secrets | npm audit, CodeQL |
| Performance | Metriques, regressions | Lighthouse, k6 |

## Objectifs de couverture realistes

- **Cible** : 80% de couverture avec TDD
- **Chemin critique** : 100% (auth, paiement, donnees sensibles)
- **UI** : tests d'integration > tests unitaires de composants
- **Utilitaires** : tests unitaires exhaustifs (edge cases)

## Strategies de generation de tests

### Tests depuis les requirements

```
Requirement : "L'utilisateur peut se connecter avec email/mot de passe"
→ Tests :
  - email valide + bon mdp → connecte
  - email invalide → erreur
  - bon email + mauvais mdp → erreur
  - email vide → validation
  - rate limiting apres 5 tentatives
```

### Property-based testing

Au lieu de tester des valeurs specifiques, tester des proprietes :
- `sort(array).length === array.length` (conservation)
- `parse(stringify(x)) === x` (round-trip)
- `f(a + b) === f(a) + f(b)` (linearite)

### Mutation testing

Modifier le code source et verifier que les tests detectent le changement.
Si un mutant survit → le test ne couvre pas ce cas.

## Pieges a eviter

| Piege | Pourquoi c'est mauvais | Solution |
|-------|------------------------|----------|
| Code d'abord, tests apres | Tests superficiels qui testent l'implementation | TDD : tests d'abord |
| Couverture elevee = confiance | 100% coverage avec des tests triviaux = inutile | Mutation testing |
| Tests trop couples | Cassent a chaque refactoring | Tester le comportement, pas l'implementation |
| Pas de tests edge cases | Les bugs sont aux limites | Arrays vides, null, max values |
| Mock everything | Tests passent mais rien ne marche en vrai | Tests integration pour les interactions |

## Quand tester pendant l'implementation

- **Avant chaque tache** : verifier si des tests existants couvrent la zone
- **Pendant** : TDD pour la logique metier, integration pour les interactions
- **Apres** : run complet de la suite, verifier les regressions
- **Avant commit** : tous les tests passent, couverture stable

## Config recommandee dans CLAUDE.md

```markdown
## Tests
- TDD : ecrire les tests AVANT l'implementation
- `pnpm test` avant chaque commit
- Coverage minimum : 80% (check avec `pnpm test:coverage`)
- Tests E2E : `pnpm test:e2e` (avant merge)
```
