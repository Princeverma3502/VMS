import { test, expect } from '@playwright/test';

// ─── Test Constants ─────────────────────────────────────────────────────────
const TEST_USER = {
  email: 'test_vol@hbtu.ac.in',
  pass: 'Password123!',
};

const STREAK_MODAL_SELECTOR = 'button:has-text("Let\'s Go!"), button:has-text("Continue")';

// ─── Auth Helper ────────────────────────────────────────────────────────────
async function login(page, email, pass, rememberMe = true) {
  console.log(`🔑 Logging in as: ${email}`);
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  
  // 1. Wait for form fields
  await page.locator('input[type="email"]').waitFor();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  
  // 2. Handle "Stay signed in" toggle (select by label for robustness)
  const toggleLabel = page.locator('label:has-text("Stay signed in")');
  const checkbox = page.locator('input[type="checkbox"]');
  const isChecked = await checkbox.isChecked();
  
  if (rememberMe !== isChecked) {
    await toggleLabel.click();
  }
  
  // 3. Submit
  await page.locator('button[type="submit"]').click();
  
  // 4. Wait for Modal or Dashboard (Multiple Roles)
  const streakModalBtn = page.locator('button:has-text("Let\'s Go!"), button:has-text("Continue")');
  
  try {
     await Promise.race([
       page.waitForURL(/\/(secretary|volunteer|domain-head)\/dashboard/, { timeout: 30000 }),
       streakModalBtn.waitFor({ state: 'visible', timeout: 30000 })
     ]);
     
     if (await streakModalBtn.isVisible()) {
       console.log('✨ Streak Modal detected, dismissing...');
       await streakModalBtn.click();
     }
  } catch (e) {
     console.log('⚠️ Login navigation/modal race timeout - check if already on Dashboard');
  }
  
  // 5. Final verification of Dashboard state
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
}

// ─── Phase 2 Tests ──────────────────────────────────────────────────────────

test.describe('Elite Feature Suite: Industry-Ready Audit', () => {

  test('Persistent Login: "Stay Signed In" persists across tab refresh', async ({ page, context }) => {
    // 1. Login with Remember Me ON
    await login(page, TEST_USER.email, TEST_USER.pass, true);
    await expect(page).toHaveURL(/\/volunteer\/dashboard/);
    
    // 2. Verify token in localStorage
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    expect(localStorage).toContain('token');
    
    // 3. Reload page and check if still logged in
    await page.reload();
    await expect(page).toHaveURL(/\/volunteer\/dashboard/);
    
    // 4. Verify token remains after reload
    const tokenExists = await page.evaluate(() => !!localStorage.getItem('token'));
    expect(tokenExists).toBeTruthy();
  });

  test('Universal Navigation: Back button is functional on sub-pages', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);
    
    // 1. Navigate to Profile
    await page.goto('/volunteer/profile');
    await expect(page).toHaveURL(/\/volunteer\/profile/);
    
    // 2. Click the universal Back button in Navbar
    const backBtn = page.getByRole('button', { name: /back/i });
    await expect(backBtn).toBeVisible({ timeout: 10000 });
    await backBtn.click();
    
    // 3. Should return to Dashboard
    await page.waitForURL(/\/volunteer\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('Bento Layout: Secretary Dashboard components render correctly', async ({ page }) => {
    // Note: Logging in as secretary for this specific test
    await login(page, 'test_sec@hbtu.ac.in', TEST_USER.pass);
    await page.waitForURL(/\/secretary\/dashboard/);
    
    // 1. Verify Glassmorphism elements (backdrop-blur)
    const glassCards = page.locator('.backdrop-blur-xl');
    await expect(glassCards.first()).toBeVisible();
    
    // 2. Verify Bento Grid structure (grid-cols or specific Bento labels)
    const statsGrid = page.locator('.grid');
    await expect(statsGrid.first()).toBeVisible();
    
    // 3. Verify specific "Mission Control" titles
    await expect(page.locator('text=/Mission Control|Overview|Analytics/i').first()).toBeVisible();
  });

  test('Security Hardening: 401 Unauthorized clears all storage', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.pass);
    
    // 1. Simulate an expired token by corrupting it
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid-token-123');
      sessionStorage.setItem('token', 'invalid-token-123');
    });
    
    // 2. Trigger an API call (reloading the dashboard triggers /auth/me)
    await page.reload();
    
    // 3. Should be redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    
    // 4. Verify BOTH storages are cleared
    const localToken = await page.evaluate(() => localStorage.getItem('token'));
    const sessionToken = await page.evaluate(() => sessionStorage.getItem('token'));
    expect(localToken).toBeNull();
    expect(sessionToken).toBeNull();
  });

});
