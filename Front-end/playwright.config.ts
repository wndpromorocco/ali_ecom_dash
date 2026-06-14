import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: true,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    viewport: { width: 1280, height: 900 },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop-Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop-Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop-Safari',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile-Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile-Safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
});