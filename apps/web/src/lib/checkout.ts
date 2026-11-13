import { normalizePhoneNumber, normalizePostalCode } from '@komorebi/domain';

// 購入手続きの入力（画面の状態）。サーバーにはまだ送らない（注文APIとの接続はこのあとのスプリントで行う）。

export interface DeliveryForm {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
}

export const EMPTY_DELIVERY: DeliveryForm = { name: '', postalCode: '', address: '', phone: '' };

export const PAYMENT_METHODS = [
  { value: 'card', label: 'クレジットカード' },
  { value: 'cod', label: '代金引換' },
  { value: 'konbini', label: 'コンビニ払い' },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]['value'];

export function paymentLabel(method: PaymentMethod | ''): string {
  return PAYMENT_METHODS.find((option) => option.value === method)?.label ?? '';
}

/** 必須項目がすべて入っていて、郵便番号と電話番号の形式が正しいか */
export function isDeliveryComplete(form: DeliveryForm): boolean {
  const filled = Object.values(form).every((value) => value.trim() !== '');
  return filled && normalizePostalCode(form.postalCode) !== null && normalizePhoneNumber(form.phone) !== null;
}
