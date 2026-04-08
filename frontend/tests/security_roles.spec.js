/**
 * VMS Security & Role-Based Access E2E Tests
 * Tests all 4 role flows: Volunteer, Secretary, Domain Head, Associate Head
 * Uses API mocking so tests pass without a live backend
 */
import { test, expect } from '@playwright/test';

// ─── Mock Factories ───────────────────────────────────────────────────────────
function makeMockUser(role) {
  return {
    _id: `mock-${role.toLowerCase().replace(' ', '-')}-id`,
    name: `Test ${role}`,
    email: `test_${role.toLowerCase().replace(' ', '_')}@hbtu.ac.in`,
    role,
    isSuperAdmin: false,
    isApproved: true,
    collegeId: 'mock-college-id',
    gamification: { streak: 3, xpPoints: 120, level: 2, lastLogin: new Date().toISOString() },
  };
}

async function setupMocks(page, role) {
  const mockUser = makeMockUser(role);

  await page.route('**/*', async route => {
    const url = route.request().url();
    if (
      !url.includes('/auth/') &&
      !url.includes('localhost:5000') &&
      !url.includes('onrender.com') &&
      !url.includes('/api/')
    ) {
      return route.continue();
    }
    const isArray = /tasks|activities|polls|announcements|events|notices|users|meetings|knowledge/i.test(url);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(isArray ? [] : {}),
    });
  });

  await page.route('**/auth/login', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ ...mockUser, token: 'mock-jwt-token-secure' }),
  }));

  await page.route('**/auth/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(mockUser),
  }));
}

async function login(page, role) {
  await setupMocks(page, role);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.locator('input[type="email"]').first().waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('input[type="email"]').first().fill(`test_${role.toLowerCase().replace(' ', '_')}@hbtu.ac.in`);
  await page.locator('input[placeholder="••••••••"]').first().fill('Password123!');
  await page.locator('button[type="submit"]').first().click();
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  // Dismiss streak modal if it pops up
  const streakBtn = page.locator('button', { hasText: /Let's Go!|Continue/i });
  if (await streakBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await streakBtn.click();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: Unauthenticated route protection
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Security: Route Guards — Unauthenticated Redirect', () => {

  test('protected pages redirect unauthenticated users to /login', async ({ page }) => {
    const protectedPaths = [
      '/volunteer/dashboard',
      '/secretary/dashboard',
      '/domain-head/dashboard',
      '/associate-head/dashboard',
      '/knowledge-base',
      '/search',
      '/volunteer-resume/000',
    ];

    for (const path of protectedPaths) {
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
  });

  test('403 from API does NOT log out the user (only 401 should)', async ({ page }) => {
    await login(page, 'Volunteer');

    // Override any route to return 403
    await page.route('**/tasks**', route => route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Forbidden' }),
    }));

    // Triggering a 403 should NOT navigate to /login
    await page.goto('/volunteer/tasks', { waitUntil: 'domcontentloaded' });
    // User should still be logged in — NOT redirected to /login
    await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// VOLUNTEER ROLE FLOW
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Volunteer Role: Complete Flow', () => {

  test('Volunteer logs in and reaches volunteer dashboard', async ({ page }) => {
    await login(page, 'Volunteer');
    await expect(page).toHaveURL(/\/volunteer\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Volunteer can navigate to Tasks page', async ({ page }) => {
    await login(page, 'Volunteer');
    await page.goto('/volunteer/tasks', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/volunteer\/tasks/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Volunteer can navigate to Profile page', async ({ page }) => {
    await login(page, 'Volunteer');
    await page.goto('/volunteer/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/volunteer\/profile/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Volunteer can navigate to Leaderboard', async ({ page }) => {
    await login(page, 'Volunteer');
    await page.goto('/volunteer/leaderboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/volunteer\/leaderboard/);
  });

  test('Volunteer visiting /secretary/dashboard is redirected', async ({ page }) => {
    await login(page, 'Volunteer');
    await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
    // Should show unauthorized page or redirect away from secretary route
    await expect(page).not.toHaveURL(/\/secretary\/dashboard/, { timeout: 10000 });
  });

  test('Volunteer visiting /admin/users is denied', async ({ page }) => {
    await login(page, 'Volunteer');
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/admin\/users/, { timeout: 10000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SECRETARY ROLE FLOW
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Secretary Role: Complete Flow', () => {

  test('Secretary logs in and reaches secretary dashboard', async ({ page }) => {
    await login(page, 'Secretary');
    await expect(page).toHaveURL(/\/secretary\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Secretary can navigate to User Management', async ({ page }) => {
    await login(page, 'Secretary');
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/users/, { timeout: 10000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Secretary can navigate to Task Management', async ({ page }) => {
    await login(page, 'Secretary');
    await page.goto('/secretary/tasks', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/secretary\/tasks/);
  });

  test('Secretary can navigate to Event Management', async ({ page }) => {
    await login(page, 'Secretary');
    await page.goto('/admin/events', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/events/);
  });

  test('Secretary visiting /volunteer/dashboard is redirected to their own dashboard', async ({ page }) => {
    await login(page, 'Secretary');
    await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
    // Secretary should be redirected away from volunteer route
    await expect(page).not.toHaveURL(/\/volunteer\/dashboard/, { timeout: 10000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN HEAD ROLE FLOW
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Domain Head Role: Complete Flow', () => {

  test('Domain Head logs in and reaches domain-head dashboard', async ({ page }) => {
    await login(page, 'Domain Head');
    await expect(page).toHaveURL(/\/domain-head\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Domain Head can view profile', async ({ page }) => {
    await login(page, 'Domain Head');
    await page.goto('/domain-head/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/domain-head\/profile/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Domain Head visiting /volunteer/dashboard is redirected to their dashboard', async ({ page }) => {
    await login(page, 'Domain Head');
    await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
    // Should redirect to /domain-head/dashboard (not unauthorized, not volunteer)
    await expect(page).toHaveURL(/\/domain-head\/dashboard/, { timeout: 10000 });
  });

  test('Domain Head is denied access to secretary-only admin pages', async ({ page }) => {
    await login(page, 'Domain Head');
    await page.goto('/admin/certificates', { waitUntil: 'domcontentloaded' });
    // Domain Head should not access secretary-only pages
    await expect(page).not.toHaveURL(/\/admin\/certificates/, { timeout: 10000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// ASSOCIATE HEAD ROLE FLOW
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Associate Head Role: Complete Flow', () => {

  test('Associate Head logs in and reaches associate-head dashboard', async ({ page }) => {
    await login(page, 'Associate Head');
    await expect(page).toHaveURL(/\/associate-head\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Associate Head can view profile', async ({ page }) => {
    await login(page, 'Associate Head');
    await page.goto('/associate-head/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/associate-head\/profile/);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('Associate Head can access Tasks page', async ({ page }) => {
    await login(page, 'Associate Head');
    await page.goto('/associate-head/tasks', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/associate-head\/tasks/);
  });

  test('Associate Head can access Leaderboard', async ({ page }) => {
    await login(page, 'Associate Head');
    await page.goto('/associate-head/leaderboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/associate-head\/leaderboard/);
  });

  test('Associate Head can access Scan page', async ({ page }) => {
    await login(page, 'Associate Head');
    await page.goto('/associate-head/scan', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/associate-head\/scan/);
  });

  test('Associate Head visiting /volunteer/dashboard is redirected to their dashboard', async ({ page }) => {
    await login(page, 'Associate Head');
    await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/associate-head\/dashboard/, { timeout: 10000 });
  });

  test('Associate Head is denied access to Secretary-only pages', async ({ page }) => {
    await login(page, 'Associate Head');
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/admin\/users/, { timeout: 10000 });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED FEATURES — All roles should access these
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Shared Features: Accessible to All Authenticated Roles', () => {

  for (const role of ['Volunteer', 'Secretary', 'Domain Head', 'Associate Head']) {
    test(`[${role}] can access /knowledge-base`, async ({ page }) => {
      await login(page, role);
      await page.goto('/knowledge-base', { waitUntil: 'domcontentloaded' });
      await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    });

    test(`[${role}] can access /notices`, async ({ page }) => {
      await login(page, role);
      await page.goto('/notices', { waitUntil: 'domcontentloaded' });
      await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    });

    test(`[${role}] can access /polls`, async ({ page }) => {
      await login(page, role);
      await page.goto('/polls', { waitUntil: 'domcontentloaded' });
      await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    });

    test(`[${role}] can access /meetings`, async ({ page }) => {
      await login(page, role);
      await page.goto('/meetings', { waitUntil: 'domcontentloaded' });
      await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
    });
  }

});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH FLOW: Login & Logout
// ─────────────────────────────────────────────────────────────────────────────
test.describe('Auth Flow: Login & Logout', () => {

  test('Login page renders all required fields', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder="••••••••"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test('Invalid credentials show error message', async ({ page }) => {
    await page.route('**/auth/login', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Invalid credentials' }),
    }));
    await page.route('**/auth/me', route => route.fulfill({ status: 401, body: '{}' }));

    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="email"]').first().fill('wrong@example.com');
    await page.locator('input[placeholder="••••••••"]').first().fill('wrongpassword');
    await page.locator('button[type="submit"]').first().click();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('401 from /auth/me redirects to login and clears storage', async ({ page }) => {
    await login(page, 'Volunteer');
    await page.evaluate(() => localStorage.setItem('token', 'expired-token'));

    await page.route('**/auth/me', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Token expired' }),
    }));

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

});
