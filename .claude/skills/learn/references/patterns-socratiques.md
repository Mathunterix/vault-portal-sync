# Patterns Pédagogiques

Patterns issus de la recherche sur les assistants IA pédagogiques.

## Principes fondamentaux

### 1. Zone de Developpement Proximal (Vygotsky)

La plage de taches qu'un apprenant ne peut pas encore faire seul mais peut reussir avec de l'aide.

**Application** : Toujours rester dans cette zone - ni trop facile (ennui), ni trop difficile (frustration).

### 2. Scaffolding (Echafaudage)

Support temporaire qui diminue progressivement.

```
Debutant          Intermediaire        Avance
─────────────────────────────────────────────►
[Heavy support]   [Medium support]    [Light support]
- Etapes detaillees - Hints          - Questions seules
- Exemples commentes - Pseudo-code   - Trade-offs
- Templates        - Pistes          - "Explique-moi"
```

### 3. Methode Socratique

**Principe** : Ne jamais donner de reponses immediates. Aider a generer ses propres reponses par des questions.

**Structure en 5 etapes** :

1. **Questionner la norme** : "Pourquoi tu penses que ca marche comme ca?"
2. **Creuser** : "Qu'est-ce qui te fait dire ca?"
3. **Explorer les alternatives** : "Et si on faisait autrement?"
4. **Reflechir** : "Qu'est-ce que tu as appris sur ta facon de penser?"
5. **Appliquer** : "Comment tu utiliserais ca ailleurs?"

### 4. Technique de Feynman

Si on peut expliquer quelque chose dans nos propres mots, ca prouve qu'on a compris.

**Application** : Toujours demander de reformuler/expliquer apres une explication.

## Patterns de questions

### Avant de repondre

```
"Avant que je t'explique, dis-moi..."
"Qu'est-ce que tu as deja essaye?"
"Qu'est-ce que tu penses qu'il se passe?"
```

### Pour guider

```
"Et si tu regardais ce qui se passe ici?"
"Qu'est-ce qui se passe si tu console.log cette variable?"
"As-tu verifie les inputs?"
```

### Pour verifier (NE PAS demander "tu comprends?")

```
"Tu peux me reformuler ce que je viens d'expliquer?"
"Donne-moi un exemple de quand tu utiliserais ca."
"Comment c'est different de [autre concept]?"
```

### Pour encourager

```
"Bonne question!"
"Tu progresses bien!"
"C'est exactement ca!"
```

## Pattern HypoCompass (Learning by Teaching)

Parfois, inverser les roles. L'utilisateur "enseigne" a l'IA.

**Exemple** :
```
"Imagine que je suis un debutant qui ne comprend pas pourquoi ce code
ne marche pas. Explique-moi ce que tu penses qu'il se passe."
```

**Avantage** : Force a articuler sa pensee, revele les incomprehensions.

## Pattern Rubber Duck Debugging

L'utilisateur explique son code ligne par ligne. L'IA pose des questions.

**Questions a poser** :
- "Qu'est-ce que tu t'attendais a voir ici?"
- "Peux-tu me detailler ce que fait cette ligne?"
- "Quelles hypotheses tu fais sur cette valeur?"

**Regle** : Ne jamais resoudre le probleme. Aider a articuler.

## Anti-patterns a eviter

### ❌ Donner la reponse trop vite

```
User: "Comment centrer un div?"
❌ "Utilise flexbox: display: flex; justify-content: center;"
✅ "Bonne question! Tu veux centrer horizontalement, verticalement, ou les deux?"
```

### ❌ Demander "tu comprends?"

```
❌ "Tu comprends?" (reponse automatique: "oui")
✅ "Tu peux me donner un exemple de quand tu utiliserais ca?"
```

### ❌ Jargon sans explication

```
❌ "C'est un probleme d'hydration mismatch"
✅ "Le serveur et le navigateur ont genere un HTML different.
   C'est ce qu'on appelle 'hydration mismatch'. Voyons pourquoi..."
```

### ❌ Supposer le niveau

```
❌ Commencer directement avec des concepts avances
✅ "Qu'est-ce que tu sais deja sur les hooks React?"
```

## Metrics de succes

Un apprentissage reussi quand l'utilisateur peut :

1. **Reformuler** le concept dans ses propres mots
2. **Donner un exemple** different de celui montre
3. **Expliquer POURQUOI** ca marche, pas juste COMMENT
4. **Identifier** quand utiliser ce pattern vs un autre
5. **Debugger** un probleme similaire seul
