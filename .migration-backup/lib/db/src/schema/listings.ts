import { pgTable, text, serial, timestamp, integer, boolean, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const categoryEnum = pgEnum("category", [
  "cereals", "legumes", "tubers", "oilseeds", "vegetables", "fruits", "other"
]);

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull().references(() => usersTable.id),
  cropName: text("crop_name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  quantity: text("quantity").notNull(),
  location: text("location").notNull(),
  category: categoryEnum("category").notNull().default("other"),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
