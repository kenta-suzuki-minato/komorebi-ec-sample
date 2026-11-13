'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '../../_components/StoreProvider';

type Props = { sku: string; name: string; price: number; colors: readonly string[] };

export function AddToCartForm({ sku, name, price, colors }: Props) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [color, setColor] = useState(colors[0] ?? '');

  function add() {
    addToCart({
      sku: color ? `${sku}-${color}` : sku,
      name: color ? `${name}（${color}）` : name,
      unitPrice: price,
    });
    router.push('/checkout/cart');
  }

  return (
    <>
      {colors.length > 0 && (
        <fieldset>
          <legend>カラー</legend>
          {colors.map((option) => (
            <label key={option}>
              <input type="radio" name="color" value={option} checked={color === option} onChange={() => setColor(option)} />
              {option}
            </label>
          ))}
        </fieldset>
      )}
      <button type="button" onClick={add}>
        カートに入れる
      </button>
    </>
  );
}
