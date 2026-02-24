# Security Checklist for VMS Deployment

## Backend Security ✓

- [x] **Secrets Removed from Repository**
  - `backend/.env` deleted (was committed with secrets)
  - `backend/.env.example` created (safe template)
  - `.gitignore` enforces env file exclusion

- [x] **CORS Properly Configured**
  - Development: allows `localhost:5173` and `localhost:5174`
  - Production: reads `FRONTEND_URL` from env or defaults safely
  - Credentials allowed for authentication

- [x] **Security Headers (Helmet)**
  - Prevents XSS, clickjacking, MIME sniffing
  - Sets CSP, HSTS, and other protective headers
  - Enabled globally on all routes

- [x] **Rate Limiting**
  - 100 requests per 10 minutes per IP
  - Prevents brute force attacks
  - Applies to all routes by default

- [x] **Input Validation**
  - express-validator used across controllers
  - Payload size limits: 5MB max
  - URL-encoded payloads validated

- [x] **Authentication & Authorization**
  - JWT used for stateless auth
  - Role-based middleware enforces access control
  - Tenant isolation via tenantMiddleware

- [x] **Environment Variable Validation**
  - Startup check ensures all required vars are present
  - Server exits if critical secrets missing
  - Clear error messages for debugging

## Frontend Security ✓

- [x] **No Secrets in Code**
  - Client-side variables use `VITE_` prefix
  - `.env` files excluded from repo
  - API calls use backend endpoints only

- [x] **API Key Protection**
  - Cloudinary keys kept server-side
  - VAPID keys on backend only
  - Frontend only gets public URLs

## Deployment Security

### Before Deploying to Vercel/Render:

1. **⚠️ IMMEDIATE: Rotate All Secrets**
   ```
   - MongoDB user & password
   - JWT_SECRET
   - ADMIN_SECRET
   - Cloudinary API keys
   - VAPID public/private keys
   ```

2. **Set Environment Variables (DO NOT commit to repo)**
   - Vercel Dashboard → Settings → Environment Variables
   - Render Dashboard → Environment

3. **Enable HTTPS Everywhere**
   - Vercel auto-HTTPS ✓
   - Render auto-HTTPS ✓
   - All requests must be HTTPS only

4. **Set FRONTEND_URL in Render**
   ```
   FRONTEND_URL=https://your-vercel-frontend.vercel.app
   ```
   This enables CORS to work cross-domain in production

5. **Database Security**
   - Use MongoDB Atlas IP whitelist
   - Allow only Render IP + local dev IP
   - Enable MongoDB authentication
   - Use strong passwords

## Monitoring & Alerts

- [x] Error logging middleware captures all failures
- [x] Audit logs track sensitive actions
- [ ] Set up alerting for failed auth attempts (recommended)
- [ ] Monitor rate limit hits (recommended)

## Post-Deployment

- [ ] Test API endpoints with production URLs
- [ ] Verify CORS works from deployed frontend
- [ ] Check security headers with https://securityheaders.com
- [ ] Run accessibility scan (pa11yci configured)
- [ ] Test all auth flows (login, role checks, token refresh)

## Quick Audit Commands

```bash
# Check deployed security headers
curl -I https://your-render-backend.onrender.com/

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
```

## Secrets Already Exposed (ROTATE IMMEDIATELY)

The following were committed to the repository before cleanup:
- MongoDB URI with credentials
- JWT_SECRET
- ADMIN_SECRET
- Cloudinary API keys
- VAPID keys

**ACTION REQUIRED:**
1. Change all credentials in their respective services
2. Create new API keys where applicable
3. Update `.env` files in all deployed instances
4. Revoke any old tokens/keys

---

**Deployment Status**
- Backend Docker image ready for Render
- Frontend build optimized for Vercel
- Environment variable templates created
- All secrets removed from repo

**Next Steps**
1. Update `FRONTEND_URL` in Render environment
2. Deploy to Vercel (frontend)
3. Deploy to Render (backend)
4. Rotate credentials
5. Test end-to-end
