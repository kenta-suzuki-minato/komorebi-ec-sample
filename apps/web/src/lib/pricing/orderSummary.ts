import { calcEarnedPoints, calcOrderTotals } from '@komorebi/domain';
import { buildProductLines } from './productLines';
import type { CartItem, OrderSummary } from './types';
import { buildGiftWrapLines } from './wrapping';

/** 注文画面（確認画面）の明細・合計・消費税・付与予定ポイント */
export function buildOrderSummary(items: readonly CartItem[]): OrderSummary {
  const lines = [...buildProductLines(items), ...buildGiftWrapLines(items)];
  const totals = calcOrderTotals(lines);

  return {
    lines,
    total: totals.total,
    taxTotal: totals.taxTotal,
    pointsToEarn: calcEarnedPoints(lines),
  };
}
