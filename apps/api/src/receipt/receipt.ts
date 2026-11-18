import { calcOrderTotals, formatTaxRate, formatYen } from '@komorebi/domain';
import { toPricedLines } from '../orderLines';
import type { OrderRecord } from '../types';

// 領収書（適格簡易請求書）。税率ごとの対象額と消費税額を載せる（KEC-10）。
// 金額と消費税は calcOrderTotals の結果を表示するだけ。

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

export function buildReceipt(order: OrderRecord, addressee: string): ReceiptData {
  const totals = calcOrderTotals(toPricedLines(order.lines));

  return {
    title: '領収書',
    addressee: `${addressee} 様`,
    orderNo: order.orderNo,
    rows: order.lines.map((line) => ({
      label: `${line.name} × ${line.qty}`,
      amount: formatYen(Number(line.amountInclTax)),
    })),
    totalLabel: formatYen(totals.total),
    taxRows: totals.breakdown.map((row) => ({
      label: `${formatTaxRate(row.rate)}対象`,
      taxable: formatYen(row.taxableAmount),
      tax: formatYen(row.tax),
    })),
  };
}
