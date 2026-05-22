import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable, ordersTable, listingsTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

// GET /messages/unread-count — real-time badge count + latest for toast
router.get("/messages/unread-count", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const senderAlias = alias(usersTable, "sender");

  const rows = await db
    .select({
      id: messagesTable.id,
      senderId: messagesTable.senderId,
      senderName: senderAlias.name,
      content: messagesTable.content,
      relatedOrderId: messagesTable.relatedOrderId,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .leftJoin(senderAlias, eq(messagesTable.senderId, senderAlias.id))
    .where(and(eq(messagesTable.receiverId, userId), eq(messagesTable.isRead, false)))
    .orderBy(desc(messagesTable.createdAt))
    .limit(20);

  res.json({ count: rows.length, latest: rows[0] ?? null });
}) as RequestHandler);

// POST /messages/mark-read/:senderId — mark thread as read
router.post("/messages/mark-read/:senderId", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const senderId = parseInt(req.params.senderId, 10);
  if (isNaN(senderId)) { res.status(400).json({ error: "Invalid senderId" }); return; }

  await db
    .update(messagesTable)
    .set({ isRead: true })
    .where(and(
      eq(messagesTable.senderId, senderId),
      eq(messagesTable.receiverId, userId),
      eq(messagesTable.isRead, false),
    ));

  res.json({ ok: true });
}) as RequestHandler);

// GET /messages — conversation threads list
router.get("/messages", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const senderAlias = alias(usersTable, "sender");
  const receiverAlias = alias(usersTable, "receiver");

  const msgs = await db
    .select({
      id: messagesTable.id,
      senderId: messagesTable.senderId,
      senderName: senderAlias.name,
      receiverId: messagesTable.receiverId,
      receiverName: receiverAlias.name,
      content: messagesTable.content,
      isRead: messagesTable.isRead,
      relatedOrderId: messagesTable.relatedOrderId,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .leftJoin(senderAlias, eq(messagesTable.senderId, senderAlias.id))
    .leftJoin(receiverAlias, eq(messagesTable.receiverId, receiverAlias.id))
    .where(or(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, userId)))
    .orderBy(desc(messagesTable.createdAt));

  const threadMap = new Map<number, any>();
  const unreadMap = new Map<number, number>();

  for (const m of msgs) {
    const otherId = m.senderId === userId ? m.receiverId : m.senderId;
    if (!threadMap.has(otherId)) {
      threadMap.set(otherId, { ...m, unread: m.receiverId === userId && !m.isRead });
    }
    if (m.receiverId === userId && !m.isRead) {
      unreadMap.set(otherId, (unreadMap.get(otherId) ?? 0) + 1);
    }
  }

  const result = Array.from(threadMap.values()).map((t) => {
    const otherId = t.senderId === userId ? t.receiverId : t.senderId;
    return { ...t, unreadCount: unreadMap.get(otherId) ?? 0 };
  });

  res.json(result);
}) as RequestHandler);

// GET /messages/:userId — full thread with order context
router.get("/messages/:userId", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const meId = req.user!.userId;
  const otherId = parseInt(req.params.userId, 10);
  if (isNaN(otherId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const senderAlias = alias(usersTable, "sender");

  const msgs = await db
    .select({
      id: messagesTable.id,
      senderId: messagesTable.senderId,
      senderName: senderAlias.name,
      receiverId: messagesTable.receiverId,
      content: messagesTable.content,
      isRead: messagesTable.isRead,
      relatedOrderId: messagesTable.relatedOrderId,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .leftJoin(senderAlias, eq(messagesTable.senderId, senderAlias.id))
    .where(
      or(
        and(eq(messagesTable.senderId, meId), eq(messagesTable.receiverId, otherId)),
        and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, meId)),
      )
    )
    .orderBy(messagesTable.createdAt);

  // Find the most recent order connected to this thread
  const orderMsg = [...msgs].reverse().find((m) => m.relatedOrderId);
  let orderDetail: any = null;

  if (orderMsg?.relatedOrderId) {
    const rows = await db
      .select({
        id: ordersTable.id,
        quantity: ordersTable.quantity,
        totalPrice: ordersTable.totalPrice,
        commission: ordersTable.commission,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        cropName: listingsTable.cropName,
        unit: listingsTable.unit,
        imageUrl: listingsTable.imageUrl,
        location: listingsTable.location,
        farmerId: listingsTable.farmerId,
        buyerId: ordersTable.buyerId,
      })
      .from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .where(eq(ordersTable.id, orderMsg.relatedOrderId))
      .limit(1);

    orderDetail = rows[0] ?? null;
  }

  res.json({ messages: msgs, relatedOrderId: orderMsg?.relatedOrderId ?? null, orderDetail });
}) as RequestHandler);

// POST /messages — send a message
router.post("/messages", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { receiverId, content, relatedOrderId } = req.body;
  if (!receiverId || !content?.trim()) {
    res.status(400).json({ error: "receiverId and content are required" }); return;
  }

  const insertData: any = {
    senderId: req.user!.userId,
    receiverId: parseInt(String(receiverId), 10),
    content: content.trim(),
    isRead: false,
  };
  if (relatedOrderId) insertData.relatedOrderId = parseInt(String(relatedOrderId), 10);

  const [msg] = await db.insert(messagesTable).values(insertData).returning();
  res.status(201).json(msg);
}) as RequestHandler);

export default router;
