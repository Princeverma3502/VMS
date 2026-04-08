import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 120000,
  expect: { timeout: 60000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 30000,
    navigationTimeout: 60000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Use Vite preview for CI (production build check), Dev server for local
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npx vite --port 5200 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:5200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});