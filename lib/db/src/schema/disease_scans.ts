import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const diseaseScansTable = pgTable("disease_scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  imageUrl: text("image_url"),
  diseaseFound: text("disease_found"),
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  treatment: text("treatment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDiseaseScanSchema = createInsertSchema(diseaseScansTable).omit({ id: true, createdAt: true });
export type InsertDiseaseScan = z.infer<typeof insertDiseaseScanSchema>;
export type DiseaseScan = typeof diseaseScansTable.$inferSelect;
