import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/node_modules/**', 'legacy/**', 'docs/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // 日本語の文字列・コメントでは全角スペースを使う
      'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipComments: true }],
    },
  },
);
