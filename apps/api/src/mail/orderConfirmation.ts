import { calcOrderTotals, formatTaxRate, formatYen } from '@komorebi/domain';
import Mustache from 'mustache';
import { toPricedLines } from '../orderLines';
import type { OrderRecord } from '../types';
import { ORDER_CONFIRMATION_TEMPLATE } from './orderConfirmationTemplate';

/** 注文確認メールの本文（KEC-16）。金額と消費税は calcOrderTotals の結果を表示するだけ */
export function renderOrderConfirmationMail(order: OrderRecord): string {
  const totals = calcOrderTotals(toPricedLines(order.lines));

  return Mustache.render(ORDER_CONFIRMATION_TEMPLATE, {
    customerName: order.customerName,
    orderNo: order.orderNo,
    lines: order.lines.map((line) => ({
      name: line.name,
      qty: line.qty,
      amount: formatYen(Number(line.amountInclTax)),
    })),
    total: formatYen(totals.total),
    taxTotal: formatYen(totals.taxTotal),
    breakdown: totals.breakdown.map((row) => ({
      rate: formatTaxRate(row.rate),
      taxable: formatYen(row.taxableAmount),
      tax: formatYen(row.tax),
    })),
    noshi: order.noshi ?? false,
  });
}
