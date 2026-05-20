# Zimazao - Agricultural Marketplace

A full-stack agricultural marketplace for Zambia connecting farmers directly with buyers. Features crop listings, market prices, disease detection, crop calendar, messaging, and order management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/zimazao run dev` — run the frontend (port 19683)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `JWT_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Wouter (routing), shadcn/ui, Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/zimazao/` — React + Vite frontend
- `artifacts/zimazao/src/pages/` — page components (home, marketplace, dashboard, etc.)
- `artifacts/zimazao/src/components/` — shared UI components
- `artifacts/zimazao/src/lib/api.ts` — API client with all endpoint calls
- `artifacts/zimazao/src/lib/auth-context.tsx` — authentication context
- `artifacts/api-server/src/routes/` — Express route handlers
- `lib/db/src/schema/` — Drizzle ORM schema (users, listings, orders, messages, disease_scans)

## Architecture decisions

- JWT-based auth stored in localStorage (`zimazao_token`)
- API routes under `/api/*`, proxied by the shared reverse proxy
- Frontend uses custom `api` client (not codegen hooks) since the project predates the OpenAPI spec
- Disease detection uses Google Gemini AI
- Image upload uses Cloudinary

## Product

- **Marketplace**: Browse and post crop listings with categories, location, price
- **Dashboard**: Farmer stats, recent listings, order overview
- **Disease Detector**: Upload crop photo → AI diagnosis with treatment advice
- **Market Prices**: Live price ticker for Zambian crops
- **Crop Calendar**: Seasonal planting/harvesting guide
- **Orders**: Track buy/sell orders
- **Messages**: In-app messaging between farmers and buyers
- **Auth**: Register as farmer or buyer, JWT sessions

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The frontend uses a custom `api` client in `src/lib/api.ts` rather than codegen hooks
- JWT_SECRET must be set or the API server will refuse to start
- Disease route uses Google Gemini — requires `GEMINI_API_KEY` or `GOOGLE_API_KEY` secret
- Image upload requires `CLOUDINARY_URL` or Cloudinary credentials

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
