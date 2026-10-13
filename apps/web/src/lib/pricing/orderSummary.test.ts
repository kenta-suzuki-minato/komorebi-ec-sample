import { describe, expect, it } from 'vitest';
import { PRODUCTS, type ProductCode } from '../../../../../test-support/products';
import { buildOrderSummary } from './orderSummary';
import type { CartItem } from './types';

const item = (code: ProductCode, quantity = 1, giftWrap = false): CartItem => ({
  sku: code,
  name: PRODUCTS[code].name,
  unitPrice: PRODUCTS[code].price,
  quantity,
  giftWrap,
});

describe('buildOrderSummary', () => {
  it('BT-350 1点：合計3,300円、うち消費税300円', () => {
    const summary = buildOrderSummary([item('BT-350')]);
    expect(summary.total).toBeYen(3300);
    expect(summary.taxTotal).toBeYen(300);
  });

  it('保存容器S・M・L：合計3,410円、うち消費税310円', () => {
    const summary = buildOrderSummary([item('FC-S'), item('FC-M'), item('FC-L')]);
    expect(summary.total).toBeYen(3410);
    expect(summary.taxTotal).toBeYen(310);
  });

  it('包装を選ぶと包装料の明細が商品の後ろに1行増える', () => {
    const summary = buildOrderSummary([item('BT-350', 1, true)]);
    expect(summary.lines.map((line) => line.lineType)).toEqual(['product', 'gift_wrap']);
    expect(summary.lines[1]).toMatchObject({ name: 'ギフト包装', amount: 350, parentSku: 'BT-350' });
  });

  it('包装した商品が2個なら包装料は700円', () => {
    const summary = buildOrderSummary([item('LT-01', 2, true)]);
    expect(summary.total).toBeYen(3300 + 700);
  });

  it('付与予定ポイント：BT-350 1点で33ポイント', () => {
    expect(buildOrderSummary([item('BT-350')]).pointsToEarn).toBe(33);
  });
});
