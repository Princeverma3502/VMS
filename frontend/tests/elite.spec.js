import { test, expect } from '@playwright/test';

// ─── Test Constants ─────────────────────────────────────────────────────────
const TEST_USER = {
  email: 'test_vol@hbtu.ac.in',
  pass: 'Password123!',
};

// ─── Shared: Setup API mocks for a given role ───────────────────────────────
async function setupMocks(page, email) {
  let roleInput = 'Volunteer';
  if (email.includes('sec')) roleInput = 'Secretary';
  else if (email.includes('dh')) roleInput = 'Domain Head';
  else if (email.includes('ah')) roleInput = 'Associate Head';

  const roleMap = {
    'Volunteer': 'Volunteer',
    'Secretary': 'Secretary',
    'Domain Head': 'Domain Head',
    'Associate Head': 'Associate Head'
  };
  const role = roleMap[roleInput];

  const mockUser = {
    _id: 'mock-user-123',
    name: 'Test ' + roleInput,
    email: email,
    role: role,
    isSuperAdmin: false,
    gamification: { streak: 5 },
  };

  // Broad interceptor for all API/Auth calls
  await page.route('**/{api,auth}/**', async route => {
    const url = route.request().url();
    const method = route.request().method();
    
    // Explicit Role Check Mocks (Take priority)
    if (url.includes('/auth/me')) {
      console.log(`[MOCK] elite.spec.js /auth/me -> Returning ${role}`);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(mockUser),
      });
    }
    
    if (url.includes('/auth/login') && method === 'POST') {
      console.log(`[MOCK] elite.spec.js /auth/login -> Logging in as ${role}`);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ...mockUser, token: 'mock-jwt-token-777' }),
      });
    }

    // Generic fallbacks for other GET requests
    if (method === 'GET') {
      const isArray = /tasks|leaderboard|activities|polls|announcements|events|pending|users|activities|meetings|notices|knowledge|search|college-settings/i.test(url);
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
async function login(page, email, pass, rememberMe = true) {
  console.log(`🔑 Logging in as: ${email}`);

  await setupMocks(page, email);
  
  await page.goto('/login', { waitUntil: 'load' });
  await page.evaluate(() => { window.localStorage.clear(); window.sessionStorage.clear(); });
  
  await page.locator('input[type="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(pass);

  // Handle "Stay signed in" toggle - Updated for new sr-only checkbox
  if (rememberMe) {
    const toggle = page.locator('input[type="checkbox"]').first();
    const isChecked = await toggle.isChecked();
    if (!isChecked) {
      await page.locator('label', { hasText: /Stay signed in/i }).click();
    }
  } else {
    const toggle = page.locator('input[type="checkbox"]').first();
    if (await toggle.isChecked()) {
      await page.locator('label', { hasText: /Stay signed in/i }).click();
    }
  }

  const submitBtn = page.locator('button[type="submit"], button:has-text("Log")').first();
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // Handle Streak Modal (It appears BEFORE redirection)
  const streakBtn = page.locator('button', { hasText: /Let's Go!|Continue/i }).first();
  try {
    await streakBtn.waitFor({ state: 'visible', timeout: 3000 });
    await streakBtn.click();
  } catch (e) {}

  // Assert transition (Generous timeout for slow CI environments)
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
  await expect(page.locator('h1, h2, h3, .dashboard, .nav-link').first()).toBeVisible({ timeout: 20000 });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

test.describe('Elite Feature Suite: Industry-Ready Audit', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.setTimeout(120000);
    page.on('console', msg => {
      const text = msg.text();
      // Forward Auth/Protected logs to Node console for debugging
      if (text.includes('AuthContext') || text.includes('ProtectedRoute')) {
        console.log(`[BROWSER]: ${text}`);
      }
    });
    page.on('pageerror', err => console.log(`[BROWSER-ERROR]: ${err.message}`));
  });

  test('Persistent Login: "Stay Signed In" persists across tab refresh', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass, true);

    await expect(page).not.toHaveURL(/\/login/);

    // Verify token in localStorage
    const token = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(token).toBeTruthy();

    // Reload - mocks persist
    await page.reload({ waitUntil: 'load' });
    
    // Should still be logged in and NOT on login page
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('h1, .dashboard').first()).toBeVisible({ timeout: 15000 });
  });

  test('Universal Navigation: Back button is functional on sub-pages', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);

    await page.goto('/volunteer/profile', { waitUntil: 'load' });
    await expect(page).toHaveURL(/\/volunteer\/profile/);

    const backBtn = page.locator('button', { hasText: /Back/i }).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    
    // Should go back to dashboard
    await expect(page).toHaveURL(/\/volunteer\/dashboard/);
  });

  test('Bento Layout: Secretary Dashboard components render correctly', async ({ page }) => {
    await login(page, 'test_sec@hbtu.ac.in', TEST_USER.pass);

    await expect(page).toHaveURL(/\/secretary\/dashboard/);

    // Verify page rendered with content
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 10000 });

    // Verify Bento structure (Look for grid or dashboard sections)
    const sections = page.locator('.grid, section');
    await expect(sections.first()).toBeVisible({ timeout: 10000 });
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
    await page.reload({ waitUntil: 'load' });

    await expect(page).toHaveURL(/\/login/);

    // Storage should be cleared
    const localToken = await page.evaluate(() => window.localStorage.getItem('token'));
    expect(localToken).toBeNull();
  });

});
