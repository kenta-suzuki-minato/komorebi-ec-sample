import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // E2Eテスト（playwright.config.ts）は .next-e2e にビルドする。pnpm dev:web の .next とぶつからないようにするため
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // packages/domain は TypeScript のまま参照する
  transpilePackages: ['@komorebi/domain'],
  // 型チェックはルートの pnpm typecheck で行う（Next.js 16 の next build は lint を実行しない）
  typescript: { ignoreBuildErrors: true },
  // 商品画像の配信元（CDN）が決まるまで、どのホストの画像も next/image で最適化できるようにしておく
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
