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

// 金額計算テストケース（消費税）：docs/test/金額計算テストケース.xlsx の No.1～8。
// 正しい消費税＝税率ごとの税込合計 × 10 ÷ 110 を1回だけ切り捨て（KEC-17、PR #142）
describe('buildOrderSummary（金額計算テストケース：消費税）', () => {
  it('[TC-TAX-001] BT-350 1点：税込3,300円の消費税は300円', () => {
    const summary = buildOrderSummary([item('BT-350')]);
    expect(summary.total).toBeYen(3300);
    expect(summary.taxTotal).toBeYen(300);
  });

  it('[TC-TAX-002] 包装1点：税込3,650円の消費税は331円', () => {
    const summary = buildOrderSummary([item('BT-350', 1, true)]);
    expect(summary.total).toBeYen(3650);
    expect(summary.taxTotal).toBeYen(331);
  });

  it('[TC-TAX-003] 包装2点：税込7,850円の消費税は713円', () => {
    const summary = buildOrderSummary([item('BT-350', 1, true), item('BT-500', 1, true)]);
    expect(summary.total).toBeYen(7850);
    expect(summary.taxTotal).toBeYen(713);
  });

  it('[TC-TAX-004] 保存容器S・M・Lをそれぞれ包装：税込4,460円の消費税は405円', () => {
    const summary = buildOrderSummary([item('FC-S', 1, true), item('FC-M', 1, true), item('FC-L', 1, true)]);
    expect(summary.total).toBeYen(4460);
    expect(summary.taxTotal).toBeYen(405);
  });

  it('[TC-TAX-005] リネンふきん2点＋包装2点（1行）：税込4,000円の消費税は363円', () => {
    const summary = buildOrderSummary([item('LT-01', 2, true)]);
    expect(summary.total).toBeYen(4000);
    expect(summary.taxTotal).toBeYen(363);
  });

  it('[TC-TAX-006] 木のマグカップ＋包装：税込2,990円の消費税は271円', () => {
    const summary = buildOrderSummary([item('MG-01', 1, true)]);
    expect(summary.total).toBeYen(2990);
    expect(summary.taxTotal).toBeYen(271);
  });

  it('[TC-TAX-007] すっきりボトル3点（包装なし）：税込8,910円の消費税は810円', () => {
    const summary = buildOrderSummary([item('SB-480', 3)]);
    expect(summary.total).toBeYen(8910);
    expect(summary.taxTotal).toBeYen(810);
  });

  it('[TC-TAX-008] バスタオル＋マグ＋包装2点：税込8,840円の消費税は803円', () => {
    const summary = buildOrderSummary([item('LT-02', 1, true), item('MG-01', 1, true)]);
    expect(summary.total).toBeYen(8840);
    expect(summary.taxTotal).toBeYen(803);
  });
});
