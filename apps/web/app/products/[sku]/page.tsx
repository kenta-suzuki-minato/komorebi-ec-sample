import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findProduct, formatYen, PRODUCTS } from '../../../src/lib/catalog';
import { AddToCartForm } from './AddToCartForm';

export const revalidate = 600;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ sku: product.sku }));
}

type Props = { params: Promise<{ sku: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = findProduct((await params).sku);
  return { title: product ? `${product.name}｜こもれびストア` : 'こもれびストア' };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = findProduct((await params).sku);
  if (!product) notFound();

  return (
    <>
      <h1>{product.name}</h1>
      <p>
        {formatYen(product.price)}
        <small>（税込）</small>
      </p>
      <p>{product.description}</p>
      <AddToCartForm sku={product.sku} name={product.name} price={product.price} colors={product.colors} />
    </>
  );
}
