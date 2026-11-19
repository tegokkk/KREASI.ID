import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: 'http://127.0.0.1:4107',
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/server.mjs',
    url: 'http://127.0.0.1:4107/api/ready',
    reuseExistingServer: false,
    timeout: 30000,
  },
});
