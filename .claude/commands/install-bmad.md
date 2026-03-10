# install bmad

installe la methode bmad pre-configuree pour vibedev.

## etapes

1. lance la commande d'installation :

```bash
npx bmad-method install \
  --directory . \
  --modules bmm \
  --tools claude-code \
  --communication-language French \
  --document-output-language French \
  --output-folder docs/bmad \
  --action install \
  -y
```

note : `-y` utilise le username systeme comme nom. pour un nom custom, retirer `-y` ou ajouter `--user-name "Prenom"`.

2. verifie que l'installation a reussi :
   - `_bmad/` existe avec `_config/`, `core/`, `bmm/`
   - `.claude/commands/` contient les fichiers `bmad-*.md`

3. affiche un resume :

```
bmad installe avec succes :
- langue : francais
- output : docs/bmad/
- commandes principales : /bmad-agent-bmm-analyst, /bmad-agent-bmm-architect, /bmad-agent-bmm-pm
- workflow : analyst → architect → pm → /pick-feature
```

## si deja installe

si `_bmad/` existe deja, utilise `--action update` au lieu de `--action install` pour mettre a jour vers la derniere version.
