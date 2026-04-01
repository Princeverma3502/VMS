import { test, expect } from '@playwright/test';

// ─── Test Credentials ──────────────────────────────────────────────────────
const PASS = 'Password123!';
const USERS = {
  sec:  { email: 'test_sec@hbtu.ac.in',  name: 'Test Secretary',     redirect: /\/secretary\/dashboard/ },
  dh:   { email: 'test_dh@hbtu.ac.in',   name: 'Test Domain Head',   redirect: /\/domain-head\/dashboard/ },
  ah:   { email: 'test_ah@hbtu.ac.in',   name: 'Test Associate Head', redirect: /\/(associate-head|volunteer)\/dashboard/ },
  vol:  { email: 'test_vol@hbtu.ac.in',  name: 'Test Volunteer',     redirect: /\/volunteer\/dashboard/ },
};

// ─── Shared: Setup API mocks for a given role ───────────────────────────────
async function setupMocks(page, email, name) {
  let role = 'Volunteer';
  if (email.includes('sec')) role = 'Secretary';
  else if (email.includes('dh')) role = 'Domain Head';
  else if (email.includes('ah')) role = 'Associate Head';

  const mockUser = {
    _id: 'mock-user-456',
    name: name || 'Test ' + role,
    email: email,
    role: role,
    isSuperAdmin: false,
    gamification: { streak: 0 },
  };

  // Catch-all: intercept every request
  await page.route('**/*', async route => {
    const url = route.request().url();

    if (!url.includes('/api/') && !url.includes('/auth/') && !url.includes('localhost:5000') && !url.includes('onrender.com')) {
      return route.continue();
    }

    const isArray = /tasks|leaderboard|activities|polls|announcements|events|pending|users/i.test(url);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(isArray ? [] : {}),
    });
  });

  // POST /auth/login
  await page.route('**/auth/login', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ...mockUser, token: 'mock-jwt-token-888' }),
    });
  });

  // GET /auth/me — must return the same role
  await page.route('**/auth/me', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(mockUser),
    });
  });
}

// ─── Login Helper ───────────────────────────────────────────────────────────
async function login(page, user) {
  console.log(`Starting login for ${user.email}...`);

  await setupMocks(page, user.email, user.name);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.locator('input[type="email"]').first().fill(user.email);
  await page.locator('input[placeholder="••••••••"]').first().fill(PASS);
  await page.locator('button[type="submit"]').first().click();

  // Wait for navigation away from /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  // Dismiss streak modal if it appears
  const streakBtn = page.locator('button', { hasText: /Let's Go!|Continue/i });
  if (await streakBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await streakBtn.click();
  }

  console.log(`Successfully logged in: ${user.email}`);
}

// ─── Phase 1: Static Page Tests ────────────────────────────────────────────

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
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('Protected route: /secretary/dashboard redirects to login', async ({ page }) => {
  await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('Protected route: /super-admin redirects to login', async ({ page }) => {
  await page.goto('/super-admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

// ─── Phase 2: Role-Based Login Tests ────────────────────────────────────────

test('Secretary: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.sec);
  await expect(page).toHaveURL(USERS.sec.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Secretary: User Management page loads', async ({ page }) => {
  await login(page, USERS.sec);
  await expect(page).toHaveURL(USERS.sec.redirect, { timeout: 20000 });
  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1, h2, table, .user-list').first()).toBeVisible({ timeout: 15000 });
});

test('Volunteer: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Volunteer: Task Board page loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/volunteer/tasks', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Volunteer: Profile page loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/volunteer/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('unauthorized', { ignoreCase: true, timeout: 10000 });
});

test('Volunteer: cannot access Secretary dashboard', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).not.toHaveURL(/\/secretary\/dashboard/, { timeout: 15000 });
});

test('Domain Head: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.dh);
  await expect(page).toHaveURL(USERS.dh.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Associate Head: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.ah);
  await expect(page).toHaveURL(USERS.ah.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
});

test('Shared: Polls page loads for Volunteer', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/polls', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1, h2, form').first()).toBeVisible({ timeout: 15000 });
});

test('Shared: Announcements page loads for Volunteer', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/announcements', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1, h2, form').first()).toBeVisible({ timeout: 15000 });
});

test('Logout: clears session and redirects to login', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.evaluate(() => window.localStorage.clear());
  await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
});
