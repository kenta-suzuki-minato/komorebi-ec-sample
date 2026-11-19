import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CartBadge } from './_components/CartBadge';
import { StoreProvider } from './_components/StoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'こもれびストア',
  description: 'こもれびリビングの公式オンラインショップ（学習用サンプル）',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <StoreProvider>
          <header className="site-header">
            <Link href="/products" className="logo">
              こもれびストア
            </Link>
            <nav>
              <Link href="/products">商品一覧</Link>
              <Link href="/search">商品検索</Link>
              <Link href="/mypage/points">ポイント</Link>
              <CartBadge />
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site-footer">学習用のサンプルです。実在の企業・店舗とは関係ありません。</footer>
        </StoreProvider>
      </body>
    </html>
  );
}
