#!/usr/bin/env node
/**
 * Auto-push watcher: detects new local commits and pushes to GitHub.
 * Runs as a persistent background workflow.
 */
import { execSync, exec } from "child_process";
import { readFileSync, statSync } from "fs";
import { resolve } from "path";

const REPO_ROOT = new URL("../", import.meta.url).pathname;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REMOTE = `https://chisambanyirenda-create:${GITHUB_TOKEN}@github.com/chisambanyirenda-create/Zimazao.git`;
const POLL_MS = 10_000; // check every 10 seconds

if (!GITHUB_TOKEN) {
  console.error("[autopush] GITHUB_TOKEN not set — exiting.");
  process.exit(1);
}

function getLocalHead() {
  try {
    return execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function getRemoteHead() {
  try {
    const out = execSync(
      `git ls-remote "${REMOTE}" HEAD`,
      { cwd: REPO_ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    return out.split("\t")[0].trim();
  } catch {
    return null;
  }
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
    // First run — sync with remote baseline so we don't push on startup
    lastPushedHead = getRemoteHead() ?? local;
    console.log("[autopush] Watching for new commits. Baseline:", lastPushedHead?.slice(0, 8));
    return;
  }

  if (local !== lastPushedHead) {
    console.log(`[autopush] New commit detected: ${local.slice(0, 8)} (was ${lastPushedHead.slice(0, 8)})`);
    await push();
    lastPushedHead = local;
  }
}

console.log("[autopush] Starting — will push new commits to GitHub every ~10s.");
await tick();
setInterval(tick, POLL_MS);
