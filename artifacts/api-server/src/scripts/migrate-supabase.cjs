"use strict";
const { Pool } = require("/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg");
const bcryptjs = require("/home/runner/workspace/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs");

const connectionString = process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
DO $$ BEGIN CREATE TYPE user_type AS ENUM ('farmer', 'buyer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE category AS ENUM ('cereals','legumes','tubers','oilseeds','vegetables','fruits','livestock','poultry','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_plan AS ENUM ('free','pro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('active','expired','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending','successful','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('mtn_mobile_money','airtel_money','card'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  user_type user_type NOT NULL DEFAULT 'farmer',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  banned_until TIMESTAMP,
  ban_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  crop_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  quantity TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  category category NOT NULL DEFAULT 'other',
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  quantity TEXT NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disease_scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  image_url TEXT,
  disease_found TEXT,
  confidence NUMERIC(5,2),
  treatment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan subscription_plan NOT NULL DEFAULT 'free',
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP,
  status subscription_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sponsored_products (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  description TEXT,
  price NUMERIC(10,2),
  target_disease TEXT NOT NULL,
  contact_number TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ZMW',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  reference TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL DEFAULT 'subscription',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'all',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

async function migrate() {
  let client;
  try {
    client = await pool.connect();
    console.log("✅ Connected to Supabase.");

    console.log("Creating tables and enums...");
    await client.query(SQL);
    console.log("✅ Tables created.");

    await client.query(`
      INSERT INTO app_settings (key, value) VALUES
        ('commission_rate', '5'),('pro_price_zmw', '150'),
        ('free_listing_limit', '3'),('free_scan_limit', '5'),
        ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log("✅ Settings seeded.");

    const hash = await bcryptjs.hash("zimazao1234", 10);
    await client.query(
      `INSERT INTO users (name, email, password, user_type, is_admin)
       VALUES ('CEO Admin', 'admin@gmail.com', $1, 'farmer', true)
       ON CONFLICT (email) DO UPDATE SET password = $1, is_admin = true`,
      [hash]
    );
    console.log("✅ Admin seeded: admin@gmail.com / zimazao1234");
    console.log("\n🎉 Supabase migration complete!");
  } catch (err) {
    console.error("Migration error:", err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

migrate();
