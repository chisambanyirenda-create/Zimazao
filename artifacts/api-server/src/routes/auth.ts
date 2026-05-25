import { Router, type IRouter } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

// ── Input sanitization ───────────────────────────────────────────────────────
function sanitizeString(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").replace(/['"`;\\]/g, "").trim().slice(0, 1000);
}

// ── Password strength ────────────────────────────────────────────────────────
function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

// ── Login rate limiter (in-memory, per IP) ───────────────────────────────────
interface AttemptRecord { count: number; lockedUntil: number }
const loginAttempts = new Map<string, AttemptRecord>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (record.lockedUntil > now) {
      const remaining = Math.ceil((record.lockedUntil - now) / 60000);
      res.status(429).json({
        error: `Too many failed login attempts. Try again in ${remaining} minute${remaining !== 1 ? "s" : ""}.`,
      });
      return;
    }
    if (record.lockedUntil <= now && record.count >= MAX_ATTEMPTS) {
      // Lockout expired — reset
      loginAttempts.delete(ip);
    }
  }
  next();
}

function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const record = loginAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
  loginAttempts.set(ip, record);
}

function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ── Avatar upload (jpg/png/webp only) ────────────────────────────────────────
const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, and WebP images are allowed"));
  },
});

const router: IRouter = Router();

const WELCOME_BALANCE = 20_000;

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    profilePicture: user.profilePicture ?? null,
    userType: user.userType,
    walletBalance: user.walletBalance,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}

// ── Register ─────────────────────────────────────────────────────────────────
router.post("/auth/register", async (req, res): Promise<void> => {
  const name = sanitizeString(req.body.name);
  const email = sanitizeString(req.body.email).toLowerCase();
  const password: string = req.body.password ?? "";
  const phone = sanitizeString(req.body.phone);
  const location = sanitizeString(req.body.location);
  const userType: string = req.body.userType ?? "";

  if (!name || !email || !password || !userType) {
    res.status(400).json({ error: "name, email, password, and userType are required" });
    return;
  }
  if (!["farmer", "buyer"].includes(userType)) {
    res.status(400).json({ error: "userType must be farmer or buyer" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  const pwError = validatePassword(password);
  if (pwError) {
    res.status(400).json({ error: pwError });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    password: hashed,
    phone: phone || null,
    location: location || null,
    userType: userType as "farmer" | "buyer",
    walletBalance: WELCOME_BALANCE,
    isAdmin: false,
  }).returning();

  const token = signToken({ userId: user.id, email: user.email, userType: user.userType, isAdmin: user.isAdmin });
  req.log.info({ userId: user.id }, "New user registered");

  res.status(201).json({ token, user: formatUser(user) });
});

// ── Login (with rate limiting) ────────────────────────────────────────────────
router.post("/auth/login", loginRateLimiter as RequestHandler, async (req: Request, res: Response): Promise<void> => {
  const ip = getClientIp(req);
  const email = sanitizeString(req.body.email).toLowerCase();
  const password: string = req.body.password ?? "";

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    recordFailedLogin(ip);
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    recordFailedLogin(ip);
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  clearLoginAttempts(ip);
  const token = signToken({ userId: user.id, email: user.email, userType: user.userType, isAdmin: user.isAdmin });
  req.log.info({ userId: user.id }, "User logged in");

  res.json({ token, user: formatUser(user) });
});

// ── Update profile ────────────────────────────────────────────────────────────
router.put("/users/profile", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const name = sanitizeString(req.body.name);
  const phone = sanitizeString(req.body.phone);
  const location = sanitizeString(req.body.location);
  const oldPassword: string = req.body.oldPassword ?? "";
  const newPassword: string = req.body.newPassword ?? "";

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};

  if (req.body.name !== undefined) {
    if (!name) { res.status(400).json({ error: "Name cannot be empty" }); return; }
    updates.name = name;
  }
  if (req.body.phone !== undefined) updates.phone = phone || null;
  if (req.body.location !== undefined) updates.location = location || null;

  if (newPassword) {
    if (!oldPassword) { res.status(400).json({ error: "Old password is required to change password" }); return; }
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
    const pwError = validatePassword(newPassword);
    if (pwError) { res.status(400).json({ error: pwError }); return; }
    updates.password = await bcrypt.hash(newPassword, 12);
  }

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
  res.json(formatUser(updated));
}) as RequestHandler);

// ── Switch farmer/buyer mode ───────────────────────────────────────────────────
router.patch("/auth/switch-mode", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { targetMode } = req.body;

  if (!["farmer", "buyer"].includes(targetMode)) {
    res.status(400).json({ error: "targetMode must be farmer or buyer" }); return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ userType: targetMode })
    .where(eq(usersTable.id, userId))
    .returning();

  const token = signToken({ userId: updated.id, email: updated.email, userType: updated.userType, isAdmin: updated.isAdmin });
  req.log.info({ userId, targetMode }, "User switched mode");

  res.json({ token, user: formatUser(updated) });
}) as RequestHandler);

// ── Upload avatar (jpg/png/webp only) ─────────────────────────────────────────
router.post("/users/avatar", requireAuth as RequestHandler, avatarUpload.single("avatar") as RequestHandler, (async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: "No image provided" }); return; }
  if (!ALLOWED_MIME.includes(req.file.mimetype)) {
    res.status(400).json({ error: "Only JPG, PNG, and WebP images are allowed" }); return;
  }
  const userId = req.user!.userId;
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const [updated] = await db.update(usersTable).set({ profilePicture: dataUrl }).where(eq(usersTable.id, userId)).returning();
  res.json(formatUser(updated));
}) as RequestHandler);

export default router;
