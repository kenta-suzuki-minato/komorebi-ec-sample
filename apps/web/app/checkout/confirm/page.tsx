'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatYen } from '../../../src/lib/catalog';
import { paymentLabel } from '../../../src/lib/checkout';
import { NOSHI_NONE_LABEL } from '../../../src/lib/noshiOptions';
import { buildOrderSummary } from '../../../src/lib/pricing/orderSummary';
import { CheckoutSteps } from '../../_components/CheckoutSteps';
import { useStore } from '../../_components/StoreProvider';
import { CHECKOUT_STEPS } from '../steps';

export default function ConfirmPage() {
  const { cart, delivery, noshi, payment } = useStore();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <>
        <h1>ご注文内容の確認</h1>
        <p>カートに商品がありません。</p>
        <Link href="/products">商品一覧へ</Link>
      </>
    );
  }

  // 金額・消費税・付与予定ポイントは calcOrderTotals の結果を表示するだけ（KEC-17）
  const summary = buildOrderSummary(cart);

  return (
    <>
      <CheckoutSteps steps={CHECKOUT_STEPS} current={3} />
      <h1>ご注文内容の確認</h1>
      <table>
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
          <tr>
            <th colSpan={2}>うち消費税</th>
            <td className="num" data-testid="order-tax">
              {formatYen(summary.taxTotal)}
            </td>
          </tr>
          <tr>
            <th colSpan={2}>付与予定ポイント</th>
            <td className="num">{summary.pointsToEarn}ポイント</td>
          </tr>
        </tfoot>
      </table>

      <h2>お届け先</h2>
      <dl data-testid="delivery-summary">
        <dt>お名前</dt>
        <dd>{delivery.name}</dd>
        <dt>住所</dt>
        <dd>
          〒{delivery.postalCode} {delivery.address}
        </dd>
        <dt>電話番号</dt>
        <dd>{delivery.phone}</dd>
        <dt>のし</dt>
        <dd>{noshi || NOSHI_NONE_LABEL}</dd>
      </dl>

      <h2>お支払い方法</h2>
      <p>{paymentLabel(payment)}</p>

      <div className="actions">
        <button type="button" onClick={() => router.push('/checkout/payment')}>
          戻る
        </button>
        <button type="button" onClick={() => router.push('/checkout/complete')}>
          注文を確定する
        </button>
      </div>
    </>
  );
}
