import { Router, type IRouter } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/subscription", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.userId;

  const [sub] = await db
    .select()
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")))
    .orderBy(subscriptionsTable.createdAt)
    .limit(1);

  if (!sub || sub.plan === "free") {
    res.json({ plan: "free", status: "active", limits: { listings: 3, diseaseScans: 5 } });
    return;
  }

  const now = new Date();
  if (sub.endDate && sub.endDate < now) {
    await db.update(subscriptionsTable).set({ status: "expired" }).where(eq(subscriptionsTable.id, sub.id));
    res.json({ plan: "free", status: "expired", limits: { listings: 3, diseaseScans: 5 } });
    return;
  }

  res.json({
    plan: sub.plan,
    status: sub.status,
    startDate: sub.startDate,
    endDate: sub.endDate,
    limits: { listings: null, diseaseScans: null },
  });
});

router.post("/subscription/upgrade", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.userId;
  const { plan, paymentReference } = req.body;

  if (!plan || plan !== "pro") {
    res.status(400).json({ error: "Only 'pro' plan is supported" });
    return;
  }

  if (!paymentReference) {
    res.status(400).json({ error: "paymentReference is required" });
    return;
  }

  await db
    .update(subscriptionsTable)
    .set({ status: "cancelled" })
    .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")));

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const [sub] = await db.insert(subscriptionsTable).values({
    userId,
    plan: "pro",
    startDate: new Date(),
    endDate,
    status: "active",
  }).returning();

  req.log.info({ userId, plan: "pro" }, "Subscription upgraded to Pro");
  res.status(201).json(sub);
});

export default router;
