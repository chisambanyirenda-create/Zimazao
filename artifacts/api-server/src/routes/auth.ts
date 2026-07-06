import { Router, type IRouter } from "express";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import crypto from "node:crypto";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { sendEmail, resetEmailHtml, verifyEmailHtml } from "../lib/email";

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
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

const APP_BASE = (req: Request) =>
  (process.env.APP_URL || `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers.host}`).replace(/\/$/, "");

/** Create a fresh email-verification token and send the verification email. */
async function sendVerification(userId: number, name: string, email: string, req: Request) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await db.execute(sql`DELETE FROM email_verifications WHERE user_id = ${userId}`);
  await db.execute(sql`INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (${userId}, ${tokenHash}, ${expires})`);
  const link = `${APP_BASE(req)}/verify-email?token=${token}`;
  await sendEmail({ to: email, subject: "Verify your Zimazao email", html: verifyEmailHtml(name, link) });
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

  // Fire-and-forget verification email (never blocks signup).
  sendVerification(user.id, user.name, user.email, req).catch((e) => req.log.warn({ err: e }, "verify email send failed"));

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

// ── Forgot password — email a reset link ─────────────────────────────────────
router.post("/auth/forgot-password", async (req: Request, res: Response): Promise<void> => {
  const email = sanitizeString(req.body.email).toLowerCase();
  if (!email) { res.status(400).json({ error: "email is required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  // Always respond the same way — never reveal whether an email is registered.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await db.execute(sql`DELETE FROM password_resets WHERE user_id = ${user.id}`);
    await db.execute(sql`INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (${user.id}, ${tokenHash}, ${expires})`);

    const base = (process.env.APP_URL || `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers.host}`).replace(/\/$/, "");
    const link = `${base}/reset-password?token=${token}`;
    await sendEmail({ to: user.email, subject: "Reset your Zimazao password", html: resetEmailHtml(user.name, link) });
    req.log.info({ userId: user.id }, "Password reset requested");
  }
  res.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
});

// ── Reset password — consume the token, set a new password ────────────────────
router.post("/auth/reset-password", async (req: Request, res: Response): Promise<void> => {
  const token: string = typeof req.body.token === "string" ? req.body.token : "";
  const password: string = req.body.password ?? "";
  if (!token || !password) { res.status(400).json({ error: "token and password are required" }); return; }

  const pwError = validatePassword(password);
  if (pwError) { res.status(400).json({ error: pwError }); return; }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const result: any = await db.execute(sql`SELECT user_id FROM password_resets WHERE token_hash = ${tokenHash} AND expires_at > NOW() LIMIT 1`);
  const row = (result.rows ?? result)[0];
  if (!row) { res.status(400).json({ error: "This reset link is invalid or has expired." }); return; }

  const userId = row.user_id as number;
  const hashed = await bcrypt.hash(password, 12);
  await db.update(usersTable).set({ password: hashed }).where(eq(usersTable.id, userId));
  await db.execute(sql`DELETE FROM password_resets WHERE user_id = ${userId}`);
  req.log.info({ userId }, "Password reset completed");

  res.json({ ok: true, message: "Password updated. You can now sign in." });
});

// ── Verify email — consume the token ──────────────────────────────────────────
router.post("/auth/verify-email", async (req: Request, res: Response): Promise<void> => {
  const token: string = typeof req.body.token === "string" ? req.body.token : "";
  if (!token) { res.status(400).json({ error: "token is required" }); return; }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const result: any = await db.execute(sql`SELECT user_id FROM email_verifications WHERE token_hash = ${tokenHash} AND expires_at > NOW() LIMIT 1`);
  const row = (result.rows ?? result)[0];
  if (!row) { res.status(400).json({ error: "This verification link is invalid or has expired." }); return; }

  const userId = row.user_id as number;
  await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.id, userId));
  await db.execute(sql`DELETE FROM email_verifications WHERE user_id = ${userId}`);
  req.log.info({ userId }, "Email verified");

  res.json({ ok: true, message: "Your email is verified. Thank you!" });
});

// ── Resend verification email ─────────────────────────────────────────────────
router.post("/auth/resend-verification", requireAuth as RequestHandler, (async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.emailVerified) { res.json({ ok: true, message: "Email already verified." }); return; }
  await sendVerification(user.id, user.name, user.email, req);
  res.json({ ok: true, message: "Verification email sent." });
}) as RequestHandler);

export default router;
