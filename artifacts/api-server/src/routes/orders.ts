import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable, messagesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";
import { createNotification } from "./notifications";
import crypto from "crypto";

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
    estimatedDelivery: r.estimated_delivery ?? null,
    trackingToken: r.tracking_token ?? null,
  };
}

const ALLOWED_FARMER_STATUSES = ["confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

const STATUS_EMOJI: Record<string, string> = {
  confirmed: "✅",
  packed: "📦",
  shipped: "🚚",
  out_for_delivery: "🛵",
  delivered: "📬",
  cancelled: "❌",
};

const STATUS_MSG: Record<string, string> = {
  confirmed: "Your order has been confirmed by the farmer and is being prepared.",
  packed: "Your order has been packed and is ready for dispatch.",
  shipped: "Your order is on the way! The farmer has dispatched your goods.",
  out_for_delivery: "Your order is out for delivery and will arrive soon.",
  delivered: "Your order has been marked as delivered. Thank you for using Zimazao!",
  cancelled: "Your order has been cancelled by the farmer. Please contact them for details.",
};

async function recordTxEvent(orderId: number, eventType: string, metadata: object, createdBy?: number) {
  try {
    await db.execute(sql`
      INSERT INTO transaction_events (order_id, event_type, metadata, created_by)
      VALUES (${orderId}, ${eventType}, ${JSON.stringify(metadata)}, ${createdBy ?? null})
    `);
  } catch {}
}

router.get("/orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const buyerId = req.user!.userId;

  await db.execute(sql`
    UPDATE orders SET escrow_status = 'released'
    WHERE buyer_id = ${buyerId} AND escrow_status = 'held'
    AND auto_release_at IS NOT NULL AND auto_release_at < NOW()
  `).catch(() => {});

  const result = await db.execute(sql`
    SELECT o.id, o.quantity, o.total_price, o.commission, o.status, o.created_at,
      o.listing_id, o.buyer_id, o.payment_method, o.escrow_status,
      o.estimated_delivery, o.tracking_token,
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

  if (paymentMethod === "online") {
    const charge = Math.round(price);
    // Atomic conditional debit — guards against both string-concat bugs on
    // NUMERIC columns and double-spend races from concurrent orders.
    const debit: any = await db.execute(sql`
      UPDATE users SET wallet_balance = wallet_balance - ${charge}
      WHERE id = ${buyerId} AND wallet_balance >= ${charge}
    `);
    if ((debit.rowCount ?? 0) === 0) {
      res.status(402).json({
        error: `Insufficient wallet balance. You have K${Number(buyer?.walletBalance ?? 0).toLocaleString()}, need K${charge.toLocaleString()}.`,
      }); return;
    }
  }

  const autoReleaseAt = paymentMethod === "online" ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null;
  const trackingToken = crypto.randomBytes(16).toString("hex");

  const [order] = await db.insert(ordersTable).values({
    buyerId,
    listingId,
    quantity: String(quantity),
    totalPrice: String(price),
    commission: String(commission),
    status: "pending",
  }).returning();

  await db.execute(sql`
    UPDATE orders SET
      payment_method = ${paymentMethod},
      escrow_status = ${paymentMethod === "online" ? "held" : null},
      auto_release_at = ${autoReleaseAt},
      tracking_token = ${trackingToken}
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

  // Notify farmer
  await createNotification(
    listing.farmerId,
    "new_order",
    `New Order #${order.id}`,
    `${buyer?.name ?? "A buyer"} placed an order for ${listing.cropName} — K${Math.round(price).toLocaleString()}`,
    "/orders",
  );

  await recordTxEvent(order.id, "order_placed", { paymentMethod, price, commission, buyerId }, buyerId);
  res.status(201).json({ ...order, paymentMethod, farmerPayout: price - commission, farmerId: listing.farmerId, trackingToken });
}) as RequestHandler);

router.post("/orders/:id/confirm-delivery", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(String(req.params.id));
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

  if (order.farmerId) {
    await db.execute(sql`
      UPDATE users SET wallet_balance = wallet_balance + ${farmerPayout}
      WHERE id = ${order.farmerId}
    `);
    await db.insert(messagesTable).values({
      senderId: buyerId,
      receiverId: order.farmerId,
      content: `✅ Delivery Confirmed — Order #${orderId}\n\nThe buyer has confirmed receipt of the goods. K${farmerPayout.toFixed(2)} has been credited to your Zimazao wallet (after 3% commission).\n\nThank you for trading on Zimazao!`,
      isRead: false, relatedOrderId: orderId,
    } as any).catch(() => {});

    await createNotification(order.farmerId, "order_delivered", `Order #${orderId} — Payment Released`, `K${farmerPayout.toFixed(2)} has been credited to your wallet.`, "/dashboard");
  }

  await db.execute(sql`UPDATE orders SET escrow_status = 'released', status = 'delivered', delivery_confirmed_at = NOW() WHERE id = ${orderId}`).catch(() => {});
  await recordTxEvent(orderId, "delivery_confirmed", { farmerPayout, buyerId }, buyerId);

  res.json({ ok: true, message: "Delivery confirmed. Farmer has been paid.", farmerPayout });
}) as RequestHandler);

router.post("/orders/:id/cod-complete", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(String(req.params.id));
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
    await createNotification(order.buyerId, "order_delivered", `Order #${orderId} Completed`, `Your order for ${order.cropName} has been completed.`, "/orders");
  }

  res.json({ ok: true, message: "Order marked as complete. Commission invoice sent." });
}) as RequestHandler);

router.get("/orders/farmer-orders", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const farmerId = req.user!.userId;

  const result = await db.execute(sql`
    SELECT o.id, o.quantity, o.total_price, o.commission, o.status, o.created_at,
      o.listing_id, o.buyer_id, o.payment_method, o.escrow_status,
      o.estimated_delivery, o.tracking_token,
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
  const orderId = parseInt(String(req.params.id));
  const { status, estimatedDelivery } = req.body;
  const farmerId = req.user!.userId;

  if (!ALLOWED_FARMER_STATUSES.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${ALLOWED_FARMER_STATUSES.join(", ")}` }); return;
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

  if (estimatedDelivery) {
    await db.execute(sql`UPDATE orders SET estimated_delivery = ${estimatedDelivery} WHERE id = ${orderId}`).catch(() => {});
  }

  if (order.buyerId) {
    const emoji = STATUS_EMOJI[status] ?? "📋";
    const msgBody = STATUS_MSG[status] ?? `Order status updated to ${status}.`;
    await db.insert(messagesTable).values({
      senderId: farmerId,
      receiverId: order.buyerId,
      content: `${emoji} Order #${orderId} Update: ${status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}\n\n${msgBody}`,
      isRead: false,
      relatedOrderId: orderId,
    } as any).catch(() => {});

    await createNotification(
      order.buyerId,
      `order_${status}`,
      `Order #${orderId} — ${status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}`,
      msgBody,
      `/orders`,
    );
  }

  res.json(updated);
}) as RequestHandler);

// Public tracking by token (no auth required)
router.get("/orders/track/:token", (async (req, res) => {
  const { token } = req.params;
  if (!token) { res.status(400).json({ error: "Token required" }); return; }

  const result = await db.execute(sql`
    SELECT o.id, o.status, o.quantity, o.total_price, o.created_at,
      o.estimated_delivery, o.tracking_token,
      l.crop_name, l.unit, l.location, l.farmer_id,
      u.name AS farmer_name
    FROM orders o
    LEFT JOIN listings l ON o.listing_id = l.id
    LEFT JOIN users u ON l.farmer_id = u.id
    WHERE o.tracking_token = ${token}
    LIMIT 1
  `).catch(() => ({ rows: [] }));

  const rows = (result as any).rows ?? [];
  if (!rows[0]) { res.status(404).json({ error: "Order not found" }); return; }

  const r = rows[0];
  res.json({
    id: r.id,
    status: r.status,
    quantity: r.quantity,
    totalPrice: r.total_price,
    createdAt: r.created_at,
    estimatedDelivery: r.estimated_delivery,
    cropName: r.crop_name,
    unit: r.unit,
    location: r.location,
    farmerName: r.farmer_name,
  });
}) as RequestHandler);

// ─── Live Location Store ───────────────────────────
interface LocationEntry { lat: number; lng: number; updatedAt: number }
interface OrderLocations { farmer?: LocationEntry; buyer?: LocationEntry }
const locationStore = new Map<number, OrderLocations>();

router.patch("/orders/:id/location", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(String(req.params.id));
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
  const orderId = parseInt(String(req.params.id));
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
