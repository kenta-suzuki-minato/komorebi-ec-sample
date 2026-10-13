import { describe, expect, it } from 'vitest';
import { order, productLine, wrapLine } from '../testOrders';
import { buildReceipt } from './receipt';

describe('buildReceipt', () => {
  it('BT-350＋包装：10%対象 3,650円、消費税 331円', () => {
    const bottle = productLine('BT-350', 'ぬくもりボトル 350ml', 1, 3300);
    const receipt = buildReceipt(order([bottle, wrapLine(bottle)]), '〔お客様〕');
    expect(receipt.taxRows).toEqual([{ label: '10%対象', taxable: '3,650円', tax: '331円' }]);
    expect(receipt.totalLabel).toBe('3,650円');
  });

  it('宛名に「様」をつける', () => {
    const receipt = buildReceipt(order([productLine('MG-01', '木のマグカップ', 1, 2640)]), '〔お客様〕');
    expect(receipt.addressee).toBe('〔お客様〕 様');
    expect(receipt.title).toBe('領収書');
  });

  it('すっきりボトル3点：消費税 810円', () => {
    const receipt = buildReceipt(order([productLine('SB-480', 'すっきりボトル 480ml', 3, 8910)]), '〔お客様〕');
    expect(receipt.taxRows[0]?.tax).toBe('810円');
  });
});
