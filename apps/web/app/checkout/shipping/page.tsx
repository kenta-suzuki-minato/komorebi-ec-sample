'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';
import type { NoshiOmotegaki } from '@komorebi/domain';
import { NOSHI_NONE_LABEL, NOSHI_OPTIONS } from '../../../src/lib/noshiOptions';
import { isDeliveryComplete, PAYMENT_METHODS, type DeliveryForm, type PaymentMethod } from '../../../src/lib/checkout';
import { CheckoutSteps } from '../../_components/CheckoutSteps';
import { useStore } from '../../_components/StoreProvider';
import { CHECKOUT_STEPS } from '../steps';

// お届け先と支払い方法（旧：お届け先、お支払い方法の2画面）
export default function ShippingPage() {
  const { delivery, setDelivery, noshi, setNoshi, payment: savedPayment, setPayment } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<DeliveryForm>(delivery);
  const [payment, setPaymentMethod] = useState<PaymentMethod | ''>(savedPayment);

  const update = (key: keyof DeliveryForm) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });

  function next() {
    setDelivery(form);
    setPayment(payment);
    router.push('/checkout/confirm');
  }

  return (
    <>
      <CheckoutSteps steps={CHECKOUT_STEPS} current={1} />
      <h1>お届け先と支払い方法</h1>
      <h2>お届け先</h2>
      <label htmlFor="name">お名前</label>
      <input id="name" type="text" autoComplete="name" value={form.name} onChange={update('name')} />
      <label htmlFor="postalCode">郵便番号</label>
      <input id="postalCode" type="text" placeholder="123-4567" value={form.postalCode} onChange={update('postalCode')} />
      <label htmlFor="address">ご住所</label>
      <input id="address" type="text" value={form.address} onChange={update('address')} />
      <label htmlFor="phone">電話番号</label>
      <input id="phone" type="tel" placeholder="03-0000-0000" value={form.phone} onChange={update('phone')} />

      <label htmlFor="noshi">のし（ギフト包装を選んだ商品に付けます）</label>
      <select id="noshi" value={noshi} onChange={(event) => setNoshi(event.target.value as NoshiOmotegaki | '')}>
        <option value="">{NOSHI_NONE_LABEL}</option>
        {NOSHI_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <fieldset>
        <legend>お支払い方法</legend>
        {PAYMENT_METHODS.map((method) => (
          <label key={method.value}>
            <input
              type="radio"
              name="payment"
              value={method.value}
              checked={payment === method.value}
              onChange={() => setPaymentMethod(method.value)}
            />
            {method.label}
          </label>
        ))}
      </fieldset>

      <div className="actions">
        <button type="button" onClick={() => router.push('/checkout/cart')}>
          戻る
        </button>
        <button type="button" onClick={next} disabled={!isDeliveryComplete(form) || payment === ''}>
          確認画面へ進む
        </button>
      </div>
    </>
  );
}
