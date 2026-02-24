#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script (assumes repo is already on the server)
# Usage: ./scripts/deploy_backend.sh

ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT/backend"

echo "Pulling latest changes..."
git pull origin main || true

echo "Installing dependencies..."
npm ci

echo "Reloading PM2 process..."
if command -v pm2 >/dev/null 2>&1; then
  pm2 startOrReload ecosystem.config.js --env production
  pm2 save || true
  echo "PM2 reloaded"
else
  echo "pm2 not found — start manually: pm2 start ecosystem.config.js --env production"
fi

echo "Deployment script finished."
