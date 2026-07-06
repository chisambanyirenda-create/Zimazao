/**
 * Seed realistic starter farmers + crop listings so the marketplace isn't empty.
 * Idempotent: guarded by an app_settings marker. Run once:
 *   DATABASE_URL=... node seed-demo.mjs
 */
import pg from "pg";
import bcryptjs from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error("DATABASE_URL not set"); process.exit(1); }
const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const FARMERS = [
  { name: "John Mwansa",  email: "john.mwansa@demo.zm",  location: "Choma, Southern",    lat: -16.80, lon: 26.99 },
  { name: "Mary Banda",   email: "mary.banda@demo.zm",   location: "Chipata, Eastern",   lat: -13.64, lon: 32.65 },
  { name: "Peter Phiri",  email: "peter.phiri@demo.zm",  location: "Mkushi, Central",    lat: -13.62, lon: 29.39 },
  { name: "Grace Tembo",  email: "grace.tembo@demo.zm",  location: "Mazabuka, Southern", lat: -15.85, lon: 27.75 },
  { name: "Ruth Chanda",  email: "ruth.chanda@demo.zm",  location: "Kasama, Northern",   lat: -10.21, lon: 31.18 },
  { name: "James Mumba",  email: "james.mumba@demo.zm",  location: "Mansa, Luapula",     lat: -11.20, lon: 28.89 },
];

const LISTINGS = [
  { f: 0, crop: "White Maize",          price: 450, unit: "50kg bag",  qty: "500 bags",  cat: "cereals",    desc: "Grade A white maize, well dried and clean. Bulk discounts available." },
  { f: 0, crop: "Sorghum",              price: 315, unit: "50kg bag",  qty: "220 bags",  cat: "cereals",    desc: "Drought-resistant red sorghum, freshly harvested." },
  { f: 1, crop: "Groundnuts (Shelled)", price: 380, unit: "25kg bag",  qty: "180 bags",  cat: "legumes",    desc: "Chalimbana variety, hand-sorted. Great for peanut butter." },
  { f: 1, crop: "Mixed Beans",          price: 520, unit: "50kg bag",  qty: "90 bags",   cat: "legumes",    desc: "Sugar beans, cleaned and graded." },
  { f: 2, crop: "Soybeans",             price: 520, unit: "50kg bag",  qty: "300 bags",  cat: "legumes",    desc: "High-protein soya from the Mkushi block. Oil-grade." },
  { f: 2, crop: "Sunflower Seeds",      price: 280, unit: "25kg bag",  qty: "150 bags",  cat: "oilseeds",   desc: "High oil-content sunflower seeds." },
  { f: 3, crop: "Fresh Tomatoes",       price: 150, unit: "crate",     qty: "60 crates", cat: "vegetables", desc: "Greenhouse Roma tomatoes, picked to order." },
  { f: 3, crop: "Rape Vegetables",      price: 45,  unit: "bundle",    qty: "200 bundles", cat: "vegetables", desc: "Fresh leafy rape, harvested daily." },
  { f: 4, crop: "Sweet Potatoes",       price: 120, unit: "50kg bag",  qty: "250 bags",  cat: "tubers",     desc: "Orange-fleshed sweet potatoes, rich in vitamin A." },
  { f: 4, crop: "Cassava (Dried)",      price: 200, unit: "50kg bag",  qty: "300 bags",  cat: "tubers",     desc: "Sun-dried cassava, ready for milling." },
  { f: 5, crop: "Irish Potatoes",       price: 220, unit: "50kg bag",  qty: "140 bags",  cat: "tubers",     desc: "Cold-climate Irish potatoes." },
  { f: 5, crop: "Watermelons",          price: 35,  unit: "each",      qty: "400 units", cat: "fruits",     desc: "Large, sweet watermelons." },
  { f: 0, crop: "Village Chickens",     price: 120, unit: "bird",      qty: "60 birds",  cat: "poultry",    desc: "Free-range village chickens, vaccinated." },
  { f: 2, crop: "Cattle (Brahman)",     price: 9500, unit: "head",     qty: "12 head",   cat: "livestock",  desc: "Healthy Brahman cattle, dewormed." },
];

async function main() {
  const client = await pool.connect();
  try {
    // Ensure the columns/tables this seed needs exist (independent of app migrations).
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false`);

    const marker = await client.query("SELECT value FROM app_settings WHERE key = 'demo_seeded'");
    if (marker.rows[0]?.value === "true") { console.log("Already seeded — nothing to do."); return; }

    const hash = await bcryptjs.hash("Zimazao123", 12);
    const ids = [];
    for (const f of FARMERS) {
      const r = await client.query(
        `INSERT INTO users (name, email, password, location, user_type, wallet_balance, email_verified)
         VALUES ($1,$2,$3,$4,'farmer',20000,true)
         ON CONFLICT (email) DO UPDATE SET location = EXCLUDED.location
         RETURNING id`,
        [f.name, f.email, hash, f.location],
      );
      ids.push(r.rows[0].id);
    }

    let created = 0;
    for (const l of LISTINGS) {
      const farmer = FARMERS[l.f];
      await client.query(
        `INSERT INTO listings (farmer_id, crop_name, price, unit, quantity, location, latitude, longitude, category, description, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)`,
        [ids[l.f], l.crop, l.price, l.unit, l.qty, farmer.location, farmer.lat, farmer.lon, l.cat, l.desc],
      );
      created++;
    }

    await client.query(
      `INSERT INTO app_settings (key, value) VALUES ('demo_seeded','true')
       ON CONFLICT (key) DO UPDATE SET value = 'true'`,
    );
    console.log(`Seeded ${FARMERS.length} farmers and ${created} listings. Demo login: any @demo.zm / Zimazao123`);
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
