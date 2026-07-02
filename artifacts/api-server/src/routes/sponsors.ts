import { Router, type IRouter } from "express";
import { db, sponsoredProductsTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

function requireAdmin(req: AuthRequest, res: any, next: any): void {
  if (!(req.user as any)?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

router.get("/admin/sponsors", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const sponsors = await db.select().from(sponsoredProductsTable);
  res.json(sponsors);
});

router.post("/admin/sponsors", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const { companyName, productName, productImage, description, price, targetDisease, contactNumber } = req.body;
  if (!companyName || !productName || !targetDisease) {
    res.status(400).json({ error: "companyName, productName, and targetDisease are required" });
    return;
  }

  const [product] = await db.insert(sponsoredProductsTable).values({
    companyName,
    productName,
    productImage: productImage || null,
    description: description || null,
    price: price ? String(price) : null,
    targetDisease,
    contactNumber: contactNumber || null,
    isActive: true,
  }).returning();

  res.status(201).json(product);
});

router.put("/admin/sponsors/:id", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  const { isActive, companyName, productName, productImage, description, price, targetDisease, contactNumber } = req.body;

  const [product] = await db.update(sponsoredProductsTable)
    .set({
      ...(isActive !== undefined && { isActive }),
      ...(companyName && { companyName }),
      ...(productName && { productName }),
      ...(productImage !== undefined && { productImage }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: price ? String(price) : null }),
      ...(targetDisease && { targetDisease }),
      ...(contactNumber !== undefined && { contactNumber }),
    })
    .where(eq(sponsoredProductsTable.id, id))
    .returning();

  if (!product) { res.status(404).json({ error: "Sponsor not found" }); return; }
  res.json(product);
});

router.delete("/admin/sponsors/:id", requireAuth, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  await db.delete(sponsoredProductsTable).where(eq(sponsoredProductsTable.id, id));
  res.json({ success: true });
});

export default router;
