---
paths: "**/*.{ts,tsx}"
---

# réutiliser l'existant

**AVANT de créer du nouveau code, TOUJOURS vérifier si ça existe déjà.**

## avant de créer un composant ou fonction

1. **chercher si ça existe**
   - grep dans le projet
   - vérifier les libs installées
   - regarder `components/ui/` pour shadcn

2. **utiliser les patterns établis**
   - suivre les conventions du projet
   - copier le style des fichiers similaires

3. **extraire si duplication**
   - si on copie-colle, extraire en utilitaire

## checklist

- [ ] `grep -r "Concept" src/` pour chercher l'existant
- [ ] vérifier `components/` pour composants similaires
- [ ] si logique existe ailleurs → ajouter prop/callback plutôt que dupliquer
