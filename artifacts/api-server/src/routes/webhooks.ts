import { Router, type IRouter } from "express";
import { db, paymentsTable, subscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

const router: IRouter = Router();

const FLW_SECRET_HASH = process.env.FLUTTERWAVE_SECRET_HASH || "";

router.post("/webhooks/flutterwave", async (req, res): Promise<void> => {
  const signature = req.headers["verif-hash"];

  if (FLW_SECRET_HASH && signature !== FLW_SECRET_HASH) {
    logger.warn({ signature }, "Flutterwave webhook: invalid signature");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = req.body;
  logger.info({ event: event?.event, txRef: event?.data?.tx_ref }, "Flutterwave webhook received");

  if (event?.event === "charge.completed" && event?.data?.status === "successful") {
    const txRef = event.data.tx_ref as string;

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.reference, txRef));

    if (!payment) {
      logger.warn({ txRef }, "Webhook: payment reference not found");
      res.json({ received: true });
      return;
    }

    if (payment.status !== "successful") {
      await db
        .update(paymentsTable)
        .set({ status: "successful" })
        .where(eq(paymentsTable.reference, txRef));
    }

    if (payment.purpose === "subscription" && payment.status !== "successful") {
      await db
        .update(subscriptionsTable)
        .set({ status: "cancelled" })
        .where(and(
          eq(subscriptionsTable.userId, payment.userId),
          eq(subscriptionsTable.status, "active")
        ));

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await db.insert(subscriptionsTable).values({
        userId: payment.userId,
        plan: "pro",
        startDate: new Date(),
        endDate,
        status: "active",
      });

      logger.info({ userId: payment.userId, txRef }, "Pro subscription activated via webhook");
    }
  }

  res.json({ received: true });
});

export default router;
