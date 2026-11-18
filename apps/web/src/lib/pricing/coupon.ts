import { calcOrderTotals, TAX_RATES } from '@komorebi/domain';
import type { OrderSummary } from './types';

/** クーポン（定額値引き）を注文画面の金額に反映する（KEC-22） */
export function applyCouponToSummary(summary: OrderSummary, discount: number): OrderSummary {
  const total = summary.total - discount;
  // 消費税は値引き後の税込合計から calcOrderTotals で1回だけ計算する（1円未満切り捨て）
  const { taxTotal } = calcOrderTotals([{ lineType: 'product', amount: total, taxRate: TAX_RATES.standard }]);
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
