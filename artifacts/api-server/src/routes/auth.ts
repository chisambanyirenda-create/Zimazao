import { Router, type IRouter } from "express";
import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { logger } from "../lib/logger";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, location, userType } = req.body;

  if (!name || !email || !password || !userType) {
    res.status(400).json({ error: "name, email, password, and userType are required" });
    return;
  }
  if (!["farmer", "buyer"].includes(userType)) {
    res.status(400).json({ error: "userType must be farmer or buyer" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    phone: phone || null,
    location: location || null,
    userType,
    isAdmin: false,
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, userType: user.userType, isAdmin: user.isAdmin });
  req.log.info({ userId: user.id }, "New user registered");

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      userType: user.userType,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, userType: user.userType, isAdmin: user.isAdmin });
  req.log.info({ userId: user.id }, "User logged in");

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      userType: user.userType,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    },
  });
});

router.put("/users/profile", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { name, phone, location, oldPassword, newPassword } = req.body;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (name !== undefined) {
    if (!name.trim()) { res.status(400).json({ error: "Name cannot be empty" }); return; }
    updates.name = name.trim();
  }
  if (phone !== undefined) updates.phone = phone || null;
  if (location !== undefined) updates.location = location || null;

  if (newPassword) {
    if (!oldPassword) { res.status(400).json({ error: "Old password is required to change password" }); return; }
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();

  res.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    location: updated.location,
    userType: updated.userType,
    isAdmin: updated.isAdmin,
    createdAt: updated.createdAt,
  });
}) as RequestHandler);

export default router;
