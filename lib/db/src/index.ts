import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Dev  → Replit native DB (always reachable)
// Prod → Supabase first (where the admin app lives), fallback to Replit DB
const connectionString = (
  process.env.NODE_ENV === "production"
    ? (process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL)
    : (process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL)
)?.trim();

if (!connectionString) {
  throw new Error(
    "No database URL configured. Set DATABASE_URL or SUPABASE_DATABASE_URL.",
  );
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
