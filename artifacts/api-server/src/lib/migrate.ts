/**
 * Idempotent startup migrations.
 * Runs every time the server starts — all statements use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS guards.
 */
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function runMigrations(): Promise<void> {
  try {
    // ── Enums (safe to re-run) ────────────────────────────────────────────────
    await db.execute(sql`
      DO $$ BEGIN CREATE TYPE user_type AS ENUM ('farmer','buyer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE category AS ENUM ('cereals','legumes','tubers','oilseeds','vegetables','fruits','livestock','poultry','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE subscription_plan AS ENUM ('free','pro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('active','expired','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending','successful','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('mtn_mobile_money','airtel_money','card'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // ── Base tables (fresh-database bootstrap) ────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL, phone TEXT, location TEXT,
        user_type user_type NOT NULL DEFAULT 'farmer',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY, farmer_id INTEGER NOT NULL REFERENCES users(id),
        crop_name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL, unit TEXT NOT NULL,
        quantity TEXT NOT NULL, location TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY, buyer_id INTEGER NOT NULL REFERENCES users(id),
        listing_id INTEGER NOT NULL REFERENCES listings(id),
        quantity TEXT NOT NULL, total_price NUMERIC(10,2) NOT NULL,
        status order_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY, sender_id INTEGER NOT NULL REFERENCES users(id),
        receiver_id INTEGER NOT NULL REFERENCES users(id),
        content TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS disease_scans (
        id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id),
        image_url TEXT, disease_found TEXT, confidence NUMERIC(5,2),
        treatment TEXT, created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
        plan subscription_plan NOT NULL DEFAULT 'free',
        start_date TIMESTAMP NOT NULL DEFAULT NOW(), end_date TIMESTAMP,
        status subscription_status NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
        amount NUMERIC(10,2) NOT NULL, currency TEXT NOT NULL DEFAULT 'ZMW',
        method payment_method NOT NULL, status payment_status NOT NULL DEFAULT 'pending',
        reference TEXT NOT NULL UNIQUE, purpose TEXT NOT NULL DEFAULT 'subscription',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY, title TEXT NOT NULL, message TEXT NOT NULL,
        target TEXT NOT NULL DEFAULT 'all', created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Users: add missing columns ────────────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture    TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance     NUMERIC(12,2) NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS buyer_rating       NUMERIC(3,2)  NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS buyer_rating_count INTEGER       NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin           BOOLEAN       NOT NULL DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified     BOOLEAN       NOT NULL DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned          BOOLEAN       NOT NULL DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_until       TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason         TEXT;
    `);

    // ── Listings: add missing columns ─────────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude    NUMERIC(10,6);
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude   NUMERIC(10,6);
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_url   TEXT;
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_active   BOOLEAN NOT NULL DEFAULT true;
    `);

    // category column — TEXT fallback if enum type doesn't exist yet
    await db.execute(sql`
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other';
    `);

    // ── Orders: add missing columns ───────────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission           NUMERIC(10,2) NOT NULL DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method       TEXT NOT NULL DEFAULT 'online';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_status        TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_release_at      TIMESTAMP;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_id           INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_token       TEXT;
    `);

    // ── Messages: add missing columns ─────────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read          BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_order_id INTEGER;
    `);

    // ── Subscriptions: ensure plan column exists ──────────────────────────────
    await db.execute(sql`
      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id TEXT;
    `);

    // ── Reviews table ─────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id          SERIAL PRIMARY KEY,
        order_id    INTEGER REFERENCES orders(id),
        buyer_id    INTEGER NOT NULL REFERENCES users(id),
        farmer_id   INTEGER NOT NULL REFERENCES users(id),
        rating      INTEGER NOT NULL,
        comment     TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
      ALTER TABLE reviews ALTER COLUMN order_id DROP NOT NULL;
    `);

    // ── Notifications table ───────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        type       TEXT NOT NULL,
        title      TEXT NOT NULL,
        body       TEXT NOT NULL,
        href       TEXT NOT NULL DEFAULT '/',
        is_read    BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Disputes table ────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS disputes (
        id                SERIAL PRIMARY KEY,
        order_id          INTEGER NOT NULL REFERENCES orders(id),
        raised_by         INTEGER NOT NULL REFERENCES users(id),
        reason            TEXT NOT NULL,
        description       TEXT NOT NULL,
        photo_urls        TEXT,
        status            TEXT NOT NULL DEFAULT 'open',
        resolution_action TEXT,
        resolution_note   TEXT,
        resolved_by       INTEGER REFERENCES users(id),
        resolved_at       TIMESTAMP,
        created_at        TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Transaction events ────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transaction_events (
        id          SERIAL PRIMARY KEY,
        order_id    INTEGER NOT NULL REFERENCES orders(id),
        event_type  TEXT NOT NULL,
        metadata    TEXT,
        created_by  INTEGER REFERENCES users(id),
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Withdrawal requests ───────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id                   SERIAL PRIMARY KEY,
        farmer_id            INTEGER NOT NULL REFERENCES users(id),
        amount               NUMERIC(10,2) NOT NULL,
        mobile_money_number  TEXT NOT NULL,
        network              TEXT NOT NULL DEFAULT 'MTN',
        status               TEXT NOT NULL DEFAULT 'pending',
        admin_note           TEXT,
        approved_by          INTEGER REFERENCES users(id),
        processed_at         TIMESTAMP,
        created_at           TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Reports table ─────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reports (
        id            SERIAL PRIMARY KEY,
        reporter_id   INTEGER NOT NULL,
        reporter_name TEXT,
        target_type   TEXT NOT NULL,
        target_id     INTEGER NOT NULL,
        target_name   TEXT,
        reason        TEXT NOT NULL,
        description   TEXT,
        status        TEXT NOT NULL DEFAULT 'pending',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // ── Sponsored products ────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sponsored_products (
        id             SERIAL PRIMARY KEY,
        company_name   TEXT NOT NULL,
        product_name   TEXT NOT NULL,
        product_image  TEXT,
        description    TEXT,
        price          NUMERIC(10,2),
        target_disease TEXT NOT NULL,
        contact_number TEXT,
        is_active      BOOLEAN NOT NULL DEFAULT true,
        created_at     TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── App settings ──────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      INSERT INTO app_settings (key, value) VALUES
        ('commission_rate',    '3'),
        ('pro_price_zmw',      '150'),
        ('free_listing_limit', '3'),
        ('free_scan_limit',    '5'),
        ('maintenance_mode',   'false')
      ON CONFLICT (key) DO NOTHING;
    `);

    // ── Password reset tokens ─────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
    `);

    // ── Email verification tokens ─────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token_hash);
    `);

    logger.info("Database migrations completed");
  } catch (err: any) {
    logger.error({ err }, "Migration error (non-fatal)");
    throw err;
  }
}
