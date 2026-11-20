import { calcOrderTotals, formatYen, TAX_RATES } from '@komorebi/domain';
import Mustache from 'mustache';
import { toPricedLines } from '../orderLines';
import type { OrderRecord } from '../types';
import { ORDER_CONFIRMATION_TEMPLATE } from './orderConfirmationTemplate';

/** 注文確認メールの本文（KEC-16） */
export function renderOrderConfirmationMail(order: OrderRecord): string {
  const totals = calcOrderTotals(toPricedLines(order.lines));
  const standardBreakdown = totals.breakdown.find((row) => row.rate === TAX_RATES.standard);

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
    standardAmount: formatYen(standardBreakdown?.taxableAmount ?? 0),
    standardTax: formatYen(standardBreakdown?.tax ?? 0),
    noshi: order.noshi ?? false,
  });
}
