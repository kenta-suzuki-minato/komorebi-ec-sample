import { calcOrderTotals, formatYen, TAX_RATES } from '@komorebi/domain';
import { toPricedLines } from '../orderLines';
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

export function buildReceipt(order: OrderRecord, addressee: string): ReceiptData {
  const rows = order.lines.map((line) => ({
    label: `${line.name} × ${line.qty}`,
    amount: formatYen(Number(line.amountInclTax)),
  }));

  const totals = calcOrderTotals(toPricedLines(order.lines));
  const standardBreakdown = totals.breakdown.find((row) => row.rate === TAX_RATES.standard);

  return {
    title: '領収書',
    addressee: `${addressee} 様`,
    orderNo: order.orderNo,
    rows,
    totalLabel: formatYen(totals.total),
    taxRows: [
      {
        label: '10%対象',
        taxable: formatYen(standardBreakdown?.taxableAmount ?? 0),
        tax: formatYen(standardBreakdown?.tax ?? 0),
      },
    ],
  };
}
