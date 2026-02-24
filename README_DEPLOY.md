# Deployment Guide — Vercel (frontend) & Render (backend)

This document provides quick, repeatable steps to deploy the `frontend` to Vercel and the `backend` to Render. It also includes helper scripts for a one-command deploy where possible.

Frontend — Vercel (recommended)

1. Create a Vercel account and connect your GitHub/GitLab/Bitbucket repository.
2. Add a new project and set the project root to `frontend`.
3. Set the following build settings in Vercel:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add required environment variables (client-side variables must be prefixed with `VITE_`):
   - `VITE_API_BASE_URL` — e.g. `https://api.yourdomain.com`
   - `VITE_SOME_OTHER_KEY` — any other client secretless values
5. Option A — Deploy via Vercel UI: click Deploy.
   Option B — Deploy via Vercel CLI (headless):

```bash
# from repo root
cd frontend
npm ci
npm run build
# requires VERCEL_TOKEN environment variable
vercel --prod --confirm --token "$VERCEL_TOKEN"
```

Backend — Render (recommended)

Option 1 — Deploy via `render.yaml` (recommended):
1. Connect your repository to Render and enable `auto-deploy` on the `main` branch.
2. Render will detect `render.yaml` and create services. Ensure `backend/Dockerfile` is present (already added).
3. In the Render dashboard, add environment variables matching `backend/.env.example` (do NOT paste secrets into the repository).

Option 2 — Create a Web Service manually:
1. In Render dashboard, choose New -> Web Service.
2. Connect repo and point to `backend` folder or use the Dockerfile.
3. Set the start command to: `node server.js` (or leave Dockerfile default).
4. Add environment variables (see `backend/.env.example`).

Triggering Deploys
- If using `render.yaml`, pushing to the configured branch triggers a deploy.
- If using Render's UI, use the dashboard to trigger a deploy after updating env variables.

Security: Rotate exposed secrets
- We removed `backend/.env` from the repository and added `backend/.env.example`.
- Immediately rotate any credentials that were in `backend/.env` (DB users, Cloudinary keys, JWT secret).

Helper scripts
- `scripts/deploy_frontend_vercel.sh` — uses Vercel CLI to publish the `frontend` folder.
- `scripts/deploy_backend_render.sh` — builds the backend Docker image locally and prints push instructions.

If you want, I can run the Vercel CLI deploy now (you must provide `VERCEL_TOKEN`), or guide you through connecting the repo to Vercel/Render.
