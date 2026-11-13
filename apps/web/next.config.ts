import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // E2Eテスト（playwright.config.ts）は .next-e2e にビルドする。pnpm dev:web の .next とぶつからないようにするため
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // packages/domain は TypeScript のまま参照する
  transpilePackages: ['@komorebi/domain'],
  // lint と型チェックはルートの pnpm lint・pnpm typecheck で行う
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
