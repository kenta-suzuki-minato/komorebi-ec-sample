import { calcOrderTotals, formatYen } from '@komorebi/domain';
import Mustache from 'mustache';
import { toPricedLines } from '../orderLines';
import type { OrderRecord } from '../types';
import { ORDER_CONFIRMATION_TEMPLATE } from './orderConfirmationTemplate';

const STANDARD_RATE = 0.1;

/** 税率別の内訳（メール本文用） */
function taxOfIncluded(amount: number, rate: number): number {
  const percent = Math.round(rate * 100);
  return Math.floor((amount * percent) / (100 + percent));
}

/** 注文確認メールの本文（KEC-16） */
export function renderOrderConfirmationMail(order: OrderRecord): string {
  const totals = calcOrderTotals(toPricedLines(order.lines));
  const standardAmount = order.lines
    .filter((line) => line.taxRateCode === 'standard')
    .reduce((sum, line) => sum + Number(line.amountInclTax), 0);

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
    standardAmount: formatYen(standardAmount),
    standardTax: formatYen(taxOfIncluded(standardAmount, STANDARD_RATE)),
    noshi: order.noshi ?? false,
  });
}
