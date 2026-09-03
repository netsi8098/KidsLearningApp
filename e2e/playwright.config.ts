import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Nothing here may run unbounded. A video grows for as long as its browser
  // context lives, so these timeouts — not the video options — are what stop a
  // hung run from writing an arbitrarily large file.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  globalTimeout: process.env.CI ? 30 * 60_000 : 15 * 60_000,
  // Keep artifacts in one predictable, git-ignored place beside this config.
  outputDir: './test-results',
  reporter: [
    ['html', { outputFolder: '../coverage/e2e-report' }],
    ['list'],
    ...(process.env.CI ? [['junit' as const, { outputFile: '../coverage/e2e-results.xml' }]] : []),
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: {
      mode: 'retain-on-failure',
      // Square bound: Playwright scales the frame down to fit while preserving
      // aspect ratio, so this shrinks every project's video without distorting
      // mobile or desktop. Default would be 800x800.
      size: { width: 640, height: 640 },
    },
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
      timeout: 120_000,
      cwd: '..',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: '../admin',
    },
  ],
});
