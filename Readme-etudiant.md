1) Installer la BMAD : 
```
npx bmad-method install
```

Pour tout installer automatiquement sans le côté interactif :

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

si `_bmad/` existe deja, utilise `--action update` au lieu de `--action install` pour mettre a jour vers la derniere version.
