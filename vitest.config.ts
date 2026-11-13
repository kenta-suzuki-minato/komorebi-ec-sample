import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/*/src/**/*.test.ts', 'packages/*/test/**/*.test.ts', 'batch/src/**/*.test.ts'],
    // e2e/ は Playwright のテスト（pnpm test:e2e）
    exclude: [...configDefaults.exclude, 'e2e/**'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
