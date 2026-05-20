import { pgTable, serial, text, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sponsoredProductsTable = pgTable("sponsored_products", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }),
  targetDisease: text("target_disease").notNull(),
  contactNumber: text("contact_number"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSponsoredProductSchema = createInsertSchema(sponsoredProductsTable).omit({ id: true, createdAt: true });
export type InsertSponsoredProduct = z.infer<typeof insertSponsoredProductSchema>;
export type SponsoredProduct = typeof sponsoredProductsTable.$inferSelect;
