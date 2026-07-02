import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

export async function createNotification(
  userId: number,
  type: string,
  title: string,
  body: string,
  href: string = "/",
) {
  try {
    await db.execute(sql`
      INSERT INTO notifications (user_id, type, title, body, href, is_read, created_at)
      VALUES (${userId}, ${type}, ${title}, ${body}, ${href}, false, NOW())
    `);
  } catch {}
}

router.get("/notifications", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const result = await db.execute(sql`
    SELECT id, user_id, type, title, body, href, is_read, created_at
    FROM notifications
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `).catch(() => ({ rows: [] }));
  res.json((result as any).rows ?? []);
}) as RequestHandler);

router.get("/notifications/unread-count", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const result = await db.execute(sql`
    SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND is_read = false
  `).catch(() => ({ rows: [{ count: 0 }] }));
  const count = parseInt(String(((result as any).rows ?? [{ count: 0 }])[0]?.count ?? 0), 10);
  res.json({ count });
}) as RequestHandler);

router.patch("/notifications/mark-all-read", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  await db.execute(sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId}`).catch(() => {});
  res.json({ ok: true });
}) as RequestHandler);

router.patch("/notifications/:id/read", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const notifId = parseInt(String(req.params.id), 10);
  const userId = req.user!.userId;
  if (isNaN(notifId)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.execute(sql`UPDATE notifications SET is_read = true WHERE id = ${notifId} AND user_id = ${userId}`).catch(() => {});
  res.json({ ok: true });
}) as RequestHandler);

export default router;
