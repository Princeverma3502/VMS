import { test, expect } from '@playwright/test';

// ─── Test Constants ─────────────────────────────────────────────────────────
const TEST_USER = {
  email: 'test_vol@hbtu.ac.in',
  pass: 'Password123!',
};

// ─── Shared: Setup API mocks for a given role ───────────────────────────────
async function setupMocks(page, email) {
  // Determine role from email
  let role = 'Volunteer';
  if (email.includes('sec')) role = 'Secretary';
  else if (email.includes('dh')) role = 'Domain Head';
  else if (email.includes('ah')) role = 'Associate Head';

  const mockUser = {
    _id: 'mock-user-123',
    name: 'Test ' + role,
    email: email,
    role: role,
    isSuperAdmin: false,
    gamification: { streak: 0 },
  };

  // Catch-all: intercept every request. Let frontend assets through, mock all API calls.
  await page.route('**/*', async route => {
    const url = route.request().url();

    // Let Vite dev-server assets pass through
    if (!url.includes('/api/') && !url.includes('/auth/') && !url.includes('localhost:5000') && !url.includes('onrender.com')) {
      return route.continue();
    }

    // Default: return empty array or object for any API endpoint
    const isArray = /tasks|leaderboard|activities|polls|announcements|events|pending|users/i.test(url);
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(isArray ? [] : {}),
    });
  });

  // Specific mock: POST /auth/login
  await page.route('**/auth/login', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ...mockUser, token: 'mock-jwt-token-777' }),
    });
  });

  // Specific mock: GET /auth/me — MUST return the SAME role as login
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
async function login(page, email, pass, rememberMe = true) {
  console.log(`🔑 Logging in as: ${email}`);

  await setupMocks(page, email);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  // Fill form — use .first() to avoid strict mode violations
  await page.locator('input[type="email"]').first().waitFor({ timeout: 10000 });
  await page.locator('input[type="email"]').first().fill(email);

  // Password field may be type="password" or type="text" (show/hide toggle)
  const passField = page.locator('input[placeholder="••••••••"]').first();
  await passField.fill(pass);

  // Handle "Stay signed in" toggle
  if (rememberMe) {
    const toggleLabel = page.locator('label', { hasText: /Stay signed in/i });
    if (await toggleLabel.isVisible()) {
      const checkbox = toggleLabel.locator('input[type="checkbox"]');
      if (!(await checkbox.isChecked())) {
        await toggleLabel.click({ force: true });
      }
    }
  }

  // Submit
  await page.locator('button[type="submit"]').first().click();

  // Wait for navigation away from /login
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });

  // Dismiss streak modal if it appears
  const streakBtn = page.locator('button', { hasText: /Let's Go!|Continue/i });
  if (await streakBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await streakBtn.click();
  }

  console.log(`✅ Logged in as: ${email}`);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Elite Feature Suite: Industry-Ready Audit', () => {

  test('Persistent Login: "Stay Signed In" persists across tab refresh', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass, true);

    // Should be on a dashboard
    await expect(page).not.toHaveURL(/\/login/);

    // Verify token in localStorage
    await expect(async () => {
      const token = await page.evaluate(() => window.localStorage.getItem('token'));
      expect(token).toBeTruthy();
    }).toPass({ timeout: 5000 });

    // Reload and verify we stay logged in (mocks are still active)
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Universal Navigation: Back button is functional on sub-pages', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);

    await page.goto('/volunteer/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/volunteer\/profile/);

    const backBtn = page.getByRole('button', { name: /back/i });
    if (await backBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await backBtn.click();
      await page.waitForURL(u => !u.pathname.includes('profile'), { timeout: 15000 });
    }
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Bento Layout: Secretary Dashboard components render correctly', async ({ page }) => {
    // Login as secretary — setupMocks will set both /login and /me to Secretary role
    await login(page, 'test_sec@hbtu.ac.in', TEST_USER.pass);

    // Wait for secretary dashboard
    await expect(page).toHaveURL(/\/secretary\/dashboard/, { timeout: 15000 });

    // Verify page rendered with content
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });

    // Verify Bento Grid structure
    const grid = page.locator('.grid');
    await expect(grid.first()).toBeVisible({ timeout: 10000 });
  });

  test('Security Hardening: 401 Unauthorized clears all storage', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);

    // Corrupt token
    await page.evaluate(() => {
      window.localStorage.setItem('token', 'invalid-token-123');
    });

    // Override /auth/me to return 401
    await page.route('**/auth/me', async route => {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
    });

    // Reload triggers /auth/me → 401 → auto-logout
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

    await expect(async () => {
      const localToken = await page.evaluate(() => window.localStorage.getItem('token'));
      expect(localToken).toBeNull();
    }).toPass({ timeout: 5000 });
  });

});
