# VMS Testing Guide
All security fixes have been applied. Run these tests to verify everything works.

## 1. Backend Security Tests (Jest)
**Location:** `./backend`

### Run all backend tests
```bash
cd backend
npm test
```

### Run only the new security tests (faster)
```bash
cd backend
npm test -- --testPathPattern="securityMiddleware" --forceExit
```

### Run only the IDOR cross-tenant tests
```bash
cd backend
npm test -- --testPathPattern="securityIDOR" --forceExit
```

### Run all tests individually (fastest per-suite)
```bash
npm test -- --testPathPattern="auth" --forceExit
npm test -- --testPathPattern="taskFlow" --forceExit
npm test -- --testPathPattern="comprehensive" --forceExit
npm test -- --testPathPattern="adminActions" --forceExit
```

## 2. Frontend E2E Tests (Playwright)
**Location:** `./frontend`

⚠️ **Requires:** Both frontend (`npm run dev`) and backend (`npm run dev`) must be running first.

### Step 1 — Start the backend (in a separate terminal)
```bash
cd backend
npm run dev
```

### Step 2 — Start the frontend (in another terminal)
```bash
cd frontend
npm run dev
```

### Step 3 — Run the security & role tests (new)
```bash
cd frontend
npx playwright test security_roles.spec.js
```

### Run without browser UI (headless, faster)
```bash
cd frontend
npx playwright test security_roles.spec.js
```

### Run existing elite tests
```bash
cd frontend
npx playwright test elite.spec.js
```

### Run all Playwright tests
```bash
cd frontend
npx playwright test
```

### Run a single test by name
```bash
cd frontend
npx playwright test -g "Volunteer logs in"
```

### Run only one describe block
```bash
cd frontend
npx playwright test -g "Volunteer Role"
```

### View the HTML test report after running
```bash
cd frontend
npx playwright show-report
```

## 3. What Each Test Verifies

| Test File | Covers |
|-----------|--------|
| `securityMiddleware.test.js` | 401 on protected routes without token, role injection prevention, cross-tenant poll/notice/profile IDOR, Secretary vs Volunteer RBAC |
| `securityIDOR.test.js` | Volunteer from College B cannot claim/register for College A's tasks/events |
| `comprehensive.test.js` | Polls, Announcements, User Management, Gamification full flows |
| `taskFlow.test.js` | Claim → Submit → Verify task lifecycle |
| `adminActions.test.js` | Approve/reject users, update roles |
| `auth.test.js` | Register → Login → Token flow |
| `security_roles.spec.js` | All 4 role dashboards, route guards, 401/403 behavior, shared pages |
| `elite.spec.js` | Persistent login, Secretary Bento dashboard, back navigation |

## 4. Quick Smoke Test (30 seconds)
Just check the three most critical security items:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Test
cd backend
npm test -- --testPathPattern="securityIDOR" --forceExit
```

## 5. Expected Results
### Backend Tests ✅
- All test suites: **PASS**
- `securityMiddleware` — 401s returned for unauth routes, IDOR blocked, role injection prevented
- `securityIDOR` — Cross-college access returns 403/404

### Playwright Tests ✅
- Unauthenticated routes redirect to `/login`
- 403 does **NOT** log out the user (only 401 does)
- Each role lands on the correct dashboard
- Domain Head/Associate Head redirected from `/volunteer/*` routes
- Volunteer blocked from Secretary/Admin routes

> [!NOTE]
> MongoMemoryServer downloads a MongoDB binary on first run (~200 MB). Subsequent runs are instant. If tests seem stuck, wait 2–3 minutes on first run.

> [!TIP]
> To skip slow tests in CI, add `--testPathIgnorePatterns="comprehensive"` to skip heavier suites.
