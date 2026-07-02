import { Router, type IRouter } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/farmers/:id", async (req, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [farmer] = await db
    .select({ id: usersTable.id, name: usersTable.name, location: usersTable.location, phone: usersTable.phone, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(and(eq(usersTable.id, id), eq(usersTable.userType, "farmer")));

  if (!farmer) { res.status(404).json({ error: "Farmer not found" }); return; }

  const listings = await db
    .select({ id: listingsTable.id, cropName: listingsTable.cropName, price: listingsTable.price, unit: listingsTable.unit, quantity: listingsTable.quantity, location: listingsTable.location, category: listingsTable.category, description: listingsTable.description, imageUrl: listingsTable.imageUrl, createdAt: listingsTable.createdAt })
    .from(listingsTable)
    .where(and(eq(listingsTable.farmerId, id), eq(listingsTable.isActive, true)));

  res.json({ ...farmer, listings, totalListings: listings.length });
});

export default router;
