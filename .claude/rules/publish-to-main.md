# publish vers main (vibedev-template)

## regle absolue

> **JAMAIS supprimer de fichiers avec `rm -rf` lors d'un publish vers main**

seule exception : `git rm -rf _template-dev/`

## workflow obligatoire

1. **tout commiter sur develop AVANT** de faire quoi que ce soit
2. utiliser le script `_template-dev/scripts/publish-to-main.sh`
3. OU faire manuellement avec `git rm` (jamais `rm`)

## ce qui va sur main

**TOUT** le repo va sur main **SAUF** `_template-dev/`

- commandes, rules, agents → main
- docs, features → main
- fichiers ajoutes par l'utilisateur → main
- **seul `_template-dev/` est exclu**

## commandes interdites lors d'un publish

```bash
# INTERDIT - supprime les fichiers non trackes aussi
rm -rf _template-dev/
git add -A

# CORRECT - ne touche que les fichiers trackes
git rm -rf _template-dev/
```

## si fichiers non trackes

si `git status` montre des fichiers non trackes :
1. **demander a l'utilisateur** s'il veut les commiter
2. **ne jamais les supprimer**
3. **stash si necessaire** : `git stash -u`
