#!/bin/bash
# Start all Zimazao services: API server, frontend, and GitHub auto-push
set -e

echo "[start] Launching API server..."
pnpm --filter @workspace/api-server run dev &
API_PID=$!

echo "[start] Launching frontend..."
pnpm --filter @workspace/zimazao run dev &
FRONTEND_PID=$!

echo "[start] Launching GitHub auto-push watcher..."
node scripts/git-autopush.mjs &
AUTOPUSH_PID=$!

# Trap signals to stop all children cleanly
trap "kill $API_PID $FRONTEND_PID $AUTOPUSH_PID 2>/dev/null; exit" SIGINT SIGTERM

echo "[start] All services started."
wait
