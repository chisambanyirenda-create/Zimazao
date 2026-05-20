import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { listingId, quantity, totalPrice } = req.body;
  if (!listingId || !quantity || !totalPrice) {
    res.status(400).json({ error: "listingId, quantity, and totalPrice are required" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing || !listing.isActive) {
    res.status(404).json({ error: "Listing not found or inactive" });
    return;
  }

  const [order] = await db.insert(ordersTable).values({
    buyerId: req.user!.userId,
    listingId,
    quantity: String(quantity),
    totalPrice: String(totalPrice),
    status: "pending",
  }).returning();

  req.log.info({ orderId: order.id }, "Order created");
  res.status(201).json(order);
});

export default router;
