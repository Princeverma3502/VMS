#!/usr/bin/env bash
set -euo pipefail

# Deploy the frontend to Vercel using the Vercel CLI.
# Requires: `vercel` CLI installed and `VERCEL_TOKEN` in environment.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [ -z "${VERCEL_TOKEN-}" ]; then
  echo "Error: VERCEL_TOKEN is not set. Create a token in Vercel and export VERCEL_TOKEN."
  exit 1
fi

echo "Installing frontend dependencies..."
cd "$FRONTEND_DIR"
npm ci

echo "Building frontend..."
npm run build

echo "Deploying to Vercel (production)..."
vercel --prod --confirm --token "$VERCEL_TOKEN" --cwd "$FRONTEND_DIR"

echo "Done. Visit your Vercel dashboard to view the deployment."
