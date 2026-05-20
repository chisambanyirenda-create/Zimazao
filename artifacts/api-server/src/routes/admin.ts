import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable, subscriptionsTable, paymentsTable } from "@workspace/db";
import { eq, sum, count, gte, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

function requireAdmin(req: AuthRequest, res: any, next: any): void {
  if (!(req.user as any)?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.get("/admin/revenue", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCommissionResult,
    monthlyCommissionResult,
    proSubscribersResult,
    transactionsResult,
    topFarmersResult,
    topCropsResult,
    weeklyRevenueResult,
    totalOrdersResult,
    totalPaymentsResult,
  ] = await Promise.all([
    db.select({ total: sum(ordersTable.commission) }).from(ordersTable),

    db.select({ total: sum(ordersTable.commission) })
      .from(ordersTable)
      .where(gte(ordersTable.createdAt, startOfMonth)),

    db.select({ count: count() })
      .from(subscriptionsTable)
      .where(and(eq(subscriptionsTable.plan, "pro"), eq(subscriptionsTable.status, "active"))),

    db.select({
      id: ordersTable.id,
      totalPrice: ordersTable.totalPrice,
      commission: ordersTable.commission,
      status: ordersTable.status,
      createdAt: ordersTable.createdAt,
      cropName: listingsTable.cropName,
      buyerName: usersTable.name,
    })
      .from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .leftJoin(usersTable, eq(ordersTable.buyerId, usersTable.id))
      .orderBy(desc(ordersTable.createdAt))
      .limit(50),

    db.select({
      farmerId: listingsTable.farmerId,
      farmerName: usersTable.name,
      totalRevenue: sum(ordersTable.totalPrice),
      totalOrders: count(ordersTable.id),
    })
      .from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
      .groupBy(listingsTable.farmerId, usersTable.name)
      .orderBy(desc(sum(ordersTable.totalPrice)))
      .limit(10),

    db.select({
      cropName: listingsTable.cropName,
      totalOrders: count(ordersTable.id),
      totalRevenue: sum(ordersTable.totalPrice),
    })
      .from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .groupBy(listingsTable.cropName)
      .orderBy(desc(count(ordersTable.id)))
      .limit(10),

    db.select({
      week: sql<string>`date_trunc('week', ${ordersTable.createdAt})`,
      revenue: sum(ordersTable.totalPrice),
      commission: sum(ordersTable.commission),
    })
      .from(ordersTable)
      .groupBy(sql`date_trunc('week', ${ordersTable.createdAt})`)
      .orderBy(sql`date_trunc('week', ${ordersTable.createdAt})`)
      .limit(12),

    db.select({ count: count() }).from(ordersTable),

    db.select({ total: sum(paymentsTable.amount) })
      .from(paymentsTable)
      .where(eq(paymentsTable.status, "successful")),
  ]);

  const proRevenue = (proSubscribersResult[0]?.count ?? 0) * 80;

  res.json({
    totalCommission: Number(totalCommissionResult[0]?.total ?? 0),
    monthlyCommission: Number(monthlyCommissionResult[0]?.total ?? 0),
    proSubscribers: proSubscribersResult[0]?.count ?? 0,
    proRevenue,
    totalOrders: totalOrdersResult[0]?.count ?? 0,
    totalPayments: Number(totalPaymentsResult[0]?.total ?? 0),
    totalRevenueThisMonth: Number(monthlyCommissionResult[0]?.total ?? 0) + proRevenue,
    weeklyRevenue: weeklyRevenueResult.map((w) => ({
      week: w.week,
      revenue: Number(w.revenue ?? 0),
      commission: Number(w.commission ?? 0),
    })),
    recentTransactions: transactionsResult,
    topFarmers: topFarmersResult.map((f) => ({
      farmerId: f.farmerId,
      farmerName: f.farmerName,
      totalRevenue: Number(f.totalRevenue ?? 0),
      totalOrders: f.totalOrders,
    })),
    topCrops: topCropsResult.map((c) => ({
      cropName: c.cropName,
      totalOrders: c.totalOrders,
      totalRevenue: Number(c.totalRevenue ?? 0),
    })),
  });
});

router.get("/admin/users", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    userType: usersTable.userType,
    isAdmin: usersTable.isAdmin,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(users);
});

router.post("/admin/make-admin", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { userId } = req.body;
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const [user] = await db.update(usersTable).set({ isAdmin: true }).where(eq(usersTable.id, userId)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ success: true, user: { id: user.id, name: user.name, isAdmin: user.isAdmin } });
});

export default router;
