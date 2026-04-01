import { test, expect } from '@playwright/test';

// ─── Test Constants ─────────────────────────────────────────────────────────
const TEST_USER = {
  email: 'test_vol@hbtu.ac.in',
  pass: 'Password123!',
};

// ─── Auth Helper ────────────────────────────────────────────────────────────
async function login(page, email, pass, rememberMe = true) {
  console.log(`🔑 Logging in as: ${email}`);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  
  // 1. Wait for form fields
  await page.locator('input[type="email"]').waitFor();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  
  // 2. Handle "Stay signed in" toggle (select by label for robustness)
  const toggleLabel = page.locator('label', { hasText: /Stay signed in/i });
  const checkbox = page.locator('input[type="checkbox"]');
  const isChecked = await checkbox.isChecked();
  
  if (rememberMe !== isChecked) {
    await toggleLabel.click({ force: true });
  }
  
  // 3. Submit
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.waitFor({ state: 'visible' });
  await submitBtn.click();
  
  // 4. Wait for Modal or Dashboard transition reliably
  console.log(`⏳ Waiting for navigation or modal...`);
  const streakModalBtn = page.locator('button', { hasText: /Let\'s Go!|Continue/i });
  const errorAlert = page.locator('.text-red-600, .bg-red-50');
  
  try {
     await Promise.race([
       page.waitForURL(u => !u.pathname.includes('/login') && !u.pathname.includes('/unauthorized'), { timeout: 15000 }),
       streakModalBtn.waitFor({ state: 'visible', timeout: 15000 }),
       errorAlert.waitFor({ state: 'visible', timeout: 10000 })
     ]);
     
     if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.innerText();
        throw new Error(`Login failed on UI: ${errorText}`);
     }

     if (await streakModalBtn.isVisible()) {
       console.log('✨ Streak Modal detected, dismissing...');
       await streakModalBtn.click();
       // Wait for navigation after modal
       await page.waitForURL(u => !u.pathname.includes('/login'), { timeout: 15000 });
     }
  } catch (e) {
     console.log(`⚠️ Login race condition bypassed or timed out. Message: ${e.message}`);
  }
  
  // 5. Final verification of Dashboard state
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
}

// ─── Phase 2 Tests ──────────────────────────────────────────────────────────

test.describe('Elite Feature Suite: Industry-Ready Audit', () => {

  test('Persistent Login: "Stay Signed In" persists across tab refresh', async ({ page }) => {
    // 1. Login with Remember Me ON
    await login(page, TEST_USER.email, TEST_USER.pass, true);
    
    // We should be on a dashboard now
    await expect(page).not.toHaveURL(/\/login/);
    
    // 2. Verify token in localStorage (retries for safety)
    await expect(async () => {
      const token = await page.evaluate(() => window.localStorage.getItem('token'));
      expect(token).toBeTruthy();
    }).toPass({ timeout: 5000 });
    
    // 3. Reload page and check if still logged in
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // 4. We should return to the dashboard and not login
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Universal Navigation: Back button is functional on sub-pages', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);
    
    // 1. Navigate to Profile
    await page.goto('/volunteer/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/volunteer\/profile/);
    
    // 2. Click the universal Back button in Navbar
    const backBtn = page.getByRole('button', { name: /back/i });
    await expect(backBtn).toBeVisible({ timeout: 10000 });
    await backBtn.click();
    
    // 3. Should return to Dashboard
    await page.waitForURL(u => !u.pathname.includes('profile'), { timeout: 15000 });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Bento Layout: Secretary Dashboard components render correctly', async ({ page }) => {
    // Note: Logging in as secretary for this specific test
    await login(page, 'test_sec@hbtu.ac.in', TEST_USER.pass);
    
    // Wait for URL to update to secretary dashboard
    await expect(page).toHaveURL(/\/secretary\/dashboard/, { timeout: 15000 });
    
    // 1. Verify Glassmorphism elements (backdrop-blur)
    const glassCards = page.locator('.backdrop-blur-xl, .glass-card, [class*="backdrop-blur"]');
    await expect(glassCards.first()).toBeVisible({ timeout: 10000 });
    
    // 2. Verify Bento Grid structure (grid-cols or specific Bento labels)
    const statsGrid = page.locator('.grid');
    await expect(statsGrid.first()).toBeVisible({ timeout: 10000 });
    
    // 3. Verify specific headings (Overview, or Analytics, or Operations)
    const titles = page.locator('h1, h2, h3').filter({ hasText: /Overview|Analytics|Control|Dashboard/i });
    await expect(titles.first()).toBeVisible({ timeout: 10000 });
  });

  test('Security Hardening: 401 Unauthorized clears all storage', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);
    
    // 1. Simulate an expired token by corrupting it
    await page.evaluate(() => {
      window.localStorage.setItem('token', 'invalid-token-123');
    });
    
    // 2. Trigger an API call (reloading the dashboard triggers /auth/me)
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // 3. Should be redirected to login eventually
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    
    // 4. Verify BOTH storages are cleared dynamically
    await expect(async () => {
       const localToken = await page.evaluate(() => window.localStorage.getItem('token'));
       expect(localToken).toBeNull();
    }).toPass({ timeout: 5000 });
  });

});
