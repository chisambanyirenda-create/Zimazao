import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable, messagesTable } from "@workspace/db";
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

  const buyerId = req.user!.userId;

  // Farmers cannot place orders — they must switch to buyer mode
  if (req.user!.userType === "farmer") {
    res.status(403).json({ error: "Farmers cannot place orders. Switch to buyer mode first.", code: "FARMER_CANNOT_BUY" }); return;
  }

  // Farmers cannot buy their own listings
  if (listing.farmerId === buyerId) {
    res.status(403).json({ error: "You cannot order your own listing." }); return;
  }

  const [buyer] = await db
    .select({ walletBalance: usersTable.walletBalance, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, buyerId));

  if (!buyer || buyer.walletBalance < Math.round(price)) {
    res.status(402).json({
      error: `Insufficient wallet balance. You have K${buyer?.walletBalance?.toLocaleString() ?? 0}, need K${Math.round(price).toLocaleString()}.`,
    }); return;
  }

  await db
    .update(usersTable)
    .set({ walletBalance: buyer.walletBalance - Math.round(price) })
    .where(eq(usersTable.id, buyerId));

  const [order] = await db.insert(ordersTable).values({
    buyerId,
    listingId,
    quantity: String(quantity),
    totalPrice: String(price),
    commission: String(commission),
    status: "pending",
  }).returning();

  // Auto-send order notification message to the farmer
  const autoMsg =
    `📦 New Order #${order.id}\n\n` +
    `Crop: ${listing.cropName}\n` +
    `Quantity: ${quantity} ${listing.unit}(s)\n` +
    `Total: K${Math.round(price).toLocaleString()}\n` +
    `Your payout: K${Math.round(price - commission).toLocaleString()} (after 3% fee)\n\n` +
    `Please confirm this order when you are ready.`;

  await db.insert(messagesTable).values({
    senderId: buyerId,
    receiverId: listing.farmerId,
    content: autoMsg,
    isRead: false,
    relatedOrderId: order.id,
  } as any);

  req.log.info({ orderId: order.id, commission, buyerId, deducted: price }, "Order created, auto-message sent to farmer");
  res.status(201).json({ ...order, farmerPayout: price - commission, farmerId: listing.farmerId });
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
    .select({ id: ordersTable.id, listingFarmerId: listingsTable.farmerId, status: ordersTable.status, buyerId: ordersTable.buyerId })
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

  // Notify buyer of status change
  const statusEmoji: Record<string, string> = {
    confirmed: "✅",
    shipped: "🚚",
    delivered: "📬",
    cancelled: "❌",
  };
  const statusLabel: Record<string, string> = {
    confirmed: "Your order has been confirmed by the farmer and will be prepared for shipment.",
    shipped: "Your order is on the way! The farmer has dispatched your goods.",
    delivered: "Your order has been marked as delivered. Thank you for using Zimazao!",
    cancelled: "Your order has been cancelled by the farmer. Please contact them for details.",
  };

  if (order.buyerId) {
    await db.insert(messagesTable).values({
      senderId: farmerId,
      receiverId: order.buyerId,
      content: `${statusEmoji[status]} Order #${orderId} Update: ${status.charAt(0).toUpperCase() + status.slice(1)}\n\n${statusLabel[status]}`,
      isRead: false,
      relatedOrderId: orderId,
    } as any).catch(() => {});
  }

  res.json(updated);
}) as RequestHandler);

// ─── Live Location Store (in-memory, ephemeral) ───────────────────────────
interface LocationEntry { lat: number; lng: number; updatedAt: number }
interface OrderLocations { farmer?: LocationEntry; buyer?: LocationEntry }
const locationStore = new Map<number, OrderLocations>();

router.patch("/orders/:id/location", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);
  const { lat, lng } = req.body;
  if (isNaN(orderId) || lat == null || lng == null) {
    res.status(400).json({ error: "orderId, lat and lng are required" }); return;
  }

  const userId = req.user!.userId;

  const [order] = await db
    .select({ buyerId: ordersTable.buyerId, farmerId: listingsTable.farmerId })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const isBuyer = order.buyerId === userId;
  const isFarmer = order.farmerId === userId;
  if (!isBuyer && !isFarmer) { res.status(403).json({ error: "Not your order" }); return; }

  const existing = locationStore.get(orderId) ?? {};
  const role = isBuyer ? "buyer" : "farmer";
  locationStore.set(orderId, { ...existing, [role]: { lat, lng, updatedAt: Date.now() } });

  res.json({ ok: true, role });
}) as RequestHandler);

router.get("/orders/:id/locations", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) { res.status(400).json({ error: "Invalid order id" }); return; }

  const userId = req.user!.userId;
  const [order] = await db
    .select({ buyerId: ordersTable.buyerId, farmerId: listingsTable.farmerId })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.buyerId !== userId && order.farmerId !== userId) {
    res.status(403).json({ error: "Not your order" }); return;
  }

  const locs = locationStore.get(orderId) ?? {};
  const now = Date.now();
  const freshen = (e?: LocationEntry) => e && (now - e.updatedAt < 120_000) ? e : undefined;

  res.json({ farmer: freshen(locs.farmer), buyer: freshen(locs.buyer) });
}) as RequestHandler);

export default router;
