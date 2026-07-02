import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

// Ensure reports table exists
async function ensureReportsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      reporter_id INTEGER NOT NULL,
      reporter_name TEXT,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      target_name TEXT,
      reason TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `).catch(() => {});
}

ensureReportsTable();

// POST /reports — submit a report (any authenticated user)
router.post("/reports", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { targetType, targetId, targetName, reason, description } = req.body;

  if (!targetType || !targetId || !reason) {
    res.status(400).json({ error: "targetType, targetId, and reason are required" }); return;
  }

  const validTypes = ["listing", "user"];
  if (!validTypes.includes(targetType)) {
    res.status(400).json({ error: "targetType must be listing or user" }); return;
  }

  const validReasons = [
    "scam", "fake_listing", "offensive_content", "wrong_price",
    "counterfeit", "fraud", "spam", "other"
  ];
  if (!validReasons.includes(reason)) {
    res.status(400).json({ error: `reason must be one of: ${validReasons.join(", ")}` }); return;
  }

  const reporterId = req.user!.userId;

  await db.execute(sql`
    INSERT INTO reports (reporter_id, reporter_name, target_type, target_id, target_name, reason, description, status, created_at)
    VALUES (
      ${reporterId},
      (SELECT name FROM users WHERE id = ${reporterId}),
      ${targetType},
      ${targetId},
      ${targetName ?? null},
      ${reason},
      ${description ?? null},
      'pending',
      NOW()
    )
  `);

  req.log?.info({ reporterId, targetType, targetId, reason }, "Report submitted");
  res.status(201).json({ ok: true, message: "Report submitted. Our team will review it shortly." });
}) as RequestHandler);

// GET /admin/reports — CEO/admin only: view all reports
router.get("/admin/reports", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.user!.isAdmin) {
    res.status(403).json({ error: "Admin access required" }); return;
  }

  const result = await db.execute(sql`
    SELECT id, reporter_id, reporter_name, target_type, target_id, target_name,
           reason, description, status, created_at
    FROM reports
    ORDER BY created_at DESC
    LIMIT 500
  `).catch(() => ({ rows: [] }));

  res.json((result as any).rows ?? []);
}) as RequestHandler);

// PATCH /admin/reports/:id — mark report as reviewed/dismissed
router.patch("/admin/reports/:id", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.user!.isAdmin) {
    res.status(403).json({ error: "Admin access required" }); return;
  }

  const id = parseInt(String(req.params.id), 10);
  const { status } = req.body;

  const validStatuses = ["pending", "reviewed", "dismissed", "actioned"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` }); return;
  }

  await db.execute(sql`UPDATE reports SET status = ${status} WHERE id = ${id}`);
  res.json({ ok: true });
}) as RequestHandler);

export default router;
