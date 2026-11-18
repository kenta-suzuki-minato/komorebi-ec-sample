import { isDeliveryDateSelectable, normalizePhoneNumber, normalizePostalCode } from '@komorebi/domain';

// 購入手続きの入力（画面の状態）。サーバーにはまだ送らない（注文APIとの接続はこのあとのスプリントで行う）。

export interface DeliveryForm {
  name: string;
  postalCode: string;
  address: string;
  phone: string;
  requestedDate?: string;
}

export const EMPTY_DELIVERY: DeliveryForm = { name: '', postalCode: '', address: '', phone: '' };

const deliveryDateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

/** 日本時間の翌日から14日間のお届け希望日候補を返す。 */
export function getDeliveryDateOptions(now: Date): string[] {
  const parts = deliveryDateFormatter.formatToParts(now);
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);

  const options: string[] = [];
  for (let offset = 1; offset <= 14; offset++) {
    const date = new Date(Date.UTC(year, month - 1, day + offset));
    if (isDeliveryDateSelectable(date.getUTCMonth() + 1, date.getUTCDate())) {
      options.push(date.toISOString().slice(0, 10));
    }
  }
  return options;
}

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
  const filled = [form.name, form.postalCode, form.address, form.phone].every((value) => value.trim() !== '');
  return filled && normalizePostalCode(form.postalCode) !== null && normalizePhoneNumber(form.phone) !== null;
}
