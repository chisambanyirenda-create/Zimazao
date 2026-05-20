import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

router.get("/orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const buyerId = req.user!.userId;

  const orders = await db
    .select({
      id: ordersTable.id,
      quantity: ordersTable.quantity,
      totalPrice: ordersTable.totalPrice,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      listingId: ordersTable.listingId,
      cropName: listingsTable.cropName,
      unit: listingsTable.unit,
      location: listingsTable.location,
      imageUrl: listingsTable.imageUrl,
      farmerName: usersTable.name,
      farmerId: listingsTable.farmerId,
    })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
    .where(eq(ordersTable.buyerId, buyerId))
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders);
}) as RequestHandler);

router.post("/orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { listingId, quantity, totalPrice } = req.body;
  if (!listingId || !quantity || !totalPrice) {
    res.status(400).json({ error: "listingId, quantity, and totalPrice are required" }); return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing || !listing.isActive) {
    res.status(404).json({ error: "Listing not found or inactive" }); return;
  }

  const [order] = await db.insert(ordersTable).values({
    buyerId: req.user!.userId,
    listingId,
    quantity: String(quantity),
    totalPrice: String(totalPrice),
    status: "pending",
  }).returning();

  req.log.info({ orderId: order.id }, "Order created");
  res.status(201).json(order);
}) as RequestHandler);

export default router;
