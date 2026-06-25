/**
 * Idempotent startup migrations.
 * Runs every time the server starts — all statements use IF NOT EXISTS / IF NOT EXISTS guards.
 */
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

export async function runMigrations(): Promise<void> {
  try {
    // ── Listings: add optional geo columns ───────────────────────────────────
    await db.execute(sql`
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude  NUMERIC(10,6);
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,6);
    `);

    // ── Users: optional profile columns ─────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture  TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS buyer_rating      NUMERIC(3,2) NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS buyer_rating_count INTEGER NOT NULL DEFAULT 0;
    `);

    // ── Orders: extra columns ────────────────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method        TEXT NOT NULL DEFAULT 'online';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS escrow_status         TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMP;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS auto_release_at       TIMESTAMP;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS dispute_id            INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_token        TEXT;
    `);

    // ── Messages: extra columns ──────────────────────────────────────────────
    await db.execute(sql`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read         BOOLEAN NOT NULL DEFAULT false;
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS related_order_id INTEGER;
    `);

    // ── Reviews table ────────────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id          SERIAL PRIMARY KEY,
        order_id    INTEGER NOT NULL REFERENCES orders(id),
        buyer_id    INTEGER NOT NULL REFERENCES users(id),
        farmer_id   INTEGER NOT NULL REFERENCES users(id),
        rating      INTEGER NOT NULL,
        comment     TEXT,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // ── Notifications table ──────────────────────────────────────────────────
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

    // ── Disputes table ───────────────────────────────────────────────────────
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

    // ── Transaction events table ─────────────────────────────────────────────
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

    // ── Withdrawal requests table ─────────────────────────────────────────────
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

    // ── Reports table ────────────────────────────────────────────────────────
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

    // ── Sponsored products table ─────────────────────────────────────────────
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

    // ── App settings defaults ─────────────────────────────────────────────────
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key        TEXT PRIMARY KEY,
        value      TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      INSERT INTO app_settings (key, value) VALUES
        ('commission_rate',   '3'),
        ('pro_price_zmw',     '150'),
        ('free_listing_limit','3'),
        ('free_scan_limit',   '5'),
        ('maintenance_mode',  'false')
      ON CONFLICT (key) DO NOTHING;
    `);

    logger.info("Database migrations completed");
  } catch (err: any) {
    logger.error({ err }, "Migration error (non-fatal)");
  }
}
