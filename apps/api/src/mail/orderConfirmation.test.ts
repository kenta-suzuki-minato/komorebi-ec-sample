import { describe, expect, it } from 'vitest';
import { order, productLine, wrapLine } from '../testOrders';
import { renderOrderConfirmationMail } from './orderConfirmation';

describe('renderOrderConfirmationMail', () => {
  it('空注文の合計と10%対象額・消費税を0円で表示する', () => {
    const body = renderOrderConfirmationMail(order([]));
    expect(body).toContain('合計　0円（うち消費税 0円）');
    expect(body).toContain('10%対象 0円（消費税 0円）');
  });

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
