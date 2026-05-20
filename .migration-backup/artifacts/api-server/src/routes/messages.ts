import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq, or, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

router.get("/messages", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  const msgs = await db
    .select({
      id: messagesTable.id,
      senderId: messagesTable.senderId,
      senderName: usersTable.name,
      receiverId: messagesTable.receiverId,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .leftJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
    .where(or(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, userId)))
    .orderBy(desc(messagesTable.createdAt));

  const threadMap = new Map<number, typeof msgs[0] & { unread: boolean }>();
  for (const m of msgs) {
    const otherId = m.senderId === userId ? m.receiverId : m.senderId;
    if (!threadMap.has(otherId)) {
      threadMap.set(otherId, { ...m, unread: m.receiverId === userId });
    }
  }

  res.json(Array.from(threadMap.values()));
}) as RequestHandler);

router.get("/messages/:userId", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const meId = req.user!.userId;
  const otherId = parseInt(req.params.userId, 10);
  if (isNaN(otherId)) { res.status(400).json({ error: "Invalid userId" }); return; }

  const msgs = await db
    .select({
      id: messagesTable.id,
      senderId: messagesTable.senderId,
      senderName: usersTable.name,
      receiverId: messagesTable.receiverId,
      content: messagesTable.content,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .leftJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
    .where(
      or(
        and(eq(messagesTable.senderId, meId), eq(messagesTable.receiverId, otherId)),
        and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, meId)),
      )
    )
    .orderBy(messagesTable.createdAt);

  res.json(msgs);
}) as RequestHandler);

router.post("/messages", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content?.trim()) {
    res.status(400).json({ error: "receiverId and content are required" }); return;
  }

  const [msg] = await db.insert(messagesTable).values({
    senderId: req.user!.userId,
    receiverId: parseInt(receiverId, 10),
    content: content.trim(),
  }).returning();

  res.status(201).json(msg);
}) as RequestHandler);

export default router;
