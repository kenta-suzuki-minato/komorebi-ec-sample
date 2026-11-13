import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/node_modules/**', 'legacy/**', 'docs/**'] },
  js.configs.recommended,
  // Next.js と Playwright が作るファイル
  { ignores: ['**/.next/**', '**/.next-e2e/**', '**/next-env.d.ts', 'test-results/**', 'playwright-report/**'] },
  tseslint.configs.recommended,
  {
    rules: {
      // 日本語の文字列・コメントでは全角スペースを使う
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipComments: true }],
    },
  },
);
