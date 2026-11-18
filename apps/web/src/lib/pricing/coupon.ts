import type { OrderSummary } from './types';

/** クーポン（定額値引き）を注文画面の金額に反映する（KEC-22） */
export function applyCouponToSummary(summary: OrderSummary, discount: number): OrderSummary {
  const total = summary.total - discount;
  const taxTotal = Math.round((total * 10) / 110);
  const productAmount = summary.lines
    .filter((line) => line.lineType === 'product')
    .reduce((sum, line) => sum + line.amount, 0);

  return {
    ...summary,
    total,
    taxTotal,
    pointsToEarn: Math.floor((productAmount - discount) / 100),
  };
}
