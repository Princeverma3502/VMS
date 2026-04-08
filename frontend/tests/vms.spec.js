import { test, expect } from '@playwright/test';

// ─── Test Credentials ──────────────────────────────────────────────────────
const PASS = 'Password123!';
const USERS = {
  sec:  { email: 'test_sec@hbtu.ac.in',  name: 'Test Secretary',     role: 'Secretary',     redirect: /\/secretary\/dashboard/ },
  dh:   { email: 'test_dh@hbtu.ac.in',   name: 'Test Domain Head',   role: 'Domain Head',    redirect: /\/domain-head\/dashboard/ },
  ah:   { email: 'test_ah@hbtu.ac.in',   name: 'Test Associate Head', role: 'Associate Head', redirect: /\/(associate-head|volunteer)\/dashboard/ },
  vol:  { email: 'test_vol@hbtu.ac.in',  name: 'Test Volunteer',     role: 'Volunteer',      redirect: /\/volunteer\/dashboard/ },
};

// ─── Shared: Setup API mocks for a given role ───────────────────────────────
async function setupMocks(page, email, name, roleInput) {
  const roleMap = {
    'Volunteer': 'Volunteer',
    'Secretary': 'Secretary',
    'Domain Head': 'Domain Head',
    'Associate Head': 'Associate Head'
  };
  const role = roleInput || roleMap[roleInput] || 'Volunteer';

  const mockUser = {
    _id: `mock-user-${role}-456`,
    name: name || 'Test ' + role,
    email: email,
    role: role,
    isSuperAdmin: false,
    gamification: { streak: 5 },
  };

  // Broad interceptor for all API/Auth calls
  await page.route('**/{api,auth}/**', async route => {
    const url = route.request().url();
    const method = route.request().method();
    
    if (url.includes('/auth/me')) {
      console.log(`[MOCK] vms.spec.js /auth/me -> Returning ${role}`);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(mockUser),
      });
    }
    
    if (url.includes('/auth/login') && method === 'POST') {
      console.log(`[MOCK] vms.spec.js /auth/login -> Logging in as ${role}`);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ...mockUser, token: 'mock-jwt-token-888' }),
      });
    }

    if (method === 'GET') {
      const isArray = /tasks|leaderboard|activities|polls|announcements|events|pending|users|meetings|notices|knowledge|search/i.test(url);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(isArray ? [] : {}),
      });
    }

    // Aggressive catch-all for any other API requests (POST/PUT/DELETE/OPTIONS)
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({ success: true }),
    });
  });
}

// ─── Login Helper ───────────────────────────────────────────────────────────
async function login(page, user) {
  console.log(`🔑 Logging in as: ${user.email}`);

  const role = user.role || (user.email.includes('sec') ? 'secretary' : user.email.includes('dh') ? 'domain-head' : user.email.includes('ah') ? 'associate-head' : 'volunteer');

  await setupMocks(page, user.email, user.name, role);

  // Navigate to login and ensure fresh state
  await page.goto('/login', { waitUntil: 'load' });
  await page.evaluate(() => { window.localStorage.clear(); window.sessionStorage.clear(); });

  // Fill form - Use more resilient locators
  await page.locator('input[type="email"]').first().fill(user.email);
  await page.locator('input[type="password"]').first().fill(PASS);
  
  const submitBtn = page.locator('button[type="submit"]').first();
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // Handle Streak Modal (It appears BEFORE redirection)
  const streakBtn = page.locator('button', { hasText: /Let's Go!|Continue/i }).first();
  try {
    await streakBtn.waitFor({ state: 'visible', timeout: 3000 });
    await streakBtn.click();
  } catch {
    // Proceed if no modal or already redirected
  }

  // Assert transition (Generous timeout for slow CI environments)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
  await expect(page.locator('h1, h2, h3, .dashboard, .nav-link').first()).toBeVisible({ timeout: 20000 });
  console.log(`✅ Logged in as: ${user.email}`);
}

// ─── Phase 1: Static Page Tests ────────────────────────────────────────────
test.describe('VMS E2E Suite', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(180000); // 3 minutes for the full suite
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('AuthContext') || text.includes('ProtectedRoute')) {
        console.log(`[BROWSER]: ${text}`);
      }
    });
  });

  test('Login page: renders form elements', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
  await expect(page.locator('input[placeholder="••••••••"]').first()).toBeVisible();
  await expect(page.locator('button[type="submit"]').first()).toBeVisible();
});

test('Login page: shows error on wrong credentials', async ({ page }) => {
  // Mock a 401 rejection
  await page.route('**/auth/login', async route => {
    return route.fulfill({
      status: 401,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Invalid Email or Password' }),
    });
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').first().fill('wrong@email.com');
  await page.locator('input[placeholder="••••••••"]').first().fill('WrongPass!');
  await page.locator('button[type="submit"]').first().click();

  const errText = page.locator('text=/Invalid|incorrect|failed/i').first();
  await expect(errText).toBeVisible({ timeout: 15000 });
});

test('Register page: renders form', async ({ page }) => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"]').first()).toBeVisible();
});

test('Protected route: redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});

test('Protected route: /secretary/dashboard redirects to login', async ({ page }) => {
  await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});

test('Protected route: /super-admin redirects to login', async ({ page }) => {
  await page.goto('/super-admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});

// ─── Phase 2: Role-Based Login Tests ────────────────────────────────────────

test('Secretary: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.sec);
  await expect(page).toHaveURL(USERS.sec.redirect);
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Secretary: User Management page loads', async ({ page }) => {
  await login(page, USERS.sec);
  await expect(page).toHaveURL(USERS.sec.redirect);
  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1, h2, table, .user-list').first()).toBeVisible({ timeout: 15000 });
});

test('Volunteer: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Volunteer: Task Board page loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await page.goto('/volunteer/tasks', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Volunteer: Profile page loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await page.goto('/volunteer/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('unauthorized', { ignoreCase: true, timeout: 10000 });
});

test('Volunteer: cannot access Secretary dashboard', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).not.toHaveURL(/\/secretary\/dashboard/);
});

test('Domain Head: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.dh);
  await expect(page).toHaveURL(USERS.dh.redirect);
  await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 15000 });
});

test('Associate Head: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.ah);
  await expect(page).toHaveURL(USERS.ah.redirect);
  await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 15000 });
});

test('Shared: Polls page loads for Volunteer', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await page.goto('/polls', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1, h2, form').first()).toBeVisible({ timeout: 15000 });
});

test('Shared: Announcements page loads for Volunteer', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await page.goto('/announcements', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1, h2, form').first()).toBeVisible({ timeout: 15000 });
});

test('Logout: clears session and redirects to login', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect);
  await page.evaluate(() => window.localStorage.clear());
  await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});
});
