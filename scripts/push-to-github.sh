#!/bin/bash
# Auto-push to GitHub using GITHUB_TOKEN
# Usage: bash scripts/push-to-github.sh "commit message"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN environment variable is not set"
  exit 1
fi

MSG="${1:-Auto-sync: $(date '+%Y-%m-%d %H:%M')}"

REPO_URL="https://chisambanyirenda-create:${GITHUB_TOKEN}@github.com/chisambanyirenda-create/Zimazao.git"

git add -A
git commit -m "$MSG" --allow-empty
git push "$REPO_URL" HEAD:main

echo "Pushed to GitHub: $MSG"
