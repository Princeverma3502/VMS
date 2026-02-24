# VMS — Quick Deployment Guide

## Choose Your Platform

### Option 1: Vercel (Frontend) + Render (Backend)
👉 **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** (this file)

### Option 2: Netlify (Frontend) + Railway (Backend) ⭐ **Recommended**
👉 **[NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)** — Better combination
👉 **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** — Better backend than Render

---

## Vercel + Render (Original Guide)

- [x] Backend .env created locally (`.gitignore` protects it)
- [x] Backend .env.example created (safe template)
- [x] Frontend .env.example created
- [x] Environment variables validated at backend startup
- [x] CORS configured for production
- [x] Security headers (Helmet) enabled
- [x] Rate limiting configured (100 req/10min)
- [x] Secrets removed from repository
- [x] Frontend build tested and successful
- [x] Backend server tested and starts correctly
- [x] Docker image ready for Render
- [x] Vercel configuration file added

---

## Deploy Frontend to Vercel (2 minutes)

1. **Go to [vercel.com](https://vercel.com)** → Sign in with GitHub
2. **Click "Add New" → "Project"**
3. **Select your VMS repository**
4. **Configure:**
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
5. **Add Environment Variables:**
   - Key: `VITE_API_URL`
   - Value: `https://BACKEND_URL_HERE.onrender.com` (paste after deploying backend)
   - Key: `VITE_VAPID_PUBLIC_KEY`
   - Value: `BIEFq4thoCrKdocb4Z1lPiYp65LEdV5XnihrLsbIz_WLRlpMCnA7YWxx454PFK6Pon2wtTNWC0Co5s-Mrm-_h2E`
6. **Click "Deploy"** ✓

**Result:** `https://vms-frontend-XXXXXX.vercel.app`

---

## Deploy Backend to Render (3 minutes)

### ⚠️ Troubleshooting: If you got "Cannot find package 'express'" error

**See [RENDER_FIX.md](./RENDER_FIX.md) for the solution.** 

This happens when you selected Node.js environment instead of Docker. Follow **Method 1** in RENDER_FIX.md to redeploy correctly.

---

### Option A: Using Docker (Recommended)

1. **Go to [render.com](https://render.com)** → Sign in → Dashboard
2. **Click "New" → "Web Service"**
3. **Connect Repository:**
   - Select VMS repo
   - Branch: `main`
   - Root Directory: `backend`
4. **Configuration:**
   - Environment: `Docker`
   - Build Command: *leave empty* (uses Dockerfile)
   - Start Command: *leave empty* (uses Dockerfile CMD)
5. **Add Environment Variables:**

   Copy-paste these (replace placeholder values):
   ```
   PORT=10000
   MONGO_URI=mongodb+srv://PrinceVerma:Aimupsc12SS@cluster0.qcsc5n9.mongodb.net/?appName=Cluster0
   JWT_SECRET=SilentShayar
   NODE_ENV=production
   ADMIN_SECRET=NSS@SecureAdmin123!
   CLOUDINARY_CLOUD_NAME=db9gopfya
   CLOUDINARY_API_KEY=514424831754274
   CLOUDINARY_API_SECRET=Q3hgTuuCLlN_JNHnTVUXnx6sQM8
   VAPID_PUBLIC_KEY=BIEFq4thoCrKdocb4Z1lPiYp65LEdV5XnihrLsbIz_WLRlpMCnA7YWxx454PFK6Pon2wtTNWC0Co5s-Mrm-_h2E
   VAPID_PRIVATE_KEY=2a1SWUnAEdB1XEDt8miTkskkFxxwDNDMpkVH2XSGvUI
   FRONTEND_URL=https://vms-frontend-XXXXXX.vercel.app
   ```

6. **Click "Create Web Service"** ✓

**Result:** `https://vms-backend-XXXXXX.onrender.com`

### Option B: Using Node (if Docker fails)

1. Follow steps 1-4 above, but select `Node` as environment
2. Build Command: `npm ci`
3. Start Command: `node server.js`
4. Add same environment variables as above
5. Click "Create Web Service"

---

## Post-Deployment Steps

1. **Update Vercel Frontend URL:**
   - Get your Render backend URL: `https://vms-backend-XXXXXX.onrender.com`
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Update `VITE_API_URL` with the Render backend URL
   - Redeploy frontend (automatic on env change)

2. **Test the Connection:**
   ```bash
   # From your browser, try:
   curl https://vms-backend-XXXXXX.onrender.com/
   # Should return: "VMS API is Secure & Running..."
   ```

3. **Test API Endpoints:**
   - Go to your frontend: `https://vms-frontend-XXXXXX.vercel.app`
   - Log in and test key flows (create event, announcement, etc)

4. **Verify Security Headers:**
   ```bash
   curl -I https://vms-backend-XXXXXX.onrender.com/
   # Should show: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
   ```

---

## ⚠️ URGENT: Rotate Exposed Secrets

These credentials were committed to the repository before cleanup. Update them **immediately**:

1. **MongoDB:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Change password for `PrinceVerma` user
   - Update `MONGO_URI` in Render

2. **API Keys (Cloudinary, VAPID):**
   - Regenerate in their respective dashboards
   - Update in Render environment variables

3. **JWT & Admin Secrets:**
   - Generate new secure random strings:
     ```bash
     # Generate secure random secret
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Update `JWT_SECRET` and `ADMIN_SECRET` in Render

4. **Verify Rotation:**
   - Render automatically redeploys when env vars change
   - Old credentials stop working immediately

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check all env vars in Render dashboard match `backend/.env.example` |
| Frontend can't reach backend | Verify `VITE_API_URL` is set correctly in Vercel |
| CORS errors | Ensure `FRONTEND_URL` is set in Render backend env vars |
| Large bundle size warning | Non-critical; consider code-splitting if needed |
| Render cold start slow | Normal on free tier; upgrade to paid for faster starts |

---

## Next Steps (Optional Enhancements)

- [ ] Set up custom domain (both Vercel & Render support this)
- [ ] Enable GitHub Actions for auto-deploy on push
- [ ] Set up database backups (MongoDB Atlas)
- [ ] Configure monitoring & alerts (Render dashboard)
- [ ] Add E2E tests with Cypress
- [ ] Set up error tracking (Sentry)

---

## Production URLs (Save These)

```
Frontend:  https://vms-frontend-[YOUR-ID].vercel.app
Backend:   https://vms-backend-[YOUR-ID].onrender.com
```

**Deployment Status:** ✓ Ready to Deploy
