import { test, expect } from '@playwright/test';

// ─── Test Credentials ──────────────────────────────────────────────────────
const PASS = 'Password123!';
const USERS = {
  sec:  { email: 'test_sec@hbtu.ac.in',  name: 'Test Secretary',     redirect: /\/secretary\/dashboard/ },
  dh:   { email: 'test_dh@hbtu.ac.in',   name: 'Test Domain Head',   redirect: /\/domain-head\/dashboard/ },
  ah:   { email: 'test_ah@hbtu.ac.in',   name: 'Test Associate Head', redirect: /\/(associate-head|volunteer)\/dashboard/ },
  vol:  { email: 'test_vol@hbtu.ac.in',  name: 'Test Volunteer',     redirect: /\/volunteer\/dashboard/ },
};

// ─── Helper ─────────────────────────────────────────────────────────────────
async function login(page, user) {
  console.log(`Starting login for ${user.email}...`);

  // Auto-Mock Login API to ensure 100% test reliability without backend dependencies
  await page.route('**/api/auth/login', async route => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    let mockRole = 'Volunteer';
    if (user.email.includes('sec')) mockRole = 'Secretary';
    else if (user.email.includes('dh')) mockRole = 'Domain Head';
    else if (user.email.includes('ah')) mockRole = 'Associate Head';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        _id: 'mock-user-456',
        name: user.name,
        email: user.email,
        role: mockRole,
        token: 'mock-jwt-token-888',
        isSuperAdmin: false,
        gamification: { streak: 0 } // Bypass streak modal
      })
    });
  });

  await page.route('**/api/auth/me', async route => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    let mockRole = 'Volunteer';
    if (user.email.includes('sec')) mockRole = 'Secretary';
    else if (user.email.includes('dh')) mockRole = 'Domain Head';
    else if (user.email.includes('ah')) mockRole = 'Associate Head';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        _id: 'mock-user-456',
        name: user.name,
        email: user.email,
        role: mockRole,
        isSuperAdmin: false,
        gamification: { streak: 0 }
      })
    });
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(PASS);
  await page.locator('button[type="submit"]').click();
  
  const streakModalBtn = page.locator('button', { hasText: /Let\'s Go!|Continue/i });
  const errorAlert = page.locator('.text-red-600, .bg-red-50');
  
  try {
    // Race: success navigation vs Streak Modal vs Error
    await Promise.race([
        page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 15000 }),
        streakModalBtn.waitFor({ state: 'visible', timeout: 15000 }),
        errorAlert.waitFor({ state: 'visible', timeout: 10000 })
    ]);

    // 1. Check for Error
    if (await errorAlert.isVisible()) {
        const txt = await errorAlert.innerText();
        throw new Error(`Login failed for ${user.email}: ${txt}`);
    }

    // 2. Check for Streak Modal
    if (await streakModalBtn.isVisible()) {
        console.log(`Streak Modal detected for ${user.email}, clicking...`);
        await streakModalBtn.click();
        await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 15000 });
    }
  } catch (e) {
    if (e.message.includes('Login failed')) throw e;
    console.log(`Timeout inside login helper, attempting to continue...`);
  }

  // 3. Final wait for navigation away from login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
  console.log(`Successfully logged in: ${user.email}`);
}

// ─── Phase 1 Tests ─────────────────────────────────────────────────────────

test('Login page: renders form elements', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('Login page: shows error on wrong credentials', async ({ page }) => {
  // MUST mock a 401 rejection for this explicit test
  await page.route('**/api/auth/login', async route => {
    if (route.request().method() === 'OPTIONS') {
      return route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Invalid Email or Password' })
    });
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill('wrong@email.com');
  await page.locator('input[type="password"]').fill('WrongPass!');
  await page.locator('button[type="submit"]').click();

  // Should stay on login and show an error (50s timeout for backend cold-start)
  const errText = page.locator('text=/Invalid|incorrect|failed/i').first();
  await expect(errText).toBeVisible({ timeout: 50000 });
});

test('Register page: renders form', async ({ page }) => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
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

// ─── Phase 2 Tests (Roles) ──────────────────────────────────────────────────

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
  // Should bounce off the route
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
  // Check for the heading/nav to ensure page loaded properly
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
  // Clear localStorage to simulate logout or session void
  await page.evaluate(() => window.localStorage.clear());
  await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
});
