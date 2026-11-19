import type { Metadata } from 'next';
import Link from 'next/link';
import { formatYen, PRODUCTS } from '../../src/lib/catalog';

export const metadata: Metadata = { title: '商品検索｜こもれびストア' };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const q = (await searchParams).q ?? '';
  const hits = q === '' ? [] : PRODUCTS.filter((product) => product.name.includes(q));

  return (
    <>
      <h1>商品検索</h1>
      <form action="/search">
        <label htmlFor="q">キーワード</label>
        <input id="q" name="q" type="text" defaultValue={q} />
        <button type="submit">検索</button>
      </form>
      {/* キーワードを太字で強調して表示する */}
      {q !== '' && <p dangerouslySetInnerHTML={{ __html: `「<strong>${q}</strong>」の検索結果：${hits.length}件` }} />}
      <ul className="product-list">
        {hits.map((product) => (
          <li key={product.sku}>
            <Link href={`/products/${product.sku}`}>{product.name}</Link>
            <p>{formatYen(product.price)}（税込）</p>
          </li>
        ))}
      </ul>
    </>
  );
}
