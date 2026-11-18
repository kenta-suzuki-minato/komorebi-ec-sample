import { describe, expect, it } from 'vitest';
import { order, productLine, wrapLine } from '../testOrders';
import { renderOrderConfirmationMail } from './orderConfirmation';

describe('renderOrderConfirmationMail', () => {
  it('BT-350＋包装：合計3,650円（うち消費税 331円）', () => {
    const bottle = productLine('BT-350', 'ぬくもりボトル 350ml', 1, 3300);
    const body = renderOrderConfirmationMail(order([bottle, wrapLine(bottle)]));
    expect(body).toContain('合計　3,650円（うち消費税 331円）');
    expect(body).toContain('10%対象 3,650円（消費税 331円）');
  });

  it('明細を1行ずつ書く', () => {
    const bottle = productLine('BT-500', 'ぬくもりボトル 500ml', 1, 3850);
    const body = renderOrderConfirmationMail(order([bottle]));
    expect(body).toContain('・ぬくもりボトル 500ml × 1　3,850円');
    expect(body).toContain('ご注文番号：KS-20261110-0001');
  });

  it('のしがあれば表書きを書く', () => {
    const mug = productLine('MG-01', '木のマグカップ', 1, 2640);
    const body = renderOrderConfirmationMail(order([mug, wrapLine(mug)], { noshi: { omotegaki: '御歳暮' } }));
    expect(body).toContain('のし：御歳暮');
  });

  it('のしがなければ「のし」の行はない', () => {
    const body = renderOrderConfirmationMail(order([productLine('LT-01', 'リネンふきん 2枚組', 1, 1650)]));
    expect(body).not.toContain('のし：');
  });
});

describe('renderOrderConfirmationMail（税率別の内訳は calcOrderTotals から）', () => {
  it('[TC-TAX-004] 保存容器S・M・Lをそれぞれ包装：うち消費税 405円', () => {
    const lines = [
      productLine('FC-S', 'ふた付き保存容器 S', 1, 880),
      productLine('FC-M', 'ふた付き保存容器 M', 1, 1100),
      productLine('FC-L', 'ふた付き保存容器 L', 1, 1430),
    ];
    const body = renderOrderConfirmationMail(order([...lines, ...lines.map(wrapLine)]));
    expect(body).toContain('合計　4,460円（うち消費税 405円）');
    expect(body).toContain('10%対象 4,460円（消費税 405円）');
  });
});
