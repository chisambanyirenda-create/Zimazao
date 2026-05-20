import { Router, type IRouter } from "express";
import { db, listingsTable, ordersTable, messagesTable, usersTable } from "@workspace/db";
import { eq, and, count, sum } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.user!.userId;

  const [listingsResult, ordersResult, messagesResult, recentListings] = await Promise.all([
    db.select({ count: count() })
      .from(listingsTable)
      .where(and(eq(listingsTable.farmerId, userId), eq(listingsTable.isActive, true))),

    db.select({ count: count(), total: sum(ordersTable.totalPrice) })
      .from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .where(eq(listingsTable.farmerId, userId)),

    db.select({ count: count() })
      .from(messagesTable)
      .where(eq(messagesTable.receiverId, userId)),

    db.select({
        id: listingsTable.id,
        farmerId: listingsTable.farmerId,
        farmerName: usersTable.name,
        cropName: listingsTable.cropName,
        price: listingsTable.price,
        unit: listingsTable.unit,
        quantity: listingsTable.quantity,
        location: listingsTable.location,
        category: listingsTable.category,
        description: listingsTable.description,
        imageUrl: listingsTable.imageUrl,
        isActive: listingsTable.isActive,
        createdAt: listingsTable.createdAt,
      })
      .from(listingsTable)
      .leftJoin(usersTable, eq(listingsTable.farmerId, usersTable.id))
      .where(eq(listingsTable.farmerId, userId))
      .limit(5),
  ]);

  res.json({
    totalSales: Number(ordersResult[0]?.total ?? 0),
    activeListings: listingsResult[0]?.count ?? 0,
    totalOrders: ordersResult[0]?.count ?? 0,
    messages: messagesResult[0]?.count ?? 0,
    recentListings,
  });
});

export default router;
