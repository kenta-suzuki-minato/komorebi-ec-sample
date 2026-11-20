import { describe, expect, it } from 'vitest';
import { calcOrderTotals, taxIncluded, type PricedLine } from '../src/tax';

const product = (amount: number): PricedLine => ({ lineType: 'product', amount, taxRate: 0.1 });

describe('taxIncluded', () => {
  it.each([
    [3300, 300],
    [3850, 350],
    [2970, 270],
    [880, 80],
    [1100, 100],
    [1430, 130],
    [3190, 290],
    [1650, 150],
    [5500, 500],
    [2640, 240],
    [8910, 810],
    [0, 0],
    [1, 0],
    [11, 1],
    [110, 10],
  ])('税込%d円に含まれる消費税（10%%）は%d円', (amount, expected) => {
    expect(taxIncluded(amount, 0.1)).toBeYen(expected);
  });

  it.each([
    [108, 8],
    [1080, 80],
    [100, 7],
  ])('税込%d円に含まれる消費税（8%%）は%d円', (amount, expected) => {
    expect(taxIncluded(amount, 0.08)).toBeYen(expected);
  });
});

describe('calcOrderTotals', () => {
  it('[TC-TAX-001] BT-350 1点：税込3,300円の消費税は300円', () => {
    const totals = calcOrderTotals([product(3300)]);
    expect(totals.total).toBeYen(3300);
    expect(totals.taxTotal).toBeYen(300);
  });

  it('[TC-TAX-007] すっきりボトル3点（包装なし）：税込8,910円の消費税は810円', () => {
    expect(calcOrderTotals([product(8910)]).taxTotal).toBeYen(810);
  });

  it.todo('[TC-TAX-009] クーポン500円引き＋包装1点：税込3,650円から500円を引いた3,150円の消費税は286円');
  it.todo('[TC-TAX-010] クーポン500円引き＋保存容器S・M・Lをそれぞれ包装：税込4,460円から500円を引いた3,960円の消費税は360円');
  it.todo('[TC-TAX-011] クーポン500円引き＋リネンふきん2点・包装2点（1明細）：税込4,000円から500円を引いた3,500円の消費税は318円');
  it.todo('[TC-TAX-012] クーポン500円引き＋リネンふきん1点・包装1点を2明細：税込4,000円から500円を引いた3,500円の消費税は318円');

  it('明細がなければ合計も消費税も0円', () => {
    const totals = calcOrderTotals([]);
    expect(totals.total).toBeYen(0);
    expect(totals.taxTotal).toBeYen(0);
    expect(totals.breakdown).toEqual([]);
  });

  it('同じ税率の明細は合計してから1回だけ計算する', () => {
    // 明細ごとに切り捨てると 0 + 0 + 0 = 0円、合計してからだと 33円 → 3円
    const totals = calcOrderTotals([product(11), product(11), product(11)]);
    expect(totals.taxTotal).toBeYen(3);
  });

  it('税率ごとに分けて計算し、高い税率から並べる', () => {
    const totals = calcOrderTotals([
      { lineType: 'product', amount: 1080, taxRate: 0.08 },
      product(3300),
    ]);
    expect(totals.breakdown).toEqual([
      { rate: 0.1, taxableAmount: 3300, tax: 300 },
      { rate: 0.08, taxableAmount: 1080, tax: 80 },
    ]);
    expect(totals.taxTotal).toBeYen(380);
    expect(totals.total).toBeYen(4380);
  });

  it('送料の明細も同じ税率の合計に含める', () => {
    const totals = calcOrderTotals([product(3300), { lineType: 'shipping', amount: 550, taxRate: 0.1 }]);
    expect(totals.total).toBeYen(3850);
    expect(totals.taxTotal).toBeYen(350);
  });
});
