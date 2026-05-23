import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable, messagesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const COMMISSION_RATE = 0.03;

const router: IRouter = Router();

function mapOrderRow(r: any) {
  return {
    id: r.id,
    quantity: r.quantity,
    totalPrice: r.total_price,
    commission: r.commission,
    status: r.status,
    createdAt: r.created_at,
    listingId: r.listing_id,
    paymentMethod: r.payment_method ?? "online",
    escrowStatus: r.escrow_status ?? null,
    cropName: r.crop_name,
    unit: r.unit,
    location: r.location,
    imageUrl: r.image_url,
    farmerName: r.farmer_name,
    buyerName: r.buyer_name,
    farmerId: r.farmer_id,
    buyerId: r.buyer_id,
  };
}

router.get("/orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const buyerId = req.user!.userId;

  // Auto-release any escrow held orders past their auto_release_at
  await db.execute(sql`
    UPDATE orders SET escrow_status = 'released'
    WHERE buyer_id = ${buyerId} AND escrow_status = 'held'
    AND auto_release_at IS NOT NULL AND auto_release_at < NOW()
  `).catch(() => {});

  const result = await db.execute(sql`
    SELECT o.id, o.quantity, o.total_price, o.commission, o.status, o.created_at,
      o.listing_id, o.buyer_id, o.payment_method, o.escrow_status,
      l.crop_name, l.unit, l.location, l.image_url, l.farmer_id,
      u.name AS farmer_name
    FROM orders o
    LEFT JOIN listings l ON o.listing_id = l.id
    LEFT JOIN users u ON l.farmer_id = u.id
    WHERE o.buyer_id = ${buyerId}
    ORDER BY o.created_at DESC
  `);

  res.json(((result as any).rows ?? []).map(mapOrderRow));
}) as RequestHandler);

async function recordTxEvent(orderId: number, eventType: string, metadata: object, createdBy?: number) {
  try {
    await db.execute(sql`
      INSERT INTO transaction_events (order_id, event_type, metadata, created_by)
      VALUES (${orderId}, ${eventType}, ${JSON.stringify(metadata)}, ${createdBy ?? null})
    `);
  } catch {}
}

router.post("/orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { listingId, quantity, totalPrice, paymentMethod = "online" } = req.body;
  if (!listingId || !quantity || !totalPrice) {
    res.status(400).json({ error: "listingId, quantity, and totalPrice are required" }); return;
  }
  if (!["online", "cod"].includes(paymentMethod)) {
    res.status(400).json({ error: "paymentMethod must be 'online' or 'cod'" }); return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing || !listing.isActive) {
    res.status(404).json({ error: "Listing not found or inactive" }); return;
  }

  const price = parseFloat(String(totalPrice));
  const commission = parseFloat((price * COMMISSION_RATE).toFixed(2));
  const buyerId = req.user!.userId;

  if (req.user!.userType === "farmer") {
    res.status(403).json({ error: "Farmers cannot place orders. Switch to buyer mode first.", code: "FARMER_CANNOT_BUY" }); return;
  }
  if (listing.farmerId === buyerId) {
    res.status(403).json({ error: "You cannot order your own listing." }); return;
  }

  const [buyer] = await db
    .select({ walletBalance: usersTable.walletBalance, name: usersTable.name })
    .from(usersTable).where(eq(usersTable.id, buyerId));

  // For online payments: check wallet and deduct (held in escrow)
  if (paymentMethod === "online") {
    if (!buyer || buyer.walletBalance < Math.round(price)) {
      res.status(402).json({
        error: `Insufficient wallet balance. You have K${parseFloat(String(buyer?.walletBalance ?? 0)).toLocaleString()}, need K${Math.round(price).toLocaleString()}.`,
      }); return;
    }
    await db.update(usersTable)
      .set({ walletBalance: buyer.walletBalance - Math.round(price) })
      .where(eq(usersTable.id, buyerId));
  }

  // Set auto_release_at 48h from now for online orders
  const autoReleaseAt = paymentMethod === "online" ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null;

  const [order] = await db.insert(ordersTable).values({
    buyerId,
    listingId,
    quantity: String(quantity),
    totalPrice: String(price),
    commission: String(commission),
    status: "pending",
  }).returning();

  // Set payment_method and escrow columns via raw SQL (new columns)
  await db.execute(sql`
    UPDATE orders SET
      payment_method = ${paymentMethod},
      escrow_status = ${paymentMethod === "online" ? "held" : null},
      auto_release_at = ${autoReleaseAt}
    WHERE id = ${order.id}
  `).catch(() => {});

  const payMethodLabel = paymentMethod === "cod" ? "Cash on Delivery" : "Online (Escrow)";
  const autoMsg =
    `📦 New Order #${order.id} — ${payMethodLabel}\n\n` +
    `Crop: ${listing.cropName}\n` +
    `Quantity: ${quantity} ${listing.unit}(s)\n` +
    `Total: K${Math.round(price).toLocaleString()}\n` +
    (paymentMethod === "online"
      ? `Your payout: K${Math.round(price - commission).toLocaleString()} (after 3% fee) — released when buyer confirms delivery.\n\n`
      : `Payment: Cash on Delivery. Collect payment when goods are delivered. Zimazao will invoice 3% commission (K${commission.toFixed(2)}).\n\n`) +
    `Please confirm this order when you are ready.`;

  await db.insert(messagesTable).values({
    senderId: buyerId,
    receiverId: listing.farmerId,
    content: autoMsg,
    isRead: false,
    relatedOrderId: order.id,
  } as any);

  await recordTxEvent(order.id, "order_placed", { paymentMethod, price, commission, buyerId }, buyerId);
  req.log.info({ orderId: order.id, commission, buyerId, paymentMethod }, "Order created");
  res.status(201).json({ ...order, paymentMethod, farmerPayout: price - commission, farmerId: listing.farmerId });
}) as RequestHandler);

// Buyer confirms delivery → release escrow to farmer
router.post("/orders/:id/confirm-delivery", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);
  const buyerId = req.user!.userId;

  const [order] = await db
    .select({ id: ordersTable.id, buyerId: ordersTable.buyerId, totalPrice: ordersTable.totalPrice, commission: ordersTable.commission, farmerId: listingsTable.farmerId })
    .from(ordersTable).leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.buyerId !== buyerId) { res.status(403).json({ error: "Not your order" }); return; }

  const [raw] = await db.execute(sql`SELECT payment_method, escrow_status FROM orders WHERE id = ${orderId}`)
    .then((r: any) => r.rows ?? []).catch(() => []);

  if (!raw || raw.payment_method !== "online") { res.status(400).json({ error: "This is a Cash on Delivery order" }); return; }
  if (raw.escrow_status !== "held") { res.status(400).json({ error: `Escrow is already ${raw.escrow_status ?? "not active"}` }); return; }

  const price = parseFloat(String(order.totalPrice));
  const commission = parseFloat(String(order.commission));
  const farmerPayout = price - commission;

  // Credit farmer wallet
  if (order.farmerId) {
    const [farmer] = await db.select({ walletBalance: usersTable.walletBalance }).from(usersTable).where(eq(usersTable.id, order.farmerId));
    if (farmer) {
      await db.update(usersTable).set({ walletBalance: farmer.walletBalance + farmerPayout }).where(eq(usersTable.id, order.farmerId));
    }
    await db.insert(messagesTable).values({
      senderId: buyerId,
      receiverId: order.farmerId,
      content: `✅ Delivery Confirmed — Order #${orderId}\n\nThe buyer has confirmed receipt of the goods. K${farmerPayout.toFixed(2)} has been credited to your Zimazao wallet (after 3% commission).\n\nThank you for trading on Zimazao!`,
      isRead: false, relatedOrderId: orderId,
    } as any).catch(() => {});
  }

  await db.execute(sql`UPDATE orders SET escrow_status = 'released', status = 'delivered', delivery_confirmed_at = NOW() WHERE id = ${orderId}`).catch(() => {});
  await recordTxEvent(orderId, "delivery_confirmed", { farmerPayout, buyerId }, buyerId);

  res.json({ ok: true, message: "Delivery confirmed. Farmer has been paid.", farmerPayout });
}) as RequestHandler);

// Farmer marks a COD order as complete
router.post("/orders/:id/cod-complete", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);
  const farmerId = req.user!.userId;

  const [order] = await db
    .select({ id: ordersTable.id, buyerId: ordersTable.buyerId, totalPrice: ordersTable.totalPrice, commission: ordersTable.commission, farmerId: listingsTable.farmerId, cropName: listingsTable.cropName })
    .from(ordersTable).leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.farmerId !== farmerId) { res.status(403).json({ error: "Not your order" }); return; }

  const [raw] = await db.execute(sql`SELECT payment_method, status FROM orders WHERE id = ${orderId}`)
    .then((r: any) => r.rows ?? []).catch(() => []);

  if (!raw || raw.payment_method !== "cod") { res.status(400).json({ error: "Not a Cash on Delivery order" }); return; }
  if (raw.status === "delivered") { res.status(400).json({ error: "Order already marked complete" }); return; }

  const commission = parseFloat(String(order.commission));
  const total = parseFloat(String(order.totalPrice));

  await db.execute(sql`UPDATE orders SET status = 'delivered', escrow_status = 'cod_complete' WHERE id = ${orderId}`).catch(() => {});
  await recordTxEvent(orderId, "cod_completed", { commission, total, farmerId }, farmerId);

  // Send commission invoice message to farmer
  await db.insert(messagesTable).values({
    senderId: farmerId,
    receiverId: farmerId,
    content: `🧾 Commission Invoice — Order #${orderId} (COD)\n\nCrop: ${order.cropName}\nTotal collected: K${total.toFixed(2)}\nZimazao commission (3%): K${commission.toFixed(2)}\n\nPlease transfer K${commission.toFixed(2)} to Zimazao via mobile money or it will be deducted from your next online payout. Thank you!`,
    isRead: false, relatedOrderId: orderId,
  } as any).catch(() => {});

  if (order.buyerId) {
    await db.insert(messagesTable).values({
      senderId: farmerId, receiverId: order.buyerId,
      content: `✅ Order #${orderId} Complete (Cash on Delivery)\n\nThe farmer has marked your order as completed. Thank you for your purchase on Zimazao!`,
      isRead: false, relatedOrderId: orderId,
    } as any).catch(() => {});
  }

  res.json({ ok: true, message: "Order marked as complete. Commission invoice sent." });
}) as RequestHandler);

router.get("/orders/farmer-orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const farmerId = req.user!.userId;

  const result = await db.execute(sql`
    SELECT o.id, o.quantity, o.total_price, o.commission, o.status, o.created_at,
      o.listing_id, o.buyer_id, o.payment_method, o.escrow_status,
      l.crop_name, l.unit, l.location, l.image_url, l.farmer_id,
      u.name AS buyer_name
    FROM orders o
    LEFT JOIN listings l ON o.listing_id = l.id
    LEFT JOIN users u ON o.buyer_id = u.id
    WHERE l.farmer_id = ${farmerId}
    ORDER BY o.created_at DESC
  `);

  res.json(((result as any).rows ?? []).map((r: any) => ({
    ...mapOrderRow(r),
    buyerName: r.buyer_name,
  })));
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
