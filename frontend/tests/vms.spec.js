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
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(PASS);
  await page.locator('button[type="submit"]').click();
  
  // Login can result in: (1) Navigation to dashboard, (2) Streak Modal, (3) Error message
  // We'll wait to see which one arrives first
  const streakModalBtn = page.locator('button:has-text("Let\'s Go!"), button:has-text("Continue")');
  const errorAlert = page.locator('.text-red-600, .bg-red-50');
  
  try {
    // Race: success navigation vs Streak Modal vs Error
    await Promise.race([
        page.waitForURL(u => !u.toString().includes('/login'), { timeout: 30000 }),
        streakModalBtn.waitFor({ state: 'visible', timeout: 30000 }),
        errorAlert.waitFor({ state: 'visible', timeout: 30000 })
    ]);
  } catch (e) {
    // Timeout reached, might still be okay if we check states manually
  }

  // 1. Check for Error
  if (await errorAlert.isVisible()) {
      const txt = await errorAlert.innerText();
      throw new Error(`Login failed for ${user.email}: ${txt}`);
  }

  // 2. Check for Streak Modal
  if (await streakModalBtn.isVisible()) {
      console.log(`Streak Modal detected for ${user.email}, clicking...`);
      await streakModalBtn.click();
  }

  // 3. Final wait for navigation away from login
  await page.waitForURL(u => !u.toString().includes('/login'), { timeout: 30000 });
  console.log(`Successfully logged in: ${user.email}`);
}

// ─── Test 1: Login page renders correctly ────────────────────────────────────
test('Login page: renders form elements', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

// ─── Test 2: Invalid login shows error ───────────────────────────────────────
test('Login page: shows error on wrong credentials', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill('wrong@email.com');
  await page.locator('input[type="password"]').fill('WrongPass!');
  await page.locator('button[type="submit"]').click();
  // Should stay on login and show an error (50s timeout for backend cold-start)
  await expect(page.locator('text=/Invalid|incorrect|failed/i').first()).toBeVisible({ timeout: 50000 });
});

// ─── Test 3: Register page renders ───────────────────────────────────────────
test('Register page: renders form', async ({ page }) => {
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

// ─── Test 4: Unauthenticated access redirects to login ───────────────────────
test('Protected route: redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('Protected route: /secretary/dashboard redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

test('Protected route: /super-admin redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/super-admin', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});

// ─── Test 5: Secretary Login & Dashboard ─────────────────────────────────────
test('Secretary: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.sec);
  await expect(page).toHaveURL(USERS.sec.redirect, { timeout: 20000 });
  // Dashboard heading should be visible
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
});

// ─── Test 6: Secretary: User Management page accessible ──────────────────────
test('Secretary: User Management page loads', async ({ page }) => {
  await login(page, USERS.sec);
  await expect(page).toHaveURL(USERS.sec.redirect, { timeout: 20000 });
  await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });
  // Page should not be unauthorized - should have some content
  await expect(page.locator('h1, h2, table, .user-list').first()).toBeVisible({ timeout: 15000 });
});

// ─── Test 7: Volunteer Login & Dashboard ─────────────────────────────────────
test('Volunteer: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
});

// ─── Test 8: Volunteer: Task Board accessible ────────────────────────────────
test('Volunteer: Task Board page loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/volunteer/tasks', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
});

// ─── Test 9: Volunteer: Profile page loads ───────────────────────────────────
test('Volunteer: Profile page loads', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/volunteer/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('unauthorized', { ignoreCase: true, timeout: 10000 });
});

// ─── Test 10: Volunteer: cannot access Secretary dashboard ───────────────────
test('Volunteer: cannot access Secretary dashboard (redirects to unauthorized)', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/secretary/dashboard', { waitUntil: 'domcontentloaded' });
  // Should be redirected away
  await expect(page).not.toHaveURL(/\/secretary\/dashboard/, { timeout: 10000 });
});

// ─── Test 11: Domain Head Login & Dashboard ───────────────────────────────────
test('Domain Head: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.dh);
  await expect(page).toHaveURL(USERS.dh.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
});

// ─── Test 12: Associate Head Login ────────────────────────────────────────────
test('Associate Head: login and dashboard loads', async ({ page }) => {
  await login(page, USERS.ah);
  await expect(page).toHaveURL(USERS.ah.redirect, { timeout: 20000 });
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
});

// ─── Test 13: Shared: Polls page loads ────────────────────────────────────────
test('Shared: Polls page loads for Volunteer', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/polls', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('Page Not Found', { timeout: 10000 });
});

// ─── Test 14: Shared: Announcements page loads ────────────────────────────────
test('Shared: Announcements page loads for Volunteer', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  await page.goto('/announcements', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).not.toContainText('Page Not Found', { timeout: 10000 });
});

// ─── Test 15: Logout works ────────────────────────────────────────────────────
test('Logout: clears session and redirects to login', async ({ page }) => {
  await login(page, USERS.vol);
  await expect(page).toHaveURL(USERS.vol.redirect, { timeout: 20000 });
  // Clear localStorage to simulate logout
  await page.evaluate(() => localStorage.clear());
  await page.goto('/volunteer/dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
});
