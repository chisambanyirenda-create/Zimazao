import { Router, type IRouter } from "express";
import { db, withdrawalsTable, usersTable, messagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import type { RequestHandler } from "express";

const router: IRouter = Router();

router.post("/withdrawals", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { amount, mobileMoneyNumber, network } = req.body;

  if (!amount || !mobileMoneyNumber) {
    res.status(400).json({ error: "amount and mobileMoneyNumber are required" }); return;
  }

  const withdrawAmount = parseFloat(amount);
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    res.status(400).json({ error: "Invalid amount" }); return;
  }

  const [farmer] = await db.select({ walletBalance: usersTable.walletBalance, userType: usersTable.userType })
    .from(usersTable).where(eq(usersTable.id, userId));

  if (!farmer) { res.status(404).json({ error: "User not found" }); return; }

  if (farmer.walletBalance < withdrawAmount) {
    res.status(402).json({ error: `Insufficient balance. Available: K${parseFloat(String(farmer.walletBalance)).toLocaleString()}` }); return;
  }

  const [request] = await db.insert(withdrawalsTable).values({
    farmerId: userId,
    amount: String(withdrawAmount),
    mobileMoneyNumber,
    network: network || "MTN",
    status: "pending",
  } as any).returning();

  res.status(201).json(request);
}) as RequestHandler);

router.get("/withdrawals", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.isAdmin;

  if (isAdmin) {
    const requests = await db
      .select({
        id: withdrawalsTable.id,
        amount: withdrawalsTable.amount,
        mobileMoneyNumber: withdrawalsTable.mobileMoneyNumber,
        network: withdrawalsTable.network,
        status: withdrawalsTable.status,
        adminNote: withdrawalsTable.adminNote,
        processedAt: withdrawalsTable.processedAt,
        createdAt: withdrawalsTable.createdAt,
        farmerName: usersTable.name,
        farmerId: withdrawalsTable.farmerId,
      })
      .from(withdrawalsTable)
      .leftJoin(usersTable, eq(withdrawalsTable.farmerId, usersTable.id))
      .orderBy(desc(withdrawalsTable.createdAt));
    res.json(requests); return;
  }

  const requests = await db.select().from(withdrawalsTable)
    .where(eq(withdrawalsTable.farmerId, userId))
    .orderBy(desc(withdrawalsTable.createdAt));
  res.json(requests);
}) as RequestHandler);

router.patch("/withdrawals/:id", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.user!.isAdmin) { res.status(403).json({ error: "Admin only" }); return; }

  const requestId = parseInt(req.params.id);
  const { status, adminNote } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be approved or rejected" }); return;
  }

  const [withdrawal] = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.id, requestId));
  if (!withdrawal) { res.status(404).json({ error: "Withdrawal request not found" }); return; }
  if (withdrawal.status !== "pending") { res.status(400).json({ error: "Already processed" }); return; }

  if (status === "approved") {
    const withdrawAmount = parseFloat(String(withdrawal.amount));
    const [farmer] = await db.select({ walletBalance: usersTable.walletBalance }).from(usersTable).where(eq(usersTable.id, withdrawal.farmerId));
    if (!farmer || farmer.walletBalance < withdrawAmount) {
      res.status(402).json({ error: "Farmer has insufficient balance" }); return;
    }
    await db.update(usersTable).set({ walletBalance: farmer.walletBalance - withdrawAmount }).where(eq(usersTable.id, withdrawal.farmerId));

    await db.insert(messagesTable).values({
      senderId: req.user!.userId,
      receiverId: withdrawal.farmerId,
      content: `✅ Withdrawal Approved!\n\nAmount: K${withdrawAmount.toLocaleString()}\nNetwork: ${withdrawal.network}\nMobile: ${withdrawal.mobileMoneyNumber}\n\nYour payment has been processed. It should arrive within 1–3 business hours.\n${adminNote ? `\nNote: ${adminNote}` : ""}`,
      isRead: false,
    } as any).catch(() => {});
  } else {
    await db.insert(messagesTable).values({
      senderId: req.user!.userId,
      receiverId: withdrawal.farmerId,
      content: `❌ Withdrawal Request Update\n\nAmount: K${parseFloat(String(withdrawal.amount)).toLocaleString()}\nStatus: Not approved at this time\n${adminNote ? `\nReason: ${adminNote}` : ""}\n\nPlease contact support if you have questions.`,
      isRead: false,
    } as any).catch(() => {});
  }

  const [updated] = await db.update(withdrawalsTable).set({
    status,
    adminNote: adminNote || null,
    approvedBy: req.user!.userId,
    processedAt: new Date(),
  } as any).where(eq(withdrawalsTable.id, requestId)).returning();

  res.json(updated);
}) as RequestHandler);

export default router;
