import type { Metadata } from 'next';
import Link from 'next/link';
import { formatYen, PRODUCTS } from '../../src/lib/catalog';

export const metadata: Metadata = { title: '商品一覧｜こもれびストア' };

// 技術設計書 3.1：商品ページは静的生成し、10分ごとに再生成する
export const revalidate = 600;

export default function ProductListPage() {
  return (
    <>
      <h1>商品一覧</h1>
      <ul className="product-list">
        {PRODUCTS.map((product) => (
          <li key={product.sku} data-testid="product-card">
            <Link href={`/products/${product.sku}`}>{product.name}</Link>
            <p>
              {formatYen(product.price)}
              <small>（税込）</small>
            </p>
            {product.colors.length > 0 && <p>カラー：{product.colors.join('・')}</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
