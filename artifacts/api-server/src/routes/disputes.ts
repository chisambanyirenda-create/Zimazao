import { Router, type IRouter } from "express";
import { db, disputesTable, ordersTable, listingsTable, usersTable, transactionEventsTable, messagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

async function recordEvent(orderId: number, eventType: string, metadata: object, createdBy: number) {
  await db.insert(transactionEventsTable).values({
    orderId,
    eventType,
    metadata: JSON.stringify(metadata),
    createdBy,
  } as any).catch(() => {});
}

router.post("/disputes", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { orderId, reason, description } = req.body;
  if (!orderId || !reason || !description) {
    res.status(400).json({ error: "orderId, reason, and description are required" }); return;
  }

  const validReasons = ["wrong_product", "wrong_quantity", "damaged", "payment_issue", "other"];
  if (!validReasons.includes(reason)) {
    res.status(400).json({ error: `reason must be one of: ${validReasons.join(", ")}` }); return;
  }

  const userId = req.user!.userId;

  const [order] = await db
    .select({ id: ordersTable.id, buyerId: ordersTable.buyerId, farmerId: listingsTable.farmerId, status: ordersTable.status, escrowStatus: (ordersTable as any).escrowStatus })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, orderId));

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.buyerId !== userId && order.farmerId !== userId) {
    res.status(403).json({ error: "Not your order" }); return;
  }
  if (order.status === "cancelled") {
    res.status(400).json({ error: "Cannot raise dispute on cancelled order" }); return;
  }

  const existing = await db.select({ id: disputesTable.id }).from(disputesTable)
    .where(eq(disputesTable.orderId, orderId));
  if (existing.length > 0 && existing[0]) {
    res.status(409).json({ error: "A dispute already exists for this order" }); return;
  }

  const [dispute] = await db.insert(disputesTable).values({
    orderId,
    raisedBy: userId,
    reason,
    description,
    status: "open",
  } as any).returning();

  await db.execute(
    (await import("drizzle-orm")).sql`UPDATE orders SET escrow_status = 'frozen', status = 'disputed' WHERE id = ${orderId}`
  ).catch(() => {});

  await recordEvent(orderId, "dispute_raised", { reason, raisedBy: userId }, userId);

  const otherPartyId = order.buyerId === userId ? order.farmerId : order.buyerId;
  if (otherPartyId) {
    await db.insert(messagesTable).values({
      senderId: userId,
      receiverId: otherPartyId,
      content: `⚠️ A dispute has been raised on Order #${orderId}.\n\nReason: ${reason.replace(/_/g, " ")}\n\nDetails: ${description}\n\nThe transaction is frozen until the Zimazao team resolves it. You will be notified of the outcome.`,
      isRead: false,
      relatedOrderId: orderId,
    } as any).catch(() => {});
  }

  res.status(201).json(dispute);
}) as RequestHandler);

router.get("/disputes", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.user!.isAdmin) { res.status(403).json({ error: "Admin only" }); return; }

  const disputes = await db
    .select({
      id: disputesTable.id,
      orderId: disputesTable.orderId,
      reason: disputesTable.reason,
      description: disputesTable.description,
      status: disputesTable.status,
      resolutionAction: disputesTable.resolutionAction,
      resolutionNote: disputesTable.resolutionNote,
      resolvedAt: disputesTable.resolvedAt,
      createdAt: disputesTable.createdAt,
      raisedByName: usersTable.name,
    })
    .from(disputesTable)
    .leftJoin(usersTable, eq(disputesTable.raisedBy, usersTable.id))
    .orderBy(desc(disputesTable.createdAt));

  res.json(disputes);
}) as RequestHandler);

router.get("/disputes/my", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const disputes = await db.select().from(disputesTable)
    .where(eq(disputesTable.raisedBy, userId))
    .orderBy(desc(disputesTable.createdAt));
  res.json(disputes);
}) as RequestHandler);

router.patch("/disputes/:id/resolve", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.user!.isAdmin) { res.status(403).json({ error: "Admin only" }); return; }

  const disputeId = parseInt(req.params.id);
  const { resolutionAction, resolutionNote } = req.body;
  const validActions = ["refund", "release_to_farmer", "more_info"];
  if (!validActions.includes(resolutionAction)) {
    res.status(400).json({ error: `resolutionAction must be one of: ${validActions.join(", ")}` }); return;
  }

  const [dispute] = await db.select().from(disputesTable).where(eq(disputesTable.id, disputeId));
  if (!dispute) { res.status(404).json({ error: "Dispute not found" }); return; }
  if (dispute.status === "resolved") { res.status(400).json({ error: "Dispute already resolved" }); return; }

  if (resolutionAction === "more_info") {
    const [updated] = await db.update(disputesTable).set({ status: "under_review", resolutionNote }).where(eq(disputesTable.id, disputeId)).returning();
    res.json(updated); return;
  }

  const [order] = await db
    .select({ buyerId: ordersTable.buyerId, farmerId: listingsTable.farmerId, totalPrice: ordersTable.totalPrice, commission: ordersTable.commission })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .where(eq(ordersTable.id, dispute.orderId));

  if (order) {
    if (resolutionAction === "refund") {
      const amount = parseFloat(String(order.totalPrice));
      const [[buyer]] = await Promise.all([
        db.select({ walletBalance: usersTable.walletBalance }).from(usersTable).where(eq(usersTable.id, order.buyerId!))
      ]);
      if (buyer) {
        await db.update(usersTable).set({ walletBalance: buyer.walletBalance + amount }).where(eq(usersTable.id, order.buyerId!));
      }
      await db.execute(
        (await import("drizzle-orm")).sql`UPDATE orders SET escrow_status = 'refunded', status = 'cancelled' WHERE id = ${dispute.orderId}`
      ).catch(() => {});
      await recordEvent(dispute.orderId, "refunded", { resolutionNote, resolvedBy: req.user!.userId }, req.user!.userId);

      if (order.buyerId) {
        await db.insert(messagesTable).values({
          senderId: req.user!.userId, receiverId: order.buyerId,
          content: `✅ Your dispute on Order #${dispute.orderId} has been resolved.\n\nDecision: Full refund issued\nNote: ${resolutionNote || "No additional notes"}\n\nK${amount.toLocaleString()} has been credited back to your wallet.`,
          isRead: false, relatedOrderId: dispute.orderId,
        } as any).catch(() => {});
      }
    } else {
      const price = parseFloat(String(order.totalPrice));
      const commission = parseFloat(String(order.commission));
      const farmerPayout = price - commission;
      if (order.farmerId) {
        const [farmer] = await db.select({ walletBalance: usersTable.walletBalance }).from(usersTable).where(eq(usersTable.id, order.farmerId));
        if (farmer) {
          await db.update(usersTable).set({ walletBalance: farmer.walletBalance + farmerPayout }).where(eq(usersTable.id, order.farmerId));
        }
      }
      await db.execute(
        (await import("drizzle-orm")).sql`UPDATE orders SET escrow_status = 'released', status = 'delivered' WHERE id = ${dispute.orderId}`
      ).catch(() => {});
      await recordEvent(dispute.orderId, "escrow_released", { resolutionNote, resolvedBy: req.user!.userId, amount: farmerPayout }, req.user!.userId);

      if (order.farmerId) {
        await db.insert(messagesTable).values({
          senderId: req.user!.userId, receiverId: order.farmerId,
          content: `✅ The dispute on Order #${dispute.orderId} has been resolved in your favor.\n\nDecision: Payment released to you\nNote: ${resolutionNote || "No additional notes"}\n\nK${farmerPayout.toLocaleString()} has been credited to your wallet.`,
          isRead: false, relatedOrderId: dispute.orderId,
        } as any).catch(() => {});
      }
    }
  }

  const [updated] = await db.update(disputesTable).set({
    status: "resolved",
    resolutionAction,
    resolutionNote: resolutionNote || "",
    resolvedBy: req.user!.userId,
    resolvedAt: new Date(),
  } as any).where(eq(disputesTable.id, disputeId)).returning();

  res.json(updated);
}) as RequestHandler);

export default router;
