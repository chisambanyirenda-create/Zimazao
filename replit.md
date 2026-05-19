# Zimazao - Zambia Agricultural Marketplace

A marketplace platform for buying and selling crops, detecting plant diseases, and checking market prices across Zambia.

## Run & Operate

- `pnpm --filter @workspace/zimazao run dev` — run the frontend (via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + Tailwind CSS v4
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/zimazao/` — main frontend (React + Vite)
  - `src/pages/` — page components (home, marketplace, login, register, dashboard, disease-detector, new-listing, prices)
  - `src/components/` — shared components (navbar, footer, hero-slideshow, etc.)
  - `src/lib/auth-context.tsx` — auth state (localStorage-based demo auth)
  - `src/index.css` — Tailwind v4 + Zimazao color palette (oklch green/gold theme)
- `artifacts/api-server/` — Express backend (currently just healthz)
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — Drizzle ORM schema

## Architecture decisions

- Migrated from Next.js (Vercel) to React + Vite (Replit pnpm monorepo).
- Routing uses Wouter instead of Next.js file-based routing.
- Auth is localStorage-based demo auth (no backend yet); `AuthProvider` lives in `App.tsx`.
- Color palette uses oklch values (Tailwind v4 compatible), not HSL.
- No SSR — fully client-rendered SPA.

## Product

- **Home** — hero slideshow, stats, features, featured crops, CTA
- **Marketplace** — browse and filter crops by category/province
- **Disease Detector** — upload crop photo for AI disease analysis (mock)
- **Market Prices** — live price comparison across Zambian markets
- **Dashboard** — farmer stats, recent listings, messages
- **Login / Register** — auth forms with demo localStorage auth
- **New Listing** — form to post a crop listing

## User preferences

_Populate as you build._

## Gotchas

- `AuthProvider` must only appear once at the App level (in `App.tsx`). Pages should NOT wrap themselves in `AuthProvider`.
- Do not run `pnpm dev` at workspace root — use `restart_workflow` for the `artifacts/zimazao: web` workflow.
- The app uses Tailwind v4 with `@tailwindcss/vite` plugin — do NOT add `postcss.config.mjs` (it conflicts).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
