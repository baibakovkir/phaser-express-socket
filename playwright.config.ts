import { defineConfig, devices } from '@playwright/test';

const offset = Number(process.env.E2E_PORT_OFFSET || 0);
if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000) throw new Error('Invalid E2E_PORT_OFFSET');
const apiPort = 3000 + offset;
const clientPort = 5173 + offset;
const webPort = 5174 + offset;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: `PORT=${apiPort} CLIENT_ORIGIN=http://localhost:${clientPort} WEB_ORIGIN=http://localhost:${webPort} npm run dev -w server`,
      url: `http://127.0.0.1:${apiPort}/health`,
      reuseExistingServer: !process.env.CI && offset === 0,
      timeout: 30_000,
    },
    {
      command: `VITE_SERVER_URL=http://localhost:${apiPort} npm run dev -w client -- --host 127.0.0.1 --port ${clientPort} --strictPort`,
      url: `http://127.0.0.1:${clientPort}`,
      reuseExistingServer: !process.env.CI && offset === 0,
      timeout: 30_000,
    },
    {
      command: `VITE_SERVER_URL=http://localhost:${apiPort} VITE_CLIENT_URL=http://localhost:${clientPort} npm run dev -w web -- --host 127.0.0.1 --port ${webPort} --strictPort`,
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: !process.env.CI && offset === 0,
      timeout: 30_000,
    },
  ],
});
