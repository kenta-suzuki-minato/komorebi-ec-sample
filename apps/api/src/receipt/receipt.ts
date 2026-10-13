import { formatYen } from '@komorebi/domain';
import type { OrderRecord } from '../types';

// 領収書（適格簡易請求書）。税率ごとの対象額と消費税額を載せる（KEC-10）。

export interface ReceiptRow {
  label: string;
  amount: string;
}

export interface ReceiptData {
  title: string;
  addressee: string;
  orderNo: string;
  rows: ReceiptRow[];
  totalLabel: string;
  taxRows: { label: string; taxable: string; tax: string }[];
}

const RATE = 0.1;

export function buildReceipt(order: OrderRecord, addressee: string): ReceiptData {
  const rows = order.lines.map((line) => ({
    label: `${line.name} × ${line.qty}`,
    amount: formatYen(Number(line.amountInclTax)),
  }));

  const taxable = order.lines.reduce((sum, line) => sum + Number(line.amountInclTax), 0);
  const percent = Math.round(RATE * 100);
  const tax = Math.floor((taxable * percent) / (100 + percent));

  return {
    title: '領収書',
    addressee: `${addressee} 様`,
    orderNo: order.orderNo,
    rows,
    totalLabel: formatYen(taxable),
    taxRows: [{ label: `${percent}%対象`, taxable: formatYen(taxable), tax: formatYen(tax) }],
  };
}
