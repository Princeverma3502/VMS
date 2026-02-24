# Netlify Deployment Guide — Frontend + Backend Options

## Frontend → Netlify ✅

Netlify is excellent for your React frontend. Here's how:

### Step 1: Deploy Frontend to Netlify (3 minutes)

1. **Go to [netlify.com](https://netlify.com)** → Sign in with GitHub
2. **Click "Add new project" → "Import an existing project"**
3. **Select your VMS repository**
4. **Configure deployment:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend`
5. **Click "Deploy site"** ✓

Netlify will auto-build and deploy. Your site URL: `https://your-project-name.netlify.app`

### Step 2: Add Environment Variables (Netlify UI)

1. **Go to your Netlify site** → **Site settings** → **Build & deploy** → **Environment**
2. **Add:**
   ```
   VITE_API_URL = https://your-backend-api.com
   VITE_VAPID_PUBLIC_KEY = BIEFq4thoCrKdocb4Z1lPiYp65LEdV5XnihrLsbIz_WLRlpMCnA7YWxx454PFK6Pon2wtTNWC0Co5s-Mrm-_h2E
   ```
3. **Trigger re-deploy** (automatic on env var change)

### Step 3: Enable Auto-Deploy

- Netlify automatically deploys on every `git push` to `main`
- You can see build logs in **Deploys** section
- **Live preview** (deploy preview) on every pull request

---

## Backend on Netlify? ❌ Not Recommended

Netlify is **NOT ideal** for a persistent Node.js backend because:
- ❌ No long-running processes (limited to 10 seconds per request)
- ❌ Not designed for WebSocket/real-time connections
- ❌ Costs spike with serverless functions
- ❌ MongoDB connections require special handling

---

## Backend Options (Choose One)

### Option A: Keep Render (Recommended + Easiest)

**Pros:**
- One deploy already done (or close)
- Full Node.js support
- Free tier available
- Simple configuration

**Steps:**
1. Follow [RENDER_FIX.md](./RENDER_FIX.md) — redeploy backend
2. Copy Render backend URL
3. Add to Netlify env vars: `VITE_API_URL=https://vms-backend-xyz.onrender.com`
4. Done ✓

---

### Option B: Railway (Great Alternative)

**Pros:**
- Better than Render in many ways
- Generous free tier
- Better performance
- Easy GitHub integration

**Deploy Backend to Railway (5 minutes):**

1. **Go to [railway.app](https://railway.app)** → Sign up with GitHub
2. **New Project** → **Deploy from GitHub repo**
3. **Select VMS repository**
4. **Click "Deploy" → Service settings:**
   - Set start command: `node server.js`
5. **Add Environment Variables** (copy from `backend/.env.example`):
   ```
   PORT=3000
   MONGO_URI=...
   JWT_SECRET=...
   NODE_ENV=production
   (etc - see backend/.env.example)
   ```
6. **Deploy** → Done ✓

**Your backend URL:** `https://vms-backend.railway.app`

---

### Option C: Fly.io (Most Developer-Friendly)

**Pros:**
- Global deployment
- Best performance worldwide
- Free tier + generous free hours
- Excellent documentation

**Deploy Backend to Fly.io (7 minutes):**

```bash
# 1. Install Fly CLI
# macOS/Linux:
curl -L https://fly.io/install.sh | sh

# Windows (use WSL or download from https://github.com/superfly/flyctl/releases)

# 2. Login
flyctl auth login

# 3. Launch app
cd backend
flyctl launch

# 4. When prompted:
# - App name: vms-backend
# - Region: closest to you
# - Postgres/Redis: no
# - Deploy now: yes

# 5. Add environment variables
flyctl secrets set MONGO_URI=... JWT_SECRET=... NODE_ENV=production (etc)

# 6. Deploy
flyctl deploy
```

**Your backend URL:** `https://vms-backend.fly.dev`

---

## Recommended Setup: Netlify (Frontend) + Railway (Backend)

This combination offers:
- ✅ Best frontend hosting (Netlify)
- ✅ Best backend performance (Railway)
- ✅ Easiest setup
- ✅ Good free tiers for both

---

## Quick Comparison

| Provider | Frontend | Backend | Free Tier | Ease |
|----------|----------|---------|-----------|------|
| **Netlify** | ⭐⭐⭐⭐⭐ | ❌ | Good | Easy |
| **Render** | ⭐⭐⭐ | ⭐⭐⭐⭐ | Okay | Easy |
| **Railway** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Great | Easy |
| **Fly.io** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Great | Medium |
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐ | Good | Easy |

---

## My Recommendation

**Deploy to Netlify + Railway:**

1. **Frontend on Netlify** (this guide, ✓ done in 3 min)
2. **Backend on Railway** (see option B above, ✓ done in 5 min)
3. Link them via `VITE_API_URL` environment variable

**Total time:** ~10 minutes
**Cost:** Free (with paid plans available if needed)
**Performance:** Excellent

---

## Deployment Steps Summary

### Frontend → Netlify
```
1. netlify.com → GitHub → Select repo
2. Base: frontend | Build: npm run build | Publish: dist
3. Deploy
4. Add VITE_API_URL env var pointing to backend
5. Auto-deploys on git push ✓
```

### Backend → Railway (Recommended)
```
1. railway.app → GitHub → Select repo
2. Add environment variables (from backend/.env.example)
3. Deploy
4. Copy URL → Paste in Netlify VITE_API_URL ✓
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend won't build | Check build command is `npm run build` in `frontend/` folder |
| API calls fail (CORS error) | Update `VITE_API_URL` env var in Netlify dashboard |
| Backend crashes | Check all required env vars are set (see SECURITY_CHECKLIST.md) |
| Slow cold start on Railway | Free tier has slower starts; upgrade or use Fly.io |

---

## Environment Variables Checklist

**Netlify (Frontend):**
- ✅ `VITE_API_URL` = your backend URL
- ✅ `VITE_VAPID_PUBLIC_KEY` = (already in code)

**Railway (Backend):** (copy from `backend/.env.example`)
- ✅ `MONGO_URI`
- ✅ `JWT_SECRET`
- ✅ `NODE_ENV=production`
- ✅ `ADMIN_SECRET`
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`
- ✅ `VAPID_PUBLIC_KEY`
- ✅ `VAPID_PRIVATE_KEY`
- ✅ `FRONTEND_URL` = your Netlify frontend URL

---

## Next Steps

1. Deploy frontend to Netlify (3 min) ← **Do this first**
2. Deploy backend to Railway (5 min) ← **Then this**
3. Link them via environment variables (1 min)
4. Test end-to-end

**Ready? Go to [netlify.com](https://netlify.com) now!**
