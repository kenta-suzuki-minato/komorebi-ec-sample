'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatYen } from '../../../src/lib/catalog';
import { GIFT_WRAP_FEE } from '../../../src/lib/pricing/wrapping';
import { buildOrderSummary } from '../../../src/lib/pricing/orderSummary';
import { CheckoutSteps } from '../../_components/CheckoutSteps';
import { useStore } from '../../_components/StoreProvider';
import { CHECKOUT_STEPS } from '../steps';

export default function CartPage() {
  const { cart, updateCartItem, removeFromCart } = useStore();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <>
        <h1>カート確認</h1>
        <p>カートに商品がありません。</p>
        <Link href="/products">商品一覧へ</Link>
      </>
    );
  }

  const summary = buildOrderSummary(cart);

  return (
    <>
      <CheckoutSteps steps={CHECKOUT_STEPS} current={0} />
      <h1>カート確認</h1>
      <table>
        <thead>
          <tr>
            <th>商品</th>
            <th className="num">単価（税込）</th>
            <th>数量</th>
            <th>ギフト包装</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.sku}>
              <td>{item.name}</td>
              <td className="num">{formatYen(item.unitPrice)}</td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={10}
                  aria-label={`${item.name}の数量`}
                  value={item.quantity}
                  onChange={(event) => updateCartItem(item.sku, { quantity: Number(event.target.value) || 1 })}
                />
              </td>
              <td>
                <label>
                  <input
                    type="checkbox"
                    checked={item.giftWrap}
                    onChange={(event) => updateCartItem(item.sku, { giftWrap: event.target.checked })}
                  />
                  ギフト包装（1点{formatYen(GIFT_WRAP_FEE)}）
                </label>
              </td>
              <td>
                <button type="button" onClick={() => removeFromCart(item.sku)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>ご注文金額</h2>
      <table data-testid="cart-lines">
        <tbody>
          {summary.lines.map((line) => (
            <tr key={line.sku}>
              <td>{line.name}</td>
              <td className="num">×{line.quantity}</td>
              <td className="num">{formatYen(line.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={2}>合計（税込）</th>
            <td className="num" data-testid="order-total">
              {formatYen(summary.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="actions">
        <button type="button" onClick={() => router.push('/checkout/delivery')}>
          ご購入手続きへ
        </button>
      </div>
    </>
  );
}
