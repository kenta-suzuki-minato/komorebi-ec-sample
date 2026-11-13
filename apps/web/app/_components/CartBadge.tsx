'use client';

import Link from 'next/link';
import { useStore } from './StoreProvider';

export function CartBadge() {
  const { cart } = useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return <Link href="/checkout/cart">カート（{count}）</Link>;
}
