---
name: DB architecture (dev vs prod)
description: How the database connection is split between environments
---

## Rule
- **Dev**: `DATABASE_URL` (Replit native PostgreSQL) — always reachable, schema seeded via `runMigrations()`
- **Prod**: `SUPABASE_DATABASE_URL` first, then `DATABASE_URL` fallback

## Why
Supabase pooler (`aws-1-eu-central-1.pooler.supabase.com`) fails from Replit dev env with `(ENOTFOUND) tenant/user not found`. Replit native DB always works in dev. In production (`NODE_ENV=production`) the app uses Supabase so the external admin app and marketplace share the same data.

## How to apply
`lib/db/src/index.ts` branches on `process.env.NODE_ENV === "production"`. Never revert to always preferring SUPABASE_DATABASE_URL.

## Dev credentials (Replit native DB)
- Admin: admin@zimazao.com / Zimazao1234! (id=2, is_admin=true)
- Farmers: john.banda@farmer.zm, grace.phiri@farmer.zm, moses.tembo@farmer.zm (Farmer1234!)
- 8 sample listings seeded (ids 1-8)

## Prod (Supabase)
Pooler URL stored as secret SUPABASE_DATABASE_URL. Active only when NODE_ENV=production.
