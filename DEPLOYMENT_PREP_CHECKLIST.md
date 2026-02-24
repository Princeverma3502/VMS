Deployment Preparation Checklist
===============================

Quick checklist to prepare the VMS app for deployment.

- **Environment & Secrets**: Ensure `.env` contains production values (no secrets committed).
  - `MONGO_URI`, `JWT_SECRET`, `ADMIN_SECRET`, Cloudinary keys, VAPID keys.

- **Backend**:
  - Run `npm ci` in `/backend` and verify dependencies.
  - Run the test suite: `npm test` (we added Jest + tests). All tests should pass.
  - Ensure `NODE_ENV=production` in runtime.
  - Configure process manager (PM2/systemd) to run `node server.js` and auto-restart.
  - PM2 quick start (example files included):
    - `backend/ecosystem.config.js` (PM2 config)
    - `scripts/deploy_backend.sh` — pulls, installs, and reloads PM2.
    - Example commands:
      - `cd backend && pm2 startOrReload ecosystem.config.js --env production`
      - `pm2 save`
    - On Windows, use `pm2` from a Node-enabled shell or set up as a service.
  - Ensure logging (stdout or file) and error monitoring (Sentry/Logflare) are configured.
  - Healthcheck endpoint (e.g., `/api/health`) for load balancer.

- **Frontend**:
  - Run `npm ci` in `/frontend`.
  - Build static assets: `npm run build` (Vite) and verify `dist/` output.
  - Serve static `dist/` via CDN or from backend with correct routing to `index.html` (SPA fallback).
  - Set runtime env (for config endpoints) or bake API base URL into build.

- **Database**:
  - Ensure a production MongoDB instance is provisioned and secure (network rules, username/password).
  - Run any DB migrations or schema validations if required.

- **Security**:
  - Use HTTPS (TLS) with valid certs (Let's Encrypt or managed certs).
  - Set CORS and rate-limiting appropriately in `server.js`.
  - Ensure helmet is enabled (already present) and body-size limits are appropriate.

- **Observability**:
  - Configure monitoring, error reporting, and alerting.
  - Ensure logs are rotated and centralized.

- **Smoke tests** (post-deploy):
  - Register a test user, approve, login, create an event/announcement/task, and verify core flows.

Notes:
- I added backend unit/integration tests and basic frontend component tests to help catch regressions earlier. Run tests locally before deploying.
