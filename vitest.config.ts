import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/*/src/**/*.test.ts', 'packages/*/test/**/*.test.ts', 'batch/src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
