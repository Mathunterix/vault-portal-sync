# préférer ORM aux stored procedures

la logique métier doit rester dans le code applicatif, pas dans la base de données.

## pourquoi

mettre la logique en SQL (RPC, stored procedures, triggers) crée des problèmes :
- **opacité** : l'IA et les devs ne voient pas ce que font les fonctions
- **tests difficiles** : besoin d'une vraie DB pour tester
- **expertise SQL** : modifications requièrent des compétences spécifiques
- **code review** : diffs SQL plus difficiles à relire que TypeScript
- **portabilité** : vendor lock-in sur le SGBD

## la règle

**logique métier = code applicatif (TypeScript/Python/etc.), pas SQL**

| garder en SQL | mettre dans le code |
|---------------|---------------------|
| PostGIS / geo queries | CRUD (create, read, update, delete) |
| agrégations lourdes (100k+ rows) | validation métier |
| triggers d'audit simples | calculs et transformations |
| cron jobs natifs (pg_cron) | logique conditionnelle |
| indexes et contraintes | orchestration multi-tables |

## ORM recommandé (TypeScript)

**Prisma** : schema-first, excellente DX, types auto-générés, migrations intégrées.

## supabase RPC

les appels `supabase.rpc('function_name')` sont concernés par cette règle. préférer Prisma pour le CRUD et la logique métier.

## exemple

```typescript
// ❌ MAUVAIS - logique métier en SQL (stored procedure Supabase)
CREATE FUNCTION update_user_name(p_user_id uuid, p_name text)
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE last_change > NOW() - INTERVAL '30 days') THEN
    RAISE EXCEPTION 'Cooldown active';
  END IF;
  UPDATE users SET name = p_name WHERE id = p_user_id;
END; $$;

// ❌ MAUVAIS - appel RPC opaque
await supabase.rpc('update_user_name', { p_user_id: userId, p_name: name })

// ✅ BON - logique métier en TypeScript avec Prisma
async function updateUserName(userId: string, name: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

  if (user.lastChange && differenceInDays(new Date(), user.lastChange) < 30) {
    throw new Error('Cooldown active')
  }

  await prisma.user.update({ where: { id: userId }, data: { name } })
}
```

## exceptions : quand le SQL est justifié

1. **performance prouvée** : benchmark montre >2x plus rapide en SQL
2. **PostGIS** : calculs géographiques complexes (ST_DWithin, etc.)
3. **atomicité critique** : transaction où le rollback partiel serait catastrophique
4. **cron natif** : pg_cron pour tâches planifiées DB-level

## si tu crées une stored procedure

1. **wrapper typé** : créer une fonction TypeScript avec types explicites
2. **documenter** : JSDoc expliquant pourquoi c'est en SQL
3. **lien migration** : référencer le fichier SQL dans les commentaires

```typescript
/**
 * Recherche par proximité géographique
 *
 * **Pourquoi en SQL** : PostGIS ST_DWithin optimisé avec index GIST
 * **Migration** : prisma/migrations/20240315_find_nearby/migration.sql
 */
export async function findNearbyItems(lat: number, lng: number, radiusKm: number) {
  return prisma.$queryRaw`SELECT * FROM find_nearby(${lat}, ${lng}, ${radiusKm})`
}
```
