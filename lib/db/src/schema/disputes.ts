import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const disputesTable = pgTable("disputes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  raisedBy: integer("raised_by").notNull().references(() => usersTable.id),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  photoUrls: text("photo_urls"),
  status: text("status").notNull().default("open"),
  resolutionAction: text("resolution_action"),
  resolutionNote: text("resolution_note"),
  resolvedBy: integer("resolved_by").references(() => usersTable.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Dispute = typeof disputesTable.$inferSelect;
