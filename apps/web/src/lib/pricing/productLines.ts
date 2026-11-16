import { TAX_RATES } from '@komorebi/domain';
import type { CartItem, OrderLine } from './types';

/** カートの商品から、注文画面の商品明細を作る */
export function buildProductLines(items: readonly CartItem[]): OrderLine[] {
  return items.map((item) => {
    const amount = item.unitPrice * item.quantity;
    return {
      lineType: 'product',
      sku: item.sku,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      amount,
      taxRate: TAX_RATES.standard,
    };
  });
}
