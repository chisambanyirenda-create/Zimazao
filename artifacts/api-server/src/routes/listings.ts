import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable } from "@workspace/db";
import { eq, and, ilike, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/listings", async (req, res): Promise<void> => {
  const { category, location, search } = req.query as Record<string, string>;

  let query = db
    .select({
      id: listingsTable.id,
      farmerId: listingsTable.farmerId,
      farmerName: usersTable.name,
      cropName: listingsTable.cropName,
      price: listingsTable.price,
      unit: listingsTable.unit,
      quantity: listingsTable.quantity,
      location: listingsTable.location,
      category: listingsTable.category,
      description: listingsTable.description,
      imageUrl: listingsTable.imageUrl,
      isActive: listingsTable.isActive,
      createdAt: listingsTable.createdAt,
    })
    .from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
    .where(eq(listingsTable.isActive, true))
    .$dynamic();

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

  const { cropName, price, unit, quantity, location, category, description, imageUrl } = req.body;
  if (!cropName || !price || !unit || !quantity || !location || !category) {
    res.status(400).json({ error: "cropName, price, unit, quantity, location, and category are required" });
    return;
  }

  const [listing] = await db.insert(listingsTable).values({
    farmerId: req.user!.userId,
    cropName,
    price: String(price),
    unit,
    quantity,
    location,
    category,
    description: description || null,
    imageUrl: imageUrl || null,
    isActive: true,
  }).returning();

  req.log.info({ listingId: listing.id }, "Listing created");
  res.status(201).json(listing);
});

export default router;
