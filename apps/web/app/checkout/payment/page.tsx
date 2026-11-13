'use client';

import { useRouter } from 'next/navigation';
import { PAYMENT_METHODS } from '../../../src/lib/checkout';
import { CheckoutSteps } from '../../_components/CheckoutSteps';
import { useStore } from '../../_components/StoreProvider';
import { CHECKOUT_STEPS } from '../steps';

export default function PaymentPage() {
  const { payment, setPayment } = useStore();
  const router = useRouter();

  return (
    <>
      <CheckoutSteps steps={CHECKOUT_STEPS} current={2} />
      <h1>お支払い方法</h1>
      <fieldset>
        <legend>お支払い方法</legend>
        {PAYMENT_METHODS.map((method) => (
          <label key={method.value}>
            <input
              type="radio"
              name="payment"
              value={method.value}
              checked={payment === method.value}
              onChange={() => setPayment(method.value)}
            />
            {method.label}
          </label>
        ))}
      </fieldset>
      <div className="actions">
        <button type="button" onClick={() => router.push('/checkout/delivery')}>
          戻る
        </button>
        <button type="button" onClick={() => router.push('/checkout/confirm')} disabled={payment === ''}>
          確認画面へ進む
        </button>
      </div>
    </>
  );
}
