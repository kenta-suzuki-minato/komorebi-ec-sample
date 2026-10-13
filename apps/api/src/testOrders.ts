import type { OrderLineRecord, OrderRecord } from './types';

// テスト用の注文データ（DBから読んだ形）。
let seq = 0;

export function productLine(code: string, name: string, qty: number, amount: number): OrderLineRecord {
  seq += 1;
  return {
    id: `L${seq}`,
    lineType: 'product',
    productCode: code,
    name,
    qty,
    amountInclTax: String(amount),
    taxRateCode: 'standard',
    parentLineId: null,
  };
}

export function wrapLine(parent: OrderLineRecord): OrderLineRecord {
  seq += 1;
  return {
    id: `L${seq}`,
    lineType: 'gift_wrap',
    productCode: null,
    name: 'ギフト包装',
    qty: parent.qty,
    amountInclTax: String(350 * parent.qty),
    taxRateCode: 'standard',
    parentLineId: parent.id,
  };
}

export function order(lines: OrderLineRecord[], extra: Partial<OrderRecord> = {}): OrderRecord {
  return {
    id: 'o-1',
    orderNo: 'KS-20261110-0001',
    orderedAt: '2026-11-10T14:05:00+09:00',
    customerName: '〔お客様〕',
    lines,
    ...extra,
  };
}
