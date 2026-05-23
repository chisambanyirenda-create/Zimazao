import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";
import { usersTable } from "./users";

export const transactionEventsTable = pgTable("transaction_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  eventType: text("event_type").notNull(),
  metadata: text("metadata"),
  createdBy: integer("created_by").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TransactionEvent = typeof transactionEventsTable.$inferSelect;
