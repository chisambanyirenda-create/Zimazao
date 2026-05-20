# Zimazao - Zambia Agricultural Marketplace

A marketplace platform for buying and selling crops, detecting plant diseases, and checking market prices across Zambia.

## Run & Operate

- `pnpm --filter @workspace/zimazao run dev` — run the frontend (via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `bash scripts/push-to-github.sh "message"` — push to GitHub (uses GITHUB_TOKEN)
- Required env: `DATABASE_URL` — Postgres connection string (Replit-managed)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter (routing) + Tailwind CSS v4
- API: Express 5 + JWT auth + bcryptjs
- DB: PostgreSQL (Replit) + Drizzle ORM
- AI: Google Gemini 1.5 Flash (disease detection)
- Storage: Cloudinary (image uploads — keys in secrets)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/zimazao/` — main frontend (React + Vite)
  - `src/pages/` — page components (home, marketplace, login, register, dashboard, disease-detector, new-listing, prices)
  - `src/components/` — shared components (navbar, footer, hero-slideshow, etc.)
  - `src/lib/auth-context.tsx` — real JWT auth (calls `/api/auth/*`)
  - `src/lib/api.ts` — typed API client for all backend routes
  - `src/index.css` — Tailwind v4 + Zimazao color palette (oklch green/gold theme)
- `artifacts/api-server/` — Express 5 backend
  - `src/routes/auth.ts` — POST /auth/register, POST /auth/login (JWT)
  - `src/routes/listings.ts` — GET/POST /listings, GET /listings/:id
  - `src/routes/orders.ts` — POST /orders
  - `src/routes/disease.ts` — POST /disease/scan (Gemini AI)
  - `src/routes/prices.ts` — GET /prices (static Zambian market data)
  - `src/routes/dashboard.ts` — GET /dashboard (farmer stats)
  - `src/lib/jwt.ts` — JWT sign/verify
  - `src/middlewares/auth.ts` — requireAuth middleware
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/` — Drizzle ORM schema (users, listings, orders, messages, disease_scans)
- `scripts/push-to-github.sh` — GitHub push script (uses GITHUB_TOKEN)

## Architecture decisions

- Migrated from Next.js (Vercel) to React + Vite (Replit pnpm monorepo).
- Routing uses Wouter instead of Next.js file-based routing.
- Auth uses real JWT (bcryptjs password hashing, 7-day tokens stored in localStorage).
- Color palette uses oklch values (Tailwind v4 compatible), not HSL.
- No SSR — fully client-rendered SPA.
- `SUPABASE_DATABASE_URL` is a REST URL only — actual DB uses Replit's `DATABASE_URL` (Postgres).

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/healthz | — | Health check |
| POST | /api/auth/register | — | Register user, returns JWT |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/listings | — | List active crop listings |
| POST | /api/listings | JWT | Create listing (farmers only) |
| GET | /api/listings/:id | — | Get single listing |
| POST | /api/orders | JWT | Place an order |
| POST | /api/disease/scan | JWT | Gemini AI disease detection |
| GET | /api/prices | — | Zambian market prices |
| GET | /api/dashboard | JWT | Farmer dashboard stats |

## DB Tables

- `users` — id, name, email, password (hashed), phone, location, user_type (farmer/buyer)
- `listings` — id, farmer_id, crop_name, price, unit, quantity, location, category, description, image_url, is_active
- `orders` — id, buyer_id, listing_id, quantity, total_price, status
- `messages` — id, sender_id, receiver_id, content
- `disease_scans` — id, user_id, image_url, disease_found, confidence, treatment

## Product

- **Home** — hero slideshow, stats, features, featured crops, CTA
- **Marketplace** — browse and filter crops by category/province (live from DB)
- **Disease Detector** — upload crop photo for Gemini AI disease analysis
- **Market Prices** — price comparison across Zambian markets (from API)
- **Dashboard** — real farmer stats, recent listings (from API)
- **Login / Register** — real JWT auth forms
- **New Listing** — form to post a crop listing (saves to DB)

## User preferences

_Populate as you build._

## Gotchas

- `AuthProvider` must only appear once at the App level (in `App.tsx`). Pages should NOT wrap themselves in `AuthProvider`.
- Do not run `pnpm dev` at workspace root — use `restart_workflow` for the `artifacts/zimazao: web` workflow.
- The app uses Tailwind v4 with `@tailwindcss/vite` plugin — do NOT add `postcss.config.mjs` (it conflicts).
- Database uses Replit's built-in PostgreSQL via `DATABASE_URL` (auto-provided by Replit).
- JWT secret is set via `JWT_SECRET` env var (already configured in shared env).
- Frontend runs on port **19683** (artifact-managed webview port), API runs on port **8080**.
- Vite proxies `/api` requests to `http://localhost:8080` — frontend uses relative `/api` paths.
- Gemini AI uses Replit AI Integrations (`AI_INTEGRATIONS_GEMINI_API_KEY` / `AI_INTEGRATIONS_GEMINI_BASE_URL`) — no external API key needed.
- Cloudinary image upload credentials are in Replit Secrets (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
