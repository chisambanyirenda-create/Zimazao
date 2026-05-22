import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import bcryptjs from "bcryptjs";

const router: IRouter = Router();

const SETUP_KEY = process.env.SETUP_SECRET_KEY || "zimazao-setup-2024";

router.post("/setup", async (req, res): Promise<void> => {
  const { key } = req.body as { key?: string };
  if (key !== SETUP_KEY) {
    res.status(401).json({ error: "Invalid setup key" });
    return;
  }

  const steps: string[] = [];
  try {
    await db.execute(sql`
      DO $$ BEGIN CREATE TYPE user_type AS ENUM ('farmer', 'buyer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE category AS ENUM ('cereals','legumes','tubers','oilseeds','vegetables','fruits','livestock','poultry','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE subscription_plan AS ENUM ('free','pro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('active','expired','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending','successful','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('mtn_mobile_money','airtel_money','card'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL, phone TEXT, location TEXT,
        user_type user_type NOT NULL DEFAULT 'farmer',
        wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        is_banned BOOLEAN NOT NULL DEFAULT false,
        banned_until TIMESTAMP, ban_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY, farmer_id INTEGER NOT NULL REFERENCES users(id),
        crop_name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL, unit TEXT NOT NULL,
        quantity TEXT NOT NULL, location TEXT NOT NULL,
        latitude NUMERIC(10,6), longitude NUMERIC(10,6),
        category category NOT NULL DEFAULT 'other',
        description TEXT, image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY, buyer_id INTEGER NOT NULL REFERENCES users(id),
        listing_id INTEGER NOT NULL REFERENCES listings(id),
        quantity TEXT NOT NULL, total_price NUMERIC(10,2) NOT NULL,
        commission NUMERIC(10,2) NOT NULL DEFAULT 0,
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

      CREATE TABLE IF NOT EXISTS sponsored_products (
        id SERIAL PRIMARY KEY, company_name TEXT NOT NULL, product_name TEXT NOT NULL,
        product_image TEXT, description TEXT, price NUMERIC(10,2),
        target_disease TEXT NOT NULL, contact_number TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
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

      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY, value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    steps.push("Tables and enums created");

    await db.execute(sql`
      INSERT INTO app_settings (key, value) VALUES
        ('commission_rate','3'),('pro_price_zmw','150'),
        ('free_listing_limit','3'),('free_scan_limit','5'),
        ('maintenance_mode','false')
      ON CONFLICT (key) DO NOTHING;
    `);
    steps.push("Default settings seeded");

    const hash = await bcryptjs.hash("zimazao1234", 10);
    await db.execute(sql`
      INSERT INTO users (name, email, password, user_type, is_admin)
      VALUES ('CEO Admin', 'admin@gmail.com', ${hash}, 'farmer', true)
      ON CONFLICT (email) DO UPDATE SET password = ${hash}, is_admin = true
    `);
    steps.push("Admin user seeded (admin@gmail.com / zimazao1234)");

    res.json({ ok: true, steps });
  } catch (err: any) {
    res.status(500).json({ error: err.message, steps });
  }
});

export default router;
