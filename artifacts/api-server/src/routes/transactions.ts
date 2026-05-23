import { Router, type IRouter } from "express";
import { db, ordersTable, listingsTable, usersTable, transactionEventsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

router.get("/transactions/admin", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.user!.isAdmin) { res.status(403).json({ error: "Admin only" }); return; }

  const rows = await db
    .select({
      orderId: ordersTable.id,
      status: ordersTable.status,
      quantity: ordersTable.quantity,
      totalPrice: ordersTable.totalPrice,
      commission: ordersTable.commission,
      createdAt: ordersTable.createdAt,
      cropName: listingsTable.cropName,
      unit: listingsTable.unit,
      location: listingsTable.location,
      buyerName: (usersTable as any).name,
      buyerId: ordersTable.buyerId,
    })
    .from(ordersTable)
    .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
    .leftJoin(usersTable, eq(ordersTable.buyerId, usersTable.id))
    .orderBy(desc(ordersTable.createdAt));

  const enriched = await Promise.all(rows.map(async (row) => {
    const paymentMethod = await db.execute(
      (await import("drizzle-orm")).sql`SELECT payment_method, escrow_status FROM orders WHERE id = ${row.orderId}`
    ).then((r: any) => ({ paymentMethod: r.rows?.[0]?.payment_method ?? "online", escrowStatus: r.rows?.[0]?.escrow_status ?? null })).catch(() => ({ paymentMethod: "online", escrowStatus: null }));

    const farmerRow = await db.execute(
      (await import("drizzle-orm")).sql`SELECT u.name FROM orders o LEFT JOIN listings l ON o.listing_id = l.id LEFT JOIN users u ON l.farmer_id = u.id WHERE o.id = ${row.orderId}`
    ).then((r: any) => r.rows?.[0]?.name ?? "").catch(() => "");

    return { ...row, ...paymentMethod, farmerName: farmerRow, farmerPayout: parseFloat(String(row.totalPrice)) - parseFloat(String(row.commission)) };
  }));

  const format = req.query.format;
  if (format === "csv") {
    const headers = ["Order ID", "Date", "Crop", "Buyer", "Farmer", "Quantity", "Total (ZMW)", "Commission (ZMW)", "Farmer Payout (ZMW)", "Payment Method", "Escrow Status", "Status"];
    const csv = [
      headers.join(","),
      ...enriched.map((r) => [
        r.orderId, new Date(r.createdAt).toLocaleDateString(), `"${r.cropName}"`, `"${r.buyerName}"`, `"${r.farmerName}"`,
        r.quantity, r.totalPrice, r.commission, r.farmerPayout.toFixed(2), r.paymentMethod, r.escrowStatus ?? "", r.status,
      ].join(",")),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="zimazao-transactions-${Date.now()}.csv"`);
    res.send(csv); return;
  }

  res.json(enriched);
}) as RequestHandler);

router.get("/transactions/events/:orderId", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.orderId);
  if (isNaN(orderId)) { res.status(400).json({ error: "Invalid orderId" }); return; }

  const userId = req.user!.userId;
  const isAdmin = req.user!.isAdmin;

  if (!isAdmin) {
    const [order] = await db
      .select({ buyerId: ordersTable.buyerId, farmerId: listingsTable.farmerId })
      .from(ordersTable)
      .leftJoin(listingsTable, eq(ordersTable.listingId, listingsTable.id))
      .where(eq(ordersTable.id, orderId));
    if (!order || (order.buyerId !== userId && order.farmerId !== userId)) {
      res.status(403).json({ error: "Not your order" }); return;
    }
  }

  const events = await db.select().from(transactionEventsTable)
    .where(eq(transactionEventsTable.orderId, orderId))
    .orderBy(transactionEventsTable.createdAt);

  res.json(events);
}) as RequestHandler);

export default router;
