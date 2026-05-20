import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable, subscriptionsTable, paymentsTable, diseaseScansTable, sponsoredProductsTable } from "@workspace/db";
import { eq, sum, count, gte, and, desc, sql, ne } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

function requireAdmin(req: AuthRequest, res: any, next: any): void {
  if (!(req.user as any)?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// ─── REVENUE DASHBOARD ────────────────────────────────────────────────────────

router.get("/admin/revenue", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalCommissionResult, monthlyCommissionResult, dailyCommissionResult,
    proSubscribersResult, transactionsResult, topFarmersResult,
    topCropsResult, weeklyRevenueResult, totalOrdersResult, totalPaymentsResult,
  ] = await Promise.all([
    db.select({ total: sum(ordersTable.commission) }).from(ordersTable),
    db.select({ total: sum(ordersTable.commission) }).from(ordersTable).where(gte(ordersTable.createdAt, startOfMonth)),
    db.select({ total: sum(ordersTable.commission) }).from(ordersTable).where(gte(ordersTable.createdAt, startOfDay)),
    db.select({ count: count() }).from(subscriptionsTable).where(and(eq(subscriptionsTable.plan, "pro"), eq(subscriptionsTable.status, "active"))),
    db.select({
      id: ordersTable.id, totalPrice: ordersTable.totalPrice, commission: ordersTable.commission,
      status: ordersTable.status, createdAt: ordersTable.createdAt,
      cropName: listingsTable.cropName, buyerName: usersTable.name,
    }).from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .leftJoin(usersTable, eq(ordersTable.buyerId, usersTable.id))
      .orderBy(desc(ordersTable.createdAt)).limit(20),
    db.select({
      farmerId: listingsTable.farmerId, farmerName: usersTable.name,
      totalRevenue: sum(ordersTable.totalPrice), totalOrders: count(ordersTable.id),
    }).from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
      .groupBy(listingsTable.farmerId, usersTable.name)
      .orderBy(desc(sum(ordersTable.totalPrice))).limit(5),
    db.select({
      cropName: listingsTable.cropName, totalOrders: count(ordersTable.id), totalRevenue: sum(ordersTable.totalPrice),
    }).from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .groupBy(listingsTable.cropName)
      .orderBy(desc(count(ordersTable.id))).limit(5),
    db.select({
      day: sql<string>`date_trunc('day', ${ordersTable.createdAt})`,
      revenue: sum(ordersTable.totalPrice), commission: sum(ordersTable.commission),
    }).from(ordersTable)
      .where(gte(ordersTable.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`date_trunc('day', ${ordersTable.createdAt})`)
      .orderBy(sql`date_trunc('day', ${ordersTable.createdAt})`).limit(30),
    db.select({ count: count() }).from(ordersTable),
    db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "successful")),
  ]);

  const proRevenue = (proSubscribersResult[0]?.count ?? 0) * 80;

  res.json({
    totalCommission: Number(totalCommissionResult[0]?.total ?? 0),
    monthlyCommission: Number(monthlyCommissionResult[0]?.total ?? 0),
    dailyCommission: Number(dailyCommissionResult[0]?.total ?? 0),
    proSubscribers: proSubscribersResult[0]?.count ?? 0,
    proRevenue,
    totalOrders: totalOrdersResult[0]?.count ?? 0,
    totalPayments: Number(totalPaymentsResult[0]?.total ?? 0),
    totalRevenueThisMonth: Number(monthlyCommissionResult[0]?.total ?? 0) + proRevenue,
    revenueToday: Number(dailyCommissionResult[0]?.total ?? 0),
    weeklyRevenue: weeklyRevenueResult.map((w) => ({
      day: w.day, revenue: Number(w.revenue ?? 0), commission: Number(w.commission ?? 0),
    })),
    recentTransactions: transactionsResult,
    topFarmers: topFarmersResult.map((f) => ({
      farmerId: f.farmerId, farmerName: f.farmerName,
      totalRevenue: Number(f.totalRevenue ?? 0), totalOrders: f.totalOrders,
    })),
    topCrops: topCropsResult.map((c) => ({
      cropName: c.cropName, totalOrders: c.totalOrders, totalRevenue: Number(c.totalRevenue ?? 0),
    })),
  });
});

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id, name: usersTable.name, email: usersTable.email,
    userType: usersTable.userType, isAdmin: usersTable.isAdmin,
    isBanned: usersTable.isBanned, bannedUntil: usersTable.bannedUntil,
    banReason: usersTable.banReason, createdAt: usersTable.createdAt,
    location: usersTable.location, phone: usersTable.phone,
  }).from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users);
});

router.post("/admin/users/:id/ban", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { reason } = req.body;
  const [user] = await db.update(usersTable)
    .set({ isBanned: true, bannedUntil: null, banReason: reason || "Banned by admin" })
    .where(eq(usersTable.id, id)).returning({ id: usersTable.id, name: usersTable.name, isBanned: usersTable.isBanned });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true, user });
});

router.post("/admin/users/:id/suspend", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { days, reason } = req.body;
  const until = new Date(Date.now() + (days || 7) * 24 * 60 * 60 * 1000);
  const [user] = await db.update(usersTable)
    .set({ isBanned: true, bannedUntil: until, banReason: reason || `Suspended for ${days || 7} days` })
    .where(eq(usersTable.id, id)).returning({ id: usersTable.id, name: usersTable.name, bannedUntil: usersTable.bannedUntil });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true, user });
});

router.post("/admin/users/:id/unban", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const [user] = await db.update(usersTable)
    .set({ isBanned: false, bannedUntil: null, banReason: null })
    .where(eq(usersTable.id, id)).returning({ id: usersTable.id, name: usersTable.name, isBanned: usersTable.isBanned });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true, user });
});

router.post("/admin/users/:id/upgrade-pro", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const userId = parseInt(req.params.id);
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.delete(subscriptionsTable).where(eq(subscriptionsTable.userId, userId));
  const [sub] = await db.insert(subscriptionsTable).values({
    userId, plan: "pro", status: "active", startDate: new Date(), endDate,
  }).returning();
  res.json({ success: true, subscription: sub });
});

router.delete("/admin/users/:id", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const adminId = (req.user as any)?.id;
  if (id === adminId) { res.status(400).json({ error: "Cannot delete your own account" }); return; }
  await db.delete(usersTable).where(and(eq(usersTable.id, id), ne(usersTable.isAdmin, true)));
  res.json({ success: true });
});

router.post("/admin/make-admin", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const [user] = await db.update(usersTable).set({ isAdmin: true }).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true, user: { id: user.id, name: user.name, isAdmin: user.isAdmin } });
});

// ─── LISTINGS MANAGEMENT ──────────────────────────────────────────────────────

router.get("/admin/all-listings", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const listings = await db.select({
    id: listingsTable.id, cropName: listingsTable.cropName, price: listingsTable.price,
    unit: listingsTable.unit, quantity: listingsTable.quantity, category: listingsTable.category,
    isActive: listingsTable.isActive, createdAt: listingsTable.createdAt,
    farmerName: usersTable.name, farmerId: listingsTable.farmerId,
    location: listingsTable.location,
  }).from(listingsTable)
    .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
    .orderBy(desc(listingsTable.createdAt));
  res.json(listings);
});

router.delete("/admin/listings/:id", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.update(listingsTable).set({ isActive: false }).where(eq(listingsTable.id, id));
  res.json({ success: true });
});

// ─── DISEASE SCAN STATS ────────────────────────────────────────────────────────

router.get("/admin/disease-stats", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const [totalScans, topDiseases, recentScans] = await Promise.all([
    db.select({ count: count() }).from(diseaseScansTable),
    db.select({ disease: diseaseScansTable.diseaseFound, total: count() })
      .from(diseaseScansTable)
      .where(sql`${diseaseScansTable.diseaseFound} IS NOT NULL`)
      .groupBy(diseaseScansTable.diseaseFound)
      .orderBy(desc(count())).limit(10),
    db.select({
      id: diseaseScansTable.id, diseaseFound: diseaseScansTable.diseaseFound,
      confidence: diseaseScansTable.confidence, createdAt: diseaseScansTable.createdAt,
      userName: usersTable.name,
    }).from(diseaseScansTable)
      .leftJoin(usersTable, eq(diseaseScansTable.userId, usersTable.id))
      .orderBy(desc(diseaseScansTable.createdAt)).limit(20),
  ]);
  res.json({
    totalScans: totalScans[0]?.count ?? 0,
    topDiseases: topDiseases.map(d => ({ disease: d.disease, count: d.total })),
    recentScans,
  });
});

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

router.get("/admin/announcements", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`SELECT * FROM announcements ORDER BY created_at DESC LIMIT 50`);
  res.json(rows.rows);
});

router.post("/admin/announcements", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { title, message, target } = req.body;
  if (!title || !message) { res.status(400).json({ error: "title and message required" }); return; }
  const [row] = await db.execute(sql`
    INSERT INTO announcements (title, message, target) VALUES (${title}, ${message}, ${target || "all"}) RETURNING *
  `).then(r => r.rows);
  res.json(row);
});

// ─── APP SETTINGS ─────────────────────────────────────────────────────────────

router.get("/admin/settings", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`SELECT * FROM app_settings`);
  const settings: Record<string, string> = {};
  for (const row of rows.rows as any[]) settings[row.key] = row.value;
  res.json(settings);
});

router.post("/admin/settings", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { key, value } = req.body;
  if (!key || value === undefined) { res.status(400).json({ error: "key and value required" }); return; }
  await db.execute(sql`
    INSERT INTO app_settings (key, value, updated_at) VALUES (${key}, ${String(value)}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${String(value)}, updated_at = NOW()
  `);
  res.json({ success: true, key, value });
});

// ─── SPONSOR MANAGEMENT ───────────────────────────────────────────────────────

router.get("/admin/sponsors", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const sponsors = await db.select().from(sponsoredProductsTable).orderBy(desc(sponsoredProductsTable.createdAt));
  res.json(sponsors);
});

router.post("/admin/sponsors", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { companyName, productName, productImage, description, price, targetDisease, contactNumber } = req.body;
  if (!companyName || !productName || !targetDisease) {
    res.status(400).json({ error: "companyName, productName, targetDisease required" }); return;
  }
  const [sponsor] = await db.insert(sponsoredProductsTable).values({
    companyName, productName, productImage, description, price, targetDisease, contactNumber, isActive: true,
  }).returning();
  res.json(sponsor);
});

router.put("/admin/sponsors/:id", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { companyName, productName, productImage, description, price, targetDisease, contactNumber, isActive } = req.body;
  const [sponsor] = await db.update(sponsoredProductsTable)
    .set({ companyName, productName, productImage, description, price, targetDisease, contactNumber, isActive })
    .where(eq(sponsoredProductsTable.id, id)).returning();
  if (!sponsor) { res.status(404).json({ error: "Sponsor not found" }); return; }
  res.json(sponsor);
});

router.delete("/admin/sponsors/:id", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  await db.delete(sponsoredProductsTable).where(eq(sponsoredProductsTable.id, id));
  res.json({ success: true });
});

export default router;
