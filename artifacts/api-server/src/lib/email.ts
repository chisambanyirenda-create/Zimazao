/**
 * Minimal transactional email via Resend (free tier). No SDK needed — just fetch.
 * If RESEND_API_KEY is not set, emails are logged and skipped (dev-safe).
 */
import { logger } from "./logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Zimazao <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!RESEND_API_KEY) {
    logger.warn({ to: opts.to, subject: opts.subject }, "Email skipped — RESEND_API_KEY not configured");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) {
      logger.error({ status: res.status, body: await res.text().catch(() => "") }, "Resend email failed");
      return false;
    }
    return true;
  } catch (err) {
    logger.error({ err }, "Resend email error");
    return false;
  }
}

export function resetEmailHtml(name: string, link: string): string {
  return `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a1f14;color:#e6fff0;border-radius:16px">
    <h1 style="color:#4ade80;font-size:22px;margin:0 0 8px">Reset your Zimazao password</h1>
    <p style="color:#b8d8c4;line-height:1.6">Hi ${name || "there"}, we received a request to reset your password. Tap the button below — this link expires in 1 hour.</p>
    <a href="${link}" style="display:inline-block;margin:16px 0;background:linear-gradient(135deg,#22c55e,#16a34a);color:#04140d;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px">Reset Password</a>
    <p style="color:#6b8578;font-size:13px;line-height:1.6">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
    <p style="color:#6b8578;font-size:12px">Zimazao — Zambia's farm marketplace</p>
  </div>`;
}
