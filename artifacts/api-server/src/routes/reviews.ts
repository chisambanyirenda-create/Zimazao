import { Router, type IRouter } from "express";
import { db, ordersTable, reviewsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

router.get("/reviews/farmer/:farmerId", (async (req, res) => {
  const farmerId = parseInt(req.params.farmerId);
  if (isNaN(farmerId)) { res.status(400).json({ error: "Invalid farmer id" }); return; }

  const reviews = await db
    .select({
      id: reviewsTable.id,
      orderId: reviewsTable.orderId,
      buyerId: reviewsTable.buyerId,
      farmerId: reviewsTable.farmerId,
      rating: reviewsTable.rating,
      comment: reviewsTable.comment,
      createdAt: reviewsTable.createdAt,
      buyerName: usersTable.name,
    })
    .from(reviewsTable)
    .leftJoin(usersTable, eq(reviewsTable.buyerId, usersTable.id))
    .where(eq(reviewsTable.farmerId, farmerId))
    .orderBy(desc(reviewsTable.createdAt));

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  res.json({ reviews, averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length });
}) as RequestHandler);

router.post("/reviews", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const { orderId, farmerId, rating, comment } = req.body;
  if (!orderId || !farmerId || !rating) {
    res.status(400).json({ error: "orderId, farmerId, and rating are required" }); return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be between 1 and 5" }); return;
  }

  const buyerId = req.user!.userId;

  const [order] = await db.select().from(ordersTable).where(
    and(eq(ordersTable.id, orderId), eq(ordersTable.buyerId, buyerId))
  );
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  if (order.status !== "delivered") { res.status(400).json({ error: "Can only review delivered orders" }); return; }

  const existing = await db.select({ id: reviewsTable.id })
    .from(reviewsTable)
    .where(and(eq(reviewsTable.orderId, orderId), eq(reviewsTable.buyerId, buyerId)));

  if (existing.length > 0) {
    res.status(409).json({ error: "You already reviewed this order" }); return;
  }

  const [review] = await db.insert(reviewsTable).values({
    orderId,
    buyerId,
    farmerId,
    rating,
    comment: comment || null,
  }).returning();

  res.status(201).json(review);
}) as RequestHandler);

export default router;
