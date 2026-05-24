import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable, subscriptionsTable, reviewsTable } from "@workspace/db";
import { eq, and, ilike, or, gte, lte, count, avg, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const FREE_LISTING_LIMIT = 3;
const router: IRouter = Router();

router.get("/listings", async (req, res): Promise<void> => {
  const { category, location, search, minPrice, maxPrice, minQty, verifiedOnly, sort } =
    req.query as Record<string, string>;

  const filters: any[] = [eq(listingsTable.isActive, true)];
  if (category && category !== "all") filters.push(eq(listingsTable.category, category as any));
  if (location && location !== "all") filters.push(ilike(listingsTable.location, `%${location}%`));
  if (search) {
    filters.push(
      or(
        ilike(listingsTable.cropName, `%${search}%`),
        ilike(usersTable.name, `%${search}%`),
        ilike(listingsTable.location, `%${search}%`),
      )
    );
  }
  if (minPrice) filters.push(gte(listingsTable.price, minPrice));
  if (maxPrice) filters.push(lte(listingsTable.price, maxPrice));

  let rows = await db
    .select({
      id: listingsTable.id,
      farmerId: listingsTable.farmerId,
      farmerName: usersTable.name,
      cropName: listingsTable.cropName,
      price: listingsTable.price,
      unit: listingsTable.unit,
      quantity: listingsTable.quantity,
      location: listingsTable.location,
      latitude: listingsTable.latitude,
      longitude: listingsTable.longitude,
      category: listingsTable.category,
      description: listingsTable.description,
      imageUrl: listingsTable.imageUrl,
      isActive: listingsTable.isActive,
      createdAt: listingsTable.createdAt,
    })
    .from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
    .where(and(...filters));

  if (minQty) {
    const min = parseFloat(minQty);
    rows = rows.filter((r) => parseFloat(String(r.quantity || 0)) >= min);
  }

  if (verifiedOnly === "true") {
    const proSubs = await db
      .select({ userId: subscriptionsTable.userId })
      .from(subscriptionsTable)
      .where(and(eq(subscriptionsTable.planId, "pro"), eq(subscriptionsTable.status, "active")));
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

  const [listing] = await db
    .select({
      id: listingsTable.id,
      farmerId: listingsTable.farmerId,
      farmerName: usersTable.name,
      cropName: listingsTable.cropName,
      price: listingsTable.price,
      unit: listingsTable.unit,
      quantity: listingsTable.quantity,
      location: listingsTable.location,
      latitude: listingsTable.latitude,
      longitude: listingsTable.longitude,
      category: listingsTable.category,
      description: listingsTable.description,
      imageUrl: listingsTable.imageUrl,
      isActive: listingsTable.isActive,
      createdAt: listingsTable.createdAt,
    })
    .from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
    .where(eq(listingsTable.id, id));

  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  const ratingRows = await db
    .select({ avgRating: avg(reviewsTable.rating), total: count(reviewsTable.id) })
    .from(reviewsTable)
    .where(eq(reviewsTable.farmerId, listing.farmerId!));

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

  const isPro = sub?.planId === "pro";
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

  const [listing] = await db.insert(listingsTable).values({
    farmerId, cropName, price: String(price), unit, quantity: String(quantity),
    location, category, description: description || null, imageUrl: imageUrl || null,
    latitude: latitude ? String(latitude) : null, longitude: longitude ? String(longitude) : null,
  }).returning();

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
