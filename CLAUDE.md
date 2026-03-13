# Vault Portal Sync

Plugin Obsidian pour synchroniser un vault vers Vault Portal via l'API collab.

## stack

TypeScript strict, Obsidian Plugin API, esbuild, Zod

## structure

```
src/
  main.ts           — lifecycle plugin, commandes, ribbon, status bar
                      saveSettings(restartSync) — persiste sans restart sauf demande explicite
                      runFullSync(silent) — silent=true pour sync periodique (notif si changements)
                      stopSync() — clearInterval propre + stop watcher
  settings.ts       — settings tab (connexion, audiences, rules editor, sync)
                      editedAudiences Set — empeche rehydratation parasite apres suppression rules
                      UX : sous-options masquees quand sync auto desactivee
  api.ts            — client HTTP (requestUrl, Bearer token)
  types.ts          — schemas Zod + types
  sync/
    engine.ts       — orchestrateur sync (diff, upload batch, cleanup)
    scope-resolver.ts — resolution scope (metadataCache, rules, folders)
                        ScopeBreakdown : ruleFiles / audienceFmFiles / contextFiles
                        resolveDetailed() — categorise par raison d'inclusion
                        resolveContextFiles() — fichiers user-portal/audience-portal (global, pas per-audience)
                        countInScope() — exclut les fichiers de contexte (seulement rules + audience FM)
    checksum.ts     — SHA-256 via Web Crypto
    watcher.ts      — vault events (modify/create/delete/rename) + debounce 5s
    attachments.ts  — extraction refs PJ + upload binaires
  ui/
    folder-suggest.ts — AbstractInputSuggest pour folder picker
```

## commandes

| commande | usage |
|----------|-------|
| `npm run dev` | watch mode (dev) |
| `npm run build` | type check + build prod |

## conventions

- HTTP via `requestUrl` (pas de fetch, pas de Supabase client)
- Pas de `any` — TypeScript strict
- Validation Zod sur toutes les reponses API
- Distribution BRAT (GitHub releases)
