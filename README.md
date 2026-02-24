# VMS — Voluntary Management System

A comprehensive platform for managing volunteers, events, domains, and organizations. Built with Node.js + Express (backend) and React + Vite (frontend).

## 📦 Project Structure

```
VMS/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite UI
├── QUICK_DEPLOY.md   # 👈 START HERE for deployment
├── SECURITY_CHECKLIST.md
├── DEPLOYMENT_STRATEGY.md
└── README_DEPLOY.md
```

## 🚀 Quick Start (Development)

### Backend
```bash
cd backend
npm install
npm run dev           # Uses nodemon (auto-restart on changes)
npm test              # Run test suite
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # Vite dev server on :5173
npm test              # Run component tests
npm run build         # Production build
```

## 🔐 Security

> **IMPORTANT:** Secrets have been removed from the repository. See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md).

- All environment variables use `.env.example` as template
- Local `.env` files are git-ignored
- Backend validates required env vars at startup
- CORS, Helmet, rate limiting configured for production

## 📋 Deployment

### Frontend (Netlify/Vercel)
```
Netlify (recommended): netlify.com → Connect GitHub → Base: frontend
Vercel: vercel.com → Similar flow, also excellent
```

### Backend (Railway/Render)
```
Railway (recommended): railway.app → Deploy from GitHub → Add env vars
Render: render.com → Docker environment → Add env vars
```

**👉 See deployment guides:**
- [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) — Frontend to Netlify
- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) — Backend to Railway
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) — Original Vercel + Render guide
- [RENDER_FIX.md](./RENDER_FIX.md) — Fix for Render issues

## 📚 Documentation

| File | Purpose |
|------|---------|
| [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) | **→ Start here** — 5-minute deployment guide |
| [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) | Security best practices & requirements |
| [DEPLOYMENT_STRATEGY.md](./DEPLOYMENT_STRATEGY.md) | Zero-downtime strategies & deployment info |
| [README_DEPLOY.md](./README_DEPLOY.md) | Detailed deployment explanations |

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

**Test suites:** Auth, Events, Tasks, Announcements, Admin Actions
- Using: Jest + Supertest + mongodb-memory-server

### Frontend Tests
```bash
cd frontend
npm test                    # Run tests
npm run build               # Check production build
```

**Test coverage:** Forms, Components, Integration
- Using: Vitest + React Testing Library

## 🛠️ Accessibility

- Forms have proper label linking
- WCAG 2AA compliance targeted
- pa11y config included (`frontend/pa11yci.json`)

## 📊 Architecture

- **Backend:** Express, MongoDB, JWT auth, role-based access
- **Frontend:** React, Tailwind CSS, React Router, Vite
- **Deployment:** Docker (backend), Static hosts (frontend)
- **Process Management:** PM2 (included config)

## 🔧 Environment Variables

### Backend (`backend/.env`)
See `backend/.env.example` for required variables.

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000
VITE_VAPID_PUBLIC_KEY=...
```

## 💡 Key Features

- Multi-tenancy (colleges/domains)
- Event management & registration
- Volunteer tracking & opportunities
- Announcements & instant notifications
- Task assignment & tracking
- Discussion forums
- Gamification & achievements
- ID card generation
- Real-time activity logging

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Write tests for new code
3. Ensure all tests pass: `npm test`
4. Submit PR with description

## 📞 Support

- **Issue Tracker:** GitHub Issues
- **Documentation:** See `*.md` files in root
- **Local Development:** Use `npm run dev` for hot reload

## ⚠️ Important Notes

1. **Secrets Rotation:** See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md#secrets-already-exposed-rotate-immediately)
2. **Production Ready:** All backend tests pass ✓, frontend build tested ✓
3. **CORS:** Update `FRONTEND_URL` env var in production
4. **Database:** MongoDB Atlas connection string in `.env`

---

**Status:** ✅ Ready for Deployment to Vercel (frontend) & Render (backend)

See [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) to get started.
