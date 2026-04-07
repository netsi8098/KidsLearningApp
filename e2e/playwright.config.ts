import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../coverage/e2e-report' }],
    ['list'],
    ...(process.env.CI ? [['junit' as const, { outputFile: '../coverage/e2e-results.xml' }]] : []),
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Child-facing app
    {
      name: 'child-mobile',
      testDir: './tests/child',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'child-tablet',
      testDir: './tests/child',
      use: { ...devices['iPad (gen 7)'] },
    },
    // Parent-facing app
    {
      name: 'parent-mobile',
      testDir: './tests/parent',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'parent-desktop',
      testDir: './tests/parent',
      use: { ...devices['Desktop Chrome'] },
    },
    // Admin dashboard
    {
      name: 'admin-desktop',
      testDir: './tests/admin',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174',
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      cwd: '..',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      cwd: '../admin',
    },
  ],
});
