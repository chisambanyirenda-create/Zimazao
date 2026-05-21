import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const COMMISSION_RATE = 0.03;

const router: IRouter = Router();

router.get("/orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const buyerId = req.user!.userId;

  const orders = await db
    .select({
      id: ordersTable.id,
      quantity: ordersTable.quantity,
      totalPrice: ordersTable.totalPrice,
      commission: ordersTable.commission,
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

  const price = parseFloat(String(totalPrice));
  const commission = parseFloat((price * COMMISSION_RATE).toFixed(2));

  const [order] = await db.insert(ordersTable).values({
    buyerId: req.user!.userId,
    listingId,
    quantity: String(quantity),
    totalPrice: String(price),
    commission: String(commission),
    status: "pending",
  }).returning();

  req.log.info({ orderId: order.id, commission }, "Order created");
  res.status(201).json({ ...order, farmerPayout: price - commission });
}) as RequestHandler);

router.get("/orders/farmer-orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const farmerId = req.user!.userId;

  const orders = await db
    .select({
      id: ordersTable.id,
      quantity: ordersTable.quantity,
      totalPrice: ordersTable.totalPrice,
      commission: ordersTable.commission,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      listingId: ordersTable.listingId,
      cropName: listingsTable.cropName,
      unit: listingsTable.unit,
      location: listingsTable.location,
      imageUrl: listingsTable.imageUrl,
      buyerName: usersTable.name,
      buyerId: ordersTable.buyerId,
    })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .leftJoin(usersTable, eq(ordersTable.buyerId, usersTable.id))
    .where(eq(listingsTable.farmerId, farmerId))
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders);
}) as RequestHandler);

router.patch("/orders/:id/status", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  const farmerId = req.user!.userId;

  const allowed = ["confirmed", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${allowed.join(", ")}` }); return;
  }

  const [order] = await db
    .select({ id: ordersTable.id, listingFarmerId: listingsTable.farmerId, status: ordersTable.status })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.listingFarmerId !== farmerId) { res.status(403).json({ error: "Not your order" }); return; }

  const [updated] = await db
    .update(ordersTable)
    .set({ status })
    .where(eq(ordersTable.id, orderId))
    .returning();

  res.json(updated);
}) as RequestHandler);

export default router;
