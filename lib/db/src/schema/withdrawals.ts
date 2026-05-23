import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const withdrawalsTable = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  mobileMoneyNumber: text("mobile_money_number").notNull(),
  network: text("network").notNull().default("MTN"),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  approvedBy: integer("approved_by").references(() => usersTable.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Withdrawal = typeof withdrawalsTable.$inferSelect;
