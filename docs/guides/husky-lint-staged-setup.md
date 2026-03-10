# Setup Husky + lint-staged

Guide pour configurer le pre-commit hook dans ton projet.

## Pourquoi

- **Bloque les commits** si ESLint/Prettier échoue
- **Scan des secrets** avec gitleaks avant chaque commit
- **Rapide** : ne lint que les fichiers modifiés (lint-staged)

## Installation

### 1. Installer les dépendances

```bash
pnpm add -D husky lint-staged
```

### 2. Initialiser Husky

```bash
pnpm exec husky init
```

Cela crée le dossier `.husky/` avec un hook `pre-commit` basique.

### 3. Remplacer le pre-commit

Copie le contenu de `.husky/pre-commit` du template vibedev dans ton projet.

### 4. Ajouter la config lint-staged

Dans ton `package.json`, ajoute :

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --no-warn-ignored",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

### 5. Vérifier que les scripts existent

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:ci": "next lint --max-warnings 0",
    "format": "prettier --write .",
    "ts": "tsc --noEmit"
  }
}
```

## Test

```bash
# Modifier un fichier .ts
echo "const x = 1" >> src/test.ts

# Commit
git add src/test.ts
git commit -m "test"

# Le pre-commit doit :
# 1. Lancer ESLint + Prettier
# 2. Scanner les secrets avec gitleaks
# 3. Bloquer si erreur
```

## Gitleaks (optionnel mais recommandé)

Installe gitleaks pour scanner les secrets :

```bash
brew install gitleaks
```

Si tu n'as pas gitleaks, le hook continue sans le scan (warning affiché).

## Désactiver temporairement

```bash
git commit --no-verify -m "skip hooks"
```

⚠️ Non recommandé, à utiliser uniquement en cas d'urgence.

## Troubleshooting

### "lint-staged: command not found"

```bash
pnpm install
```

### "permission denied: .husky/pre-commit"

```bash
chmod +x .husky/pre-commit
```

### ESLint trouve des erreurs non-fixables

Corrige-les manuellement. Le commit sera bloqué jusqu'à ce que le code soit clean.
