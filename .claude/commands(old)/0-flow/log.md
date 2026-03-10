---
description: Quick log of a small change - minimal overhead
argument-hint: [description]
---

# Log

Ajoute une ligne au log du jour. Pour les petites modifs qui ne necessitent pas un /doc complet.

## Etape 1: Identifier le changement

Si `$1` est fourni, utilise cette description.
Sinon, demande :
> Qu'est-ce que tu viens de faire ?

## Etape 2: Identifier les fichiers

Regarde les fichiers recemment modifies (git status ou contexte de la conversation).

## Etape 3: Ajouter au log

Ajoute une ligne dans `docs/logs/YYYY-MM-DD.md` (cree le fichier si necessaire) :

```
HH:MM [type] [description] | [fichier(s)]
```

**Types** : fix, feat, refactor, style, chore, docs

**Exemples** :
```
14:32 fix auth redirect | auth.ts
14:45 feat add loading state | button.tsx, form.tsx
15:02 refactor extract helper | lib/utils.ts
```

## Etape 4: Confirmer

Affiche juste :
```
logged: [la ligne ajoutee]
```

## Regles

- UNE ligne par log, pas plus
- Format compact : `HH:MM [type] [description] | [fichiers]`
- Pas de bullet points, pas de markdown fancy
- Si plusieurs fichiers, separer par virgule
