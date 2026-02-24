# Railway Deployment Guide — Backend

Deploy your VMS backend to Railway in 5 minutes.

## Why Railway?

- ✅ Better than Render for most use cases
- ✅ Generous free tier ($5/month credits)
- ✅ Node.js support built-in
- ✅ Easy GitHub integration
- ✅ Fast deployment
- ✅ Global performance

---

## Step 1: Create Railway Account

1. **Go to [railway.app](https://railway.app)**
2. **Click "Sign up" → "GitHub"**
3. **Authorize and create account**

---

## Step 2: Deploy Backend

### Method A: Using Dashboard (Easiest)

1. **Click "New Project" → "Deploy from GitHub repo"**
2. **Select your VMS repository**
3. **Choose branch: `main`**
4. **Click "Deploy"**
5. **Railway auto-builds and deploys** (takes 2-3 min)

### Method B: Using Railway CLI (Advanced)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend
cd backend

# Create new project
railway init

# Deploy
railway up
```

---

## Step 3: Add Environment Variables

1. **Go to your Railway project dashboard**
2. **Click "Variables" tab**
3. **Click "Add variable" and fill in:**

```
PORT = (leave blank, Railway assigns it)
MONGO_URI = mongodb+srv://PrinceVerma:Aimupsc12SS@cluster0.qcsc5n9.mongodb.net/?appName=Cluster0
JWT_SECRET = SilentShayar
NODE_ENV = production
ADMIN_SECRET = NSS@SecureAdmin123!
CLOUDINARY_CLOUD_NAME = db9gopfya
CLOUDINARY_API_KEY = 514424831754274
CLOUDINARY_API_SECRET = Q3hgTuuCLlN_JNHnTVUXnx6sQM8
VAPID_PUBLIC_KEY = BIEFq4thoCrKdocb4Z1lPiYp65LEdV5XnihrLsbIz_WLRlpMCnA7YWxx454PFK6Pon2wtTNWC0Co5s-Mrm-_h2E
VAPID_PRIVATE_KEY = 2a1SWUnAEdB1XEDt8miTkskkFxxwDNDMpkVH2XSGvUI
FRONTEND_URL = https://your-netlify-frontend.netlify.app
```

4. **Click "Save"**
5. **Railway auto-redeploys with new env vars** ✓

---

## Step 4: Get Your Backend URL

1. **Go to Railway project → "Deployments" tab**
2. **Click latest deployment**
3. **Copy the "Public URL"** (looks like `https://vms-backend-prod-xxxx.railway.app`)
4. **Save this URL** ← You'll need it for Netlify

---

## Step 5: Configure Start Command (if needed)

If Railway doesn't detect your start command:

1. **Go to project settings**
2. **Find "Nixpacks" or "Build logs"**
3. Add build command: `npm ci`
4. Add start command: `node server.js`
5. **Redeploy**

---

## Verify Deployment

```bash
# Test backend is running
curl https://YOUR-RAILWAY-BACKEND-URL/

# Should return: "VMS API is Secure & Running..."
```

---

## Connect to Netlify Frontend

1. **Get your Railway backend URL** (from Step 4)
2. **Go to [netlify.com](https://netlify.com) → Your VMS frontend**
3. **Site settings → Build & deploy → Environment variables**
4. **Add/Update:**
   - Key: `VITE_API_URL`
   - Value: `https://your-railway-backend-url` (paste from Step 4)
5. **Netlify auto-redeploys** ✓

---

## Monitor & Logs

**View deployment logs:**
1. Go to Railway project → Deployments tab
2. Click deployment to see real-time logs
3. Logs shown as app runs and handles requests

**Common issues:**
- If you see error logs, check env variables are all set correctly
- Check that backend/server.js exists and hasn't been modified

---

## Auto-Deploy on Push

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway detects change → auto-builds & deploys
```

---

## Costs

**Free tier:** $5/month credits
- Includes running one Node.js server 24/7
- Plus database connections, storage, etc.

**Paid:** $5+/month depending on usage

[Railway pricing](https://railway.app/pricing)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check backend/package.json exists; verify `npm ci` works locally |
| App crashes on start | Check all env vars from backend/.env.example are set |
| Can't find modules | Ensure backend/package-lock.json is committed (or delete local node_modules, run npm ci, recommit) |
| Port binding error | Remove `PORT` from env vars (Railway assigns it automatically) |
| CORS errors from frontend | Update `FRONTEND_URL` env var in Railway backend settings |

---

## Next Steps

1. ✅ Deploy backend to Railway (you are here)
2. Copy Railway backend URL
3. Go to Netlify frontend settings
4. Update `VITE_API_URL` environment variable
5. Frontend auto-redeploys
6. Test your full application end-to-end

---

**Railway backend URL:** (copy after deployment)
```
https://your-railway-backend-url
```

Use this in Netlify environment variables.
