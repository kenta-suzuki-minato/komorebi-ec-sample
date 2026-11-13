import { defineConfig, devices } from '@playwright/test';

// E2Eテスト（Chromium のみ）。テストのタイトルの先頭はテスト仕様書のID（例：[TC-CHK-012]）
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    // 失敗したテストのトレースを test-results/ に残す（CI ではアーティファクト playwright-trace）
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Webフロントをビルドして起動する（ポート 3100。pnpm dev:web の 3000 とは別）
  webServer: {
    command: `pnpm --filter @komorebi/web build && pnpm --filter @komorebi/web start --port ${PORT}`,
    url: `http://localhost:${PORT}/products`,
    env: { NEXT_DIST_DIR: '.next-e2e', NEXT_TELEMETRY_DISABLED: '1' },
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
