#!/usr/bin/env node
/**
 * Auto-push watcher: detects new local commits and pushes to GitHub.
 * Runs as a persistent background workflow.
 *
 * Required env vars:
 *   GITHUB_TOKEN   — personal access token with repo write access
 *   GITHUB_REPO    — full repo path, e.g. "username/RepoName"
 *   GITHUB_USER    — GitHub username (used in the authenticated remote URL)
 */
import { exec } from "child_process";
import { execSync } from "child_process";

const REPO_ROOT = new URL("../", import.meta.url).pathname;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO  ?? "chisambanyirenda-create/Zimazao";
const GITHUB_USER  = process.env.GITHUB_USER  ?? "chisambanyirenda-create";
const POLL_MS      = 10_000;

if (!GITHUB_TOKEN) {
  console.error("[autopush] GITHUB_TOKEN not set — exiting.");
  process.exit(1);
}

const REMOTE = `https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git`;

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: "utf8", ...opts }).trim();
}

function getLocalHead() {
  try { return run("git rev-parse HEAD"); } catch { return null; }
}

function getRemoteHead() {
  try {
    const out = run(`git ls-remote "${REMOTE}" HEAD`, { stdio: ["pipe", "pipe", "pipe"] });
    return out.split("\t")[0].trim();
  } catch { return null; }
}

function push() {
  return new Promise((resolve) => {
    exec(
      `git push "${REMOTE}" HEAD:main --quiet`,
      { cwd: REPO_ROOT },
      (err, _stdout, stderr) => {
        if (err) {
          const safeErr = (stderr || err.message).replace(GITHUB_TOKEN, "***");
          console.error("[autopush] Push failed:", safeErr);
        } else {
          console.log("[autopush] Pushed to GitHub at", new Date().toISOString());
        }
        resolve();
      }
    );
  });
}

let lastPushedHead = null;

async function tick() {
  const local = getLocalHead();
  if (!local) return;

  if (lastPushedHead === null) {
    lastPushedHead = getRemoteHead() ?? local;
    console.log("[autopush] Watching for new commits. Baseline:", lastPushedHead?.slice(0, 8));
    return;
  }

  if (local !== lastPushedHead) {
    console.log(`[autopush] New commit: ${local.slice(0, 8)} (was ${lastPushedHead.slice(0, 8)})`);
    await push();
    lastPushedHead = local;
  }
}

console.log("[autopush] Starting — will push new commits to GitHub every ~10s.");
await tick();
setInterval(tick, POLL_MS);
