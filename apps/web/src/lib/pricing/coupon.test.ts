import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../../../../../test-support/products';
import { applyCouponToSummary } from './coupon';
import { buildOrderSummary } from './orderSummary';

describe('applyCouponToSummary（KEC-22 金額計算の回帰テスト）', () => {
  const bottleWithWrap = buildOrderSummary([
    { sku: 'BT-350', name: PRODUCTS['BT-350'].name, unitPrice: PRODUCTS['BT-350'].price, quantity: 1, giftWrap: true },
  ]);

  it('[TC-TAX-009] クーポン500円引き＋包装あり：税込3,150円の消費税は286円', () => {
    const summary = applyCouponToSummary(bottleWithWrap, 500);
    expect(summary.total).toBeYen(3150);
    expect(summary.taxTotal).toBeYen(286);
  });

  it('[TC-PT-007] クーポン500円引き：商品代金3,300円−500円で28ポイント', () => {
    expect(applyCouponToSummary(bottleWithWrap, 500).pointsToEarn).toBe(28);
  });
});
