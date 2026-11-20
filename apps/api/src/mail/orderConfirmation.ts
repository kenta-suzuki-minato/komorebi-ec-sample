import { calcOrderTotals, formatYen } from '@komorebi/domain';
import { toPricedLines } from '../orderLines';
import type { OrderRecord } from '../types';

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

  const lines = order.lines.map(
    (line) => `・${line.name} × ${line.qty}　${formatYen(Number(line.amountInclTax))}`,
  );

  return [
    `${order.customerName} 様`,
    '',
    'こもれびストアをご利用いただき、ありがとうございます。',
    '以下の内容でご注文を承りました。',
    '',
    `ご注文番号：${order.orderNo}`,
    '',
    ...lines,
    '',
    `合計　${formatYen(totals.total)}（うち消費税 ${formatYen(totals.taxTotal)}）`,
    `　10%対象 ${formatYen(standardAmount)}（消費税 ${formatYen(taxOfIncluded(standardAmount, STANDARD_RATE))}）`,
    ...(order.noshi ? ['', `のし：${order.noshi.omotegaki}`] : []),
    '',
    'こもれびリビング',
  ].join('\n');
}
