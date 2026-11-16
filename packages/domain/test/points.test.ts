import { describe, expect, it } from 'vitest';
import { calcEarnedPoints, calcPointExpiryDate, calcUsablePoints } from '../src/points';
import type { PricedLine } from '../src/tax';

const product = (amount: number): PricedLine => ({ lineType: 'product', amount, taxRate: 0.1 });
const shipping = (amount: number): PricedLine => ({ lineType: 'shipping', amount, taxRate: 0.1 });

describe('calcEarnedPoints', () => {
  it('[TC-PT-001] 3,300円のボトルは33ポイント', () => {
    expect(calcEarnedPoints([product(3300)])).toBe(33);
  });

  it('[TC-PT-002] 880円の保存容器は8ポイント（100円未満は切り捨て）', () => {
    expect(calcEarnedPoints([product(880)])).toBe(8);
  });

  it('[TC-PT-003] 880円の容器を2個（1明細）買うと1,760円で17ポイント', () => {
    expect(calcEarnedPoints([product(1760)])).toBe(17);
  });

  it('[TC-PT-006] 送料にはポイントがつかない', () => {
    expect(calcEarnedPoints([product(3300), shipping(550)])).toBe(33);
  });

  it('明細がなければ0ポイント', () => {
    expect(calcEarnedPoints([])).toBe(0);
  });

  it.each([
    [2970, 29],
    [3850, 38],
    [5500, 55],
    [99, 0],
    [100, 1],
  ])('商品代金%d円は%dポイント', (amount, expected) => {
    expect(calcEarnedPoints([product(amount)])).toBe(expected);
  });
});

describe('calcUsablePoints', () => {
  it.each([
    [1000, 500, 3300, 500],
    [300, 500, 3300, 300],
    [5000, 5000, 3300, 3300],
    [1000, 0, 3300, 0],
    [0, 500, 3300, 0],
    [1000, -10, 3300, 0],
  ])('残高%d・希望%d・支払%d円 → %dポイント', (balance, requested, payable, expected) => {
    expect(calcUsablePoints(balance, requested, payable)).toBe(expected);
  });
});

describe('calcPointExpiryDate', () => {
  it('[TC-PT-010] 2026-11-18 15:00 に購入 → 2027-11-18 まで', () => {
    expect(calcPointExpiryDate(new Date('2026-11-18T15:00:00+09:00'))).toBe('2027-11-18');
  });

  it('2026-10-05 12:00 に購入 → 2027-10-05 まで', () => {
    expect(calcPointExpiryDate(new Date('2026-10-05T12:00:00+09:00'))).toBe('2027-10-05');
  });
});

// ポイント履歴に失効予定日を出す（スプリント3レビューでのご要望）前に見つかった不具合。
// it.fails は「いまは失敗する」ことを確かめるテスト。直したら it に戻す。
describe('calcPointExpiryDate（日本時間で判定する）', () => {
  it.fails('[TC-PT-011][B7] 2026-11-18 0:30（日本時間）に購入 → 2027-11-18 まで', () => {
    expect(calcPointExpiryDate(new Date('2026-11-18T00:30:00+09:00'))).toBe('2027-11-18');
  });

  it.fails('[TC-PT-012][B7] 2026-11-18 8:59（日本時間）に購入 → 2027-11-18 まで', () => {
    expect(calcPointExpiryDate(new Date('2026-11-18T08:59:00+09:00'))).toBe('2027-11-18');
  });

  it('[TC-PT-013] 2026-11-18 9:00（日本時間）に購入 → 2027-11-18 まで', () => {
    expect(calcPointExpiryDate(new Date('2026-11-18T09:00:00+09:00'))).toBe('2027-11-18');
  });
});

// 要件定義書 3.4 との違い（金額計算の回帰テスト KEC-22 で見つかったもの）。
// it.fails は「いまは失敗する」ことを確かめるテスト。直したら it に戻す。
describe('calcEarnedPoints（要件定義書 3.4）', () => {
  it.fails('[TC-PT-004][B2] BT-350＋包装：ギフト包装料にはポイントがつかない（33ポイント）', () => {
    const lines: PricedLine[] = [product(3300), { lineType: 'gift_wrap', amount: 350, taxRate: 0.1 }];
    expect(calcEarnedPoints(lines)).toBe(33);
  });

  it.fails('[TC-PT-005][B3] 保存容器S＋L（2明細、2,310円）は23ポイント（端数は注文ごとに切り捨て）', () => {
    expect(calcEarnedPoints([product(880), product(1430)])).toBe(23);
  });
});
