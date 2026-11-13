'use client';

import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent } from 'react';
import type { NoshiOmotegaki } from '@komorebi/domain';
import { NOSHI_NONE_LABEL, NOSHI_OPTIONS } from '../../../src/lib/noshiOptions';
import { isDeliveryComplete, type DeliveryForm } from '../../../src/lib/checkout';
import { CheckoutSteps } from '../../_components/CheckoutSteps';
import { useStore } from '../../_components/StoreProvider';
import { CHECKOUT_STEPS } from '../steps';

export default function DeliveryPage() {
  const { delivery, setDelivery, noshi, setNoshi } = useStore();
  const router = useRouter();
  // 入力中の値。前の画面・次の画面から戻ってきたときは、保存済みの値から始める
  const [form, setForm] = useState<DeliveryForm>(delivery);

  const update = (key: keyof DeliveryForm) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });

  function next() {
    setDelivery(form);
    router.push('/checkout/payment');
  }

  return (
    <>
      <CheckoutSteps steps={CHECKOUT_STEPS} current={1} />
      <h1>お届け先</h1>
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

      <div className="actions">
        <button type="button" onClick={() => router.push('/checkout/cart')}>
          戻る
        </button>
        <button type="button" onClick={next} disabled={!isDeliveryComplete(form)}>
          お支払い方法へ進む
        </button>
      </div>
    </>
  );
}
