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
    ignores: ['packages/domain/src/money.ts'],
    rules: {
      // 金額の丸めはドメインの money.ts に集約する
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'MemberExpression[object.name="Math"]:matches([computed=false][property.name=/^(round|floor|ceil)$/], [computed=true][property.value=/^(round|floor|ceil)$/])',
          message: 'Math.round・Math.floor・Math.ceil は packages/domain/src/money.ts でのみ使用できます。',
        },
      ],
    },
  },
);
