import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable, subscriptionsTable, reviewsTable } from "@workspace/db";
import { eq, and, ilike, or, gte, lte, count, avg, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const FREE_LISTING_LIMIT = 3;
const router: IRouter = Router();

// ── Helper: build base listing select (lat/lon fetched via raw SQL as fallback) ──
async function queryListings(whereClause: string, params: any[]): Promise<any[]> {
  try {
    const result = await db.execute(
      sql.raw(
        `SELECT l.id, l.farmer_id as "farmerId", u.name as "farmerName",
                l.crop_name as "cropName", l.price, l.unit, l.quantity,
                l.location,
                (SELECT l2.latitude  FROM listings l2 WHERE l2.id = l.id) as latitude,
                (SELECT l2.longitude FROM listings l2 WHERE l2.id = l.id) as longitude,
                l.category, l.description, l.image_url as "imageUrl",
                l.is_active as "isActive", l.created_at as "createdAt"
         FROM listings l
         LEFT JOIN users u ON l.farmer_id = u.id
         ${whereClause}`
      )
    );
    return (result as any).rows ?? [];
  } catch {
    // Fallback without lat/lon if columns don't exist yet
    const result = await db.execute(
      sql.raw(
        `SELECT l.id, l.farmer_id as "farmerId", u.name as "farmerName",
                l.crop_name as "cropName", l.price, l.unit, l.quantity,
                l.location, NULL as latitude, NULL as longitude,
                l.category, l.description, l.image_url as "imageUrl",
                l.is_active as "isActive", l.created_at as "createdAt"
         FROM listings l
         LEFT JOIN users u ON l.farmer_id = u.id
         ${whereClause}`
      )
    );
    return (result as any).rows ?? [];
  }
}

router.get("/listings", async (req, res): Promise<void> => {
  const { category, location, search, minPrice, maxPrice, minQty, verifiedOnly, sort } =
    req.query as Record<string, string>;

  const conditions: string[] = ["l.is_active = true"];
  const params: any[] = [];

  if (category && category !== "all" && category !== "deals") {
    params.push(category);
    conditions.push(`l.category = $${params.length}`);
  }
  if (location && location !== "all") {
    params.push(`%${location}%`);
    conditions.push(`l.location ILIKE $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    const n = params.length;
    conditions.push(`(l.crop_name ILIKE $${n} OR u.name ILIKE $${n} OR l.location ILIKE $${n})`);
  }
  if (minPrice) {
    params.push(minPrice);
    conditions.push(`l.price >= $${params.length}`);
  }
  if (maxPrice) {
    params.push(maxPrice);
    conditions.push(`l.price <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // Use raw SQL fallback approach
  let rows: any[] = [];
  try {
    const q = `SELECT l.id, l.farmer_id as "farmerId", u.name as "farmerName",
                      l.crop_name as "cropName", l.price, l.unit, l.quantity,
                      l.location, l.category, l.description, l.image_url as "imageUrl",
                      l.is_active as "isActive", l.created_at as "createdAt"
               FROM listings l
               LEFT JOIN users u ON l.farmer_id = u.id
               ${where}`;
    // Try with geo columns if they exist
    try {
      const withGeo = q.replace(
        "l.is_active as",
        "l.latitude, l.longitude, l.is_active as"
      );
      const result = await db.execute(sql.raw(withGeo));
      rows = (result as any).rows ?? [];
    } catch {
      // Fall back without geo columns
      const result = await db.execute(sql.raw(q));
      rows = ((result as any).rows ?? []).map((r: any) => ({ ...r, latitude: null, longitude: null }));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }

  if (minQty) {
    const min = parseFloat(minQty);
    rows = rows.filter((r) => parseFloat(String(r.quantity || 0)) >= min);
  }

  if (verifiedOnly === "true") {
    const proSubs = await db
      .select({ userId: subscriptionsTable.userId })
      .from(subscriptionsTable)
      .where(and(eq(subscriptionsTable.plan, "pro"), eq(subscriptionsTable.status, "active")));
    const proIds = new Set(proSubs.map((s) => s.userId));
    rows = rows.filter((r) => r.farmerId != null && proIds.has(r.farmerId));
  }

  if (sort === "price_asc") rows.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
  else if (sort === "price_desc") rows.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
  else if (sort === "oldest") rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  else rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(rows);
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  let listing: any = null;
  try {
    // Try with geo columns
    const withGeo = await db.execute(sql`
      SELECT l.id, l.farmer_id as "farmerId", u.name as "farmerName",
             l.crop_name as "cropName", l.price, l.unit, l.quantity,
             l.location, l.latitude, l.longitude, l.category, l.description,
             l.image_url as "imageUrl", l.is_active as "isActive", l.created_at as "createdAt"
      FROM listings l
      LEFT JOIN users u ON l.farmer_id = u.id
      WHERE l.id = ${id}
    `);
    listing = ((withGeo as any).rows ?? [])[0] ?? null;
  } catch {
    // Fallback without geo
    const noGeo = await db.execute(sql`
      SELECT l.id, l.farmer_id as "farmerId", u.name as "farmerName",
             l.crop_name as "cropName", l.price, l.unit, l.quantity,
             l.location, NULL as latitude, NULL as longitude, l.category, l.description,
             l.image_url as "imageUrl", l.is_active as "isActive", l.created_at as "createdAt"
      FROM listings l
      LEFT JOIN users u ON l.farmer_id = u.id
      WHERE l.id = ${id}
    `);
    listing = ((noGeo as any).rows ?? [])[0] ?? null;
  }

  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  const ratingRows = await db
    .select({ avgRating: avg(reviewsTable.rating), total: count(reviewsTable.id) })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, listing.farmerId))
    .catch(() => [{ avgRating: null, total: 0 }]);

  res.json({
    ...listing,
    farmerRating: ratingRows[0]?.avgRating ? parseFloat(String(ratingRows[0].avgRating)).toFixed(1) : null,
    farmerReviewCount: ratingRows[0]?.total ?? 0,
  });
});

router.post("/listings", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const farmerId = req.user!.userId;
  const { cropName, price, unit, quantity, location, category, description, imageUrl, latitude, longitude } = req.body;

  if (!cropName || !price || !unit || !quantity || !location || !category) {
    res.status(400).json({ error: "cropName, price, unit, quantity, location and category are required" }); return;
  }

  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, farmerId), eq(subscriptionsTable.status, "active")));

  const isPro = sub?.plan === "pro";
  if (!isPro) {
    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.farmerId, farmerId), eq(listingsTable.isActive, true)));
    if (Number(activeCount) >= FREE_LISTING_LIMIT) {
      res.status(403).json({
        error: `Free plan allows up to ${FREE_LISTING_LIMIT} active listings. Upgrade to Pro for unlimited listings.`,
        code: "LISTING_LIMIT_REACHED",
      }); return;
    }
  }

  // Insert with geo columns if they exist, fallback without
  let listing: any;
  try {
    [listing] = await db.insert(listingsTable).values({
      farmerId, cropName, price: String(price), unit, quantity: String(quantity),
      location, category, description: description || null, imageUrl: imageUrl || null,
      latitude: latitude ? String(latitude) : null, longitude: longitude ? String(longitude) : null,
    }).returning();
  } catch {
    // If geo columns don't exist, insert without them
    const result = await db.execute(sql`
      INSERT INTO listings (farmer_id, crop_name, price, unit, quantity, location, category, description, image_url, is_active)
      VALUES (${farmerId}, ${cropName}, ${String(price)}, ${unit}, ${String(quantity)}, ${location}, ${category},
              ${description || null}, ${imageUrl || null}, true)
      RETURNING *
    `);
    listing = ((result as any).rows ?? [])[0];
  }

  res.status(201).json(listing);
});

router.patch("/listings/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const farmerId = req.user!.userId;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (existing.farmerId !== farmerId && !req.user!.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { cropName, price, unit, quantity, location, category, description, imageUrl, isActive, latitude, longitude } = req.body;
  const update: any = {};
  if (cropName !== undefined) update.cropName = cropName;
  if (price !== undefined) update.price = String(price);
  if (unit !== undefined) update.unit = unit;
  if (quantity !== undefined) update.quantity = String(quantity);
  if (location !== undefined) update.location = location;
  if (category !== undefined) update.category = category;
  if (description !== undefined) update.description = description;
  if (imageUrl !== undefined) update.imageUrl = imageUrl;
  if (isActive !== undefined) update.isActive = isActive;
  if (latitude !== undefined) update.latitude = latitude ? String(latitude) : null;
  if (longitude !== undefined) update.longitude = longitude ? String(longitude) : null;

  const [updated] = await db.update(listingsTable).set(update).where(eq(listingsTable.id, id)).returning();
  res.json(updated);
});

router.delete("/listings/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const farmerId = req.user!.userId;
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!existing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (existing.farmerId !== farmerId && !req.user!.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  await db.update(listingsTable).set({ isActive: false }).where(eq(listingsTable.id, id));
  res.json({ ok: true });
});

export default router;
