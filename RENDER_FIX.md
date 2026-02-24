# Render Deployment Fix — Error: Cannot find package 'express'

## Problem

Your Render deployment failed with:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express' imported from /opt/render/project/src/backend/server.js
```

**Cause:** Dependencies (`npm install`) were not run before starting the server.

---

## Solution (Choose One)

### ✅ Method 1: DELETE & Redeploy Using Docker (Recommended)

Docker is more reliable and matches your `backend/Dockerfile`.

1. **Go to Render Dashboard** → Select your VMS backend service
2. **Click "Settings" → Scroll to "Danger Zone" → "Delete Service"**
3. **Go back to Dashboard → "New" → "Web Service"**
4. **Connect your repository again**
5. **Configure properly:**
   - 🎯 **Root Directory:** `backend`
   - 🎯 **Environment:** `Docker` (NOT Node!)
   - Build Command: *leave blank* (uses Dockerfile)
   - Start Command: *leave blank* (uses Dockerfile)
6. **Click "Create Web Service"**
7. **Once created, add Environment Variables:**
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
   FRONTEND_URL=https://your-vercel-frontend.vercel.app
   ```
8. **Render will start building & deploying** ✓

---

### ✅ Method 2: Fix the Existing Service (Node.js)

If you want to keep the current service and fix it:

1. **Go to Render Dashboard** → Your backend service
2. **Click "Settings"**
3. **Update these fields:**
   - Root Directory: `backend`
   - Build Command: `npm ci`
   - Start Command: `node server.js`
4. **Click "Save"**
5. **Then click "Deploy" button** to redeploy ✓

---

### ✅ Method 3: Use render-node.yaml (GitHub Auto-Deploy)

If you want Render to auto-detect from config file:

1. Rename: `render-node.yaml` → `render.yaml` (or keep current Docker config)
2. Push to GitHub: `git add . && git commit -m "Fix Render config" && git push`
3. Render will detect the change and redeploy ✓

---

## Quick Verification

After deployment succeeds:

```bash
# Should return "VMS API is Secure & Running..."
curl https://your-render-backend-url.onrender.com/

# Check security headers are present
curl -I https://your-render-backend-url.onrender.com/
```

---

## Why This Happened

The error log shows:
```
==> Running build command 'node'...
```

This is wrong. It should be:
- **Docker:** (no build command needed - Dockerfile handles it)
- **Node.js:** `npm ci` or `npm install`

When Render tried to run `node server.js` without installing dependencies first, Node.js couldn't find the `express` package.

---

## Recommended Path Forward

**Use Method 1 (Docker)** because:
- ✅ More reliable for this project
- ✅ Matches your `backend/Dockerfile`
- ✅ Consistent with production practices
- ✅ Better isolation & reproducibility

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build still fails | Verify Root Directory is `backend`, not `src/backend` |
| Env vars not loaded | Click "Redeploy" after adding env vars |
| Still can't find 'express' | Check that Build Command is NOT set (let Docker/Node defaults work) |
| Port binding fails | Render assigns PORT automatically; use `process.env.PORT` (already done) |

---

## After Successful Deployment

1. Copy your Render backend URL (e.g., `https://vms-backend-xyz.onrender.com`)
2. Go to **Vercel Dashboard** → Frontend Settings → Environment Variables
3. Update `VITE_API_URL` to your Render backend URL
4. Vercel will auto-redeploy ✓
5. Test your site end-to-end

---

**Next Step:** Delete the service and redeploy using **Method 1 (Docker)** above.
