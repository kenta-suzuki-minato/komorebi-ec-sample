import { TAX_RATES } from '@komorebi/domain';
import type { CartItem, OrderLine } from './types';

/** ギフト包装料（1点、税込） */
export const GIFT_WRAP_FEE = 350;

/**
 * 包装を選んだ商品ごとに、包装料の明細（line_type = gift_wrap）を作る。
 * 税額は持たせない（消費税は calcOrderTotals が注文全体で計算する。KEC-17）
 */
export function buildGiftWrapLines(items: readonly CartItem[]): OrderLine[] {
  return items
    .filter((item) => item.giftWrap)
    .map((item) => {
      const amount = GIFT_WRAP_FEE * item.quantity;
      return {
        lineType: 'gift_wrap',
        sku: `WRAP-${item.sku}`,
        name: 'ギフト包装',
        unitPrice: GIFT_WRAP_FEE,
        quantity: item.quantity,
        amount,
        taxRate: TAX_RATES.standard,
        parentSku: item.sku,
      };
    });
}
