import { Router, type IRouter } from "express";
import { db, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

async function flwRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${FLW_BASE_URL}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

router.post("/payments/initiate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { amount, method, phone, purpose } = req.body;
  if (!amount || !method || !phone) {
    res.status(400).json({ error: "amount, method, and phone are required" });
    return;
  }

  const validMethods = ["mtn_mobile_money", "airtel_money"];
  if (!validMethods.includes(method)) {
    res.status(400).json({ error: "method must be mtn_mobile_money or airtel_money" });
    return;
  }

  const reference = `ZMZ-${Date.now()}-${req.user!.userId}`;

  const [payment] = await db.insert(paymentsTable).values({
    userId: req.user!.userId,
    amount: String(amount),
    currency: "ZMW",
    method,
    status: "pending",
    reference,
    purpose: purpose || "subscription",
  }).returning();

  if (!FLW_SECRET_KEY) {
    res.json({
      status: "pending",
      reference,
      paymentId: payment.id,
      message: "Payment initiated (test mode — no real API key configured)",
      testMode: true,
    });
    return;
  }

  const networkMap: Record<string, string> = {
    mtn_mobile_money: "MTN",
    airtel_money: "AIRTEL",
  };

  const flwPayload = {
    tx_ref: reference,
    amount,
    currency: "ZMW",
    payment_type: "mobilemoneyghana",
    phone_number: phone,
    network: networkMap[method],
    meta: { userId: req.user!.userId, purpose: purpose || "subscription" },
  };

  try {
    const flwRes = await flwRequest("/charges?type=mobile_money_zambia", "POST", flwPayload);
    if (flwRes.status === "success" || flwRes.status === "pending") {
      res.json({
        status: "pending",
        reference,
        paymentId: payment.id,
        flutterwaveData: flwRes.data,
        message: "Mobile money prompt sent to your phone",
      });
    } else {
      await db.update(paymentsTable).set({ status: "failed" }).where(eq(paymentsTable.id, payment.id));
      res.status(400).json({ error: flwRes.message || "Payment initiation failed" });
    }
  } catch (err) {
    await db.update(paymentsTable).set({ status: "failed" }).where(eq(paymentsTable.id, payment.id));
    res.status(500).json({ error: "Payment service unavailable" });
  }
});

router.post("/payments/verify", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { reference } = req.body;
  if (!reference) {
    res.status(400).json({ error: "reference is required" });
    return;
  }

  const [payment] = await db.select().from(paymentsTable).where(eq(paymentsTable.reference, reference));
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  if (payment.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (!FLW_SECRET_KEY) {
    await db.update(paymentsTable).set({ status: "successful" }).where(eq(paymentsTable.reference, reference));
    res.json({ status: "successful", reference, amount: payment.amount, currency: payment.currency, testMode: true });
    return;
  }

  try {
    const flwRes = await flwRequest(`/transactions/verify_by_reference?tx_ref=${reference}`, "GET");
    if (flwRes.status === "success" && flwRes.data?.status === "successful") {
      await db.update(paymentsTable).set({ status: "successful" }).where(eq(paymentsTable.reference, reference));
      res.json({ status: "successful", reference, amount: payment.amount, currency: payment.currency });
    } else {
      res.json({ status: "pending", reference });
    }
  } catch {
    res.status(500).json({ error: "Verification service unavailable" });
  }
});

router.get("/payments/history", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, req.user!.userId));
  res.json(payments);
});

export default router;
