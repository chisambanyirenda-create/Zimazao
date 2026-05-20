import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable, subscriptionsTable } from "@workspace/db";
import { eq, and, ilike, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const FREE_LISTING_LIMIT = 3;

const router: IRouter = Router();

router.get("/listings", async (req, res): Promise<void> => {
  const { category, location, search } = req.query as Record<string, string>;

  const filters = [eq(listingsTable.isActive, true)];
  if (category) filters.push(eq(listingsTable.category, category as any));
  if (location) filters.push(ilike(listingsTable.location, `%${location}%`));
  if (search) filters.push(ilike(listingsTable.cropName, `%${search}%`));

  const results = await db
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

  res.json(results);
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

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

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  res.json(listing);
});

router.post("/listings", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (req.user?.userType !== "farmer") {
    res.status(403).json({ error: "Only farmers can create listings" });
    return;
  }

  const userId = req.user!.userId;

  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")))
    .limit(1);

  const isPro = sub?.plan === "pro";

  if (!isPro) {
    const [{ activeCount }] = await db
      .select({ activeCount: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.farmerId, userId), eq(listingsTable.isActive, true)));

    if (activeCount >= FREE_LISTING_LIMIT) {
      res.status(403).json({
        error: `Free plan allows a maximum of ${FREE_LISTING_LIMIT} active listings. Upgrade to Pro for unlimited listings.`,
        code: "LISTING_LIMIT_REACHED",
        limit: FREE_LISTING_LIMIT,
        current: activeCount,
      });
      return;
    }
  }

  const { cropName, price, unit, quantity, location, latitude, longitude, category, description, imageUrl } = req.body;
  if (!cropName || !price || !unit || !quantity || !location || !category) {
    res.status(400).json({ error: "cropName, price, unit, quantity, location, and category are required" });
    return;
  }

  const [listing] = await db.insert(listingsTable).values({
    farmerId: userId,
    cropName,
    price: String(price),
    unit,
    quantity,
    location,
    latitude: latitude ? String(latitude) : null,
    longitude: longitude ? String(longitude) : null,
    category,
    description: description || null,
    imageUrl: imageUrl || null,
    isActive: true,
  }).returning();

  req.log.info({ listingId: listing.id, isPro }, "Listing created");
  res.status(201).json(listing);
});

export default router;
