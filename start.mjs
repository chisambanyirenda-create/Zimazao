/**
 * One-command local start for Zimazao.
 *
 *   node start.mjs
 *
 * Installs dependencies, prepares a .env on first run, starts the API server
 * and the web app, and opens the browser. Stop everything with Ctrl+C.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const API_PORT = 8080;
const WEB_PORT = 5173;

function log(msg) { console.log(`\x1b[32m[zimazao]\x1b[0m ${msg}`); }
function fail(msg) { console.error(`\x1b[31m[zimazao]\x1b[0m ${msg}`); process.exit(1); }

// ── 1. Node version ──────────────────────────────────────────────────────────
const major = Number(process.versions.node.split(".")[0]);
if (major < 20) fail(`Node.js 20 or newer is required (you have ${process.versions.node}). Download it from https://nodejs.org`);

// ── 2. Make sure pnpm exists ─────────────────────────────────────────────────
function has(cmd) {
  return spawnSync(cmd, ["--version"], { shell: true, stdio: "ignore" }).status === 0;
}
if (!has("pnpm")) {
  log("Installing the pnpm package manager (one-time)...");
  let r = spawnSync("corepack", ["enable"], { shell: true, stdio: "inherit" });
  if (r.status !== 0 || !has("pnpm")) {
    r = spawnSync("npm", ["install", "-g", "pnpm"], { shell: true, stdio: "inherit" });
    if (r.status !== 0) fail("Could not install pnpm automatically. Run: npm install -g pnpm");
  }
}

// ── 3. Prepare .env ──────────────────────────────────────────────────────────
const envPath = path.join(root, ".env");
if (!existsSync(envPath)) {
  copyFileSync(path.join(root, ".env.example"), envPath);
  log("Created .env from .env.example");
}
let envText = readFileSync(envPath, "utf-8");
if (/^JWT_SECRET=\s*$/m.test(envText)) {
  envText = envText.replace(/^JWT_SECRET=\s*$/m, `JWT_SECRET=${randomBytes(32).toString("hex")}`);
  writeFileSync(envPath, envText);
  log("Generated a JWT_SECRET in .env");
}
const env = { ...process.env };
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && m[2]) env[m[1]] = m[2];
}
if (!env.DATABASE_URL) {
  log("");
  log("NOTE: DATABASE_URL is empty in .env — the app will start, but with no");
  log("database connected most screens will be empty. Paste your Supabase");
  log("connection string into the .env file to connect your real data.");
  log("");
  env.DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder";
}

// ── 4. Install dependencies ──────────────────────────────────────────────────
log("Installing dependencies (first run can take a few minutes)...");
const install = spawnSync("pnpm", ["install"], { cwd: root, shell: true, stdio: "inherit" });
if (install.status !== 0) fail("pnpm install failed — see the error above.");

// ── 5. Start API + web app ───────────────────────────────────────────────────
log(`Starting API server on port ${API_PORT}...`);
const api = spawn("pnpm", ["--filter", "@workspace/api-server", "run", "dev"], {
  cwd: root, shell: true, stdio: "inherit",
  env: { ...env, API_PORT: String(API_PORT), NODE_ENV: "development" },
});

log(`Starting web app on port ${WEB_PORT}...`);
const web = spawn("pnpm", ["--filter", "@workspace/zimazao", "run", "dev"], {
  cwd: root, shell: true, stdio: "inherit",
  env: { ...env, PORT: String(WEB_PORT), BASE_PATH: "/", API_PROXY_TARGET: `http://localhost:${API_PORT}` },
});

const url = `http://localhost:${WEB_PORT}`;
setTimeout(() => {
  log("");
  log(`✅ Zimazao is running — open ${url} in your browser`);
  log("   (press Ctrl+C in this window to stop)");
  const opener = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  spawn(opener, [url], { shell: true, stdio: "ignore" }).on("error", () => {});
}, 6000);

function shutdown() {
  api.kill();
  web.kill();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
