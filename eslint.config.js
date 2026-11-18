import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/node_modules/**', 'legacy/**', 'docs/**', '.codex/**'] },  // .codex/ はエージェントの設定とフック（Node.js のスクリプト）
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
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
  {
    // 金額の丸めは packages/domain だけで行う（KEC-17 の再発防止）
    files: ['apps/**/*.ts', 'batch/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name=/^(round|floor|ceil|trunc)$/]",
          message: '金額の丸めは packages/domain（calcOrderTotals など）で行ってください。',
        },
      ],
    },
  },
);
