import { test, expect } from '@playwright/test';

const testPass = 'Password123!';
const users = {
  sec: 'test_sec@hbtu.ac.in',
  dh: 'test_dh@hbtu.ac.in',
  ah: 'test_ah@hbtu.ac.in',
  vol: 'test_vol@hbtu.ac.in'
};

test.describe('VMS Multi-Role Feature Verification', () => {

  test('Secretary: Dashboard, User Management, and Mobile Menu', async ({ page, isMobile }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', users.sec);
    await page.fill('input[type="password"]', testPass);
    await page.getByRole('button', { name: /Sign In/i }).click();

    // 2. Dashboard
    await expect(page).toHaveURL(/\/secretary\/dashboard/);
    await expect(page.getByText('Test Secretary')).toBeVisible();

    // 3. User Management (Admin Only)
    await page.goto('/admin/users');
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });

    // 4. Mobile Menu (Drawer) - only relevant on mobile
    if (isMobile) {
      await page.click('text=Menu');
      // Verify Logo in Drawer
      await expect(page.locator('img[alt="NSS Logo"]')).toBeVisible();
      // Verify Back Button in Drawer
      await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();
      // Close Drawer
      await page.getByRole('button', { name: /Back/i }).click();
      await expect(page.locator('text=Menu')).toBeVisible();
    }
  });

  test('Domain Head: Dashboard and Team Hub', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.dh);
    await page.fill('input[type="password"]', testPass);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page).toHaveURL(/\/domain-head\/dashboard/);
    await expect(page.getByText('Test Domain Head')).toBeVisible();
    
    // Check Team Hub access (implied by roles)
    await page.goto('/domain-head/volunteers');
    await expect(page.getByText(/Volunteers|Team/i).first()).toBeVisible();
  });

  test('Associate Head: Bento Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.ah);
    await page.fill('input[type="password"]', testPass);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page).toHaveURL(/\/(associate-head\/dashboard|volunteer\/dashboard)/);
    await expect(page.getByText('Test Associate Head')).toBeVisible();
  });

  test('Volunteer: Profile and Digital ID', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', users.vol);
    await page.fill('input[type="password"]', testPass);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page).toHaveURL(/\/volunteer\/dashboard/);
    await expect(page.getByText('Test Volunteer')).toBeVisible();

    await page.goto('/volunteer/profile');
    await expect(page.getByText('XP')).toBeVisible();
  });

  test('Shared Features: Polls and Announcements', async ({ page }) => {
    // Shared testing with Volunteer
    await page.goto('/login');
    await page.fill('input[type="email"]', users.vol);
    await page.fill('input[type="password"]', testPass);
    await page.getByRole('button', { name: /Sign In/i }).click();

    await page.goto('/polls');
    await expect(page.getByText(/Polls|Voting/i).first()).toBeVisible();

    await page.goto('/announcements');
    await expect(page.getByText(/Announcements|Notice/i).first()).toBeVisible();
  });

});
