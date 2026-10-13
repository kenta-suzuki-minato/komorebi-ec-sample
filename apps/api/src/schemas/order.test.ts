import { describe, expect, it } from 'vitest';
import { createOrderSchema } from './order';

describe('createOrderSchema', () => {
  it('BT-350 1点、包装あり、のし「御歳暮」を受け付ける', () => {
    const result = createOrderSchema.parse({
      items: [{ productCode: 'BT-350', color: '生成り', qty: 1, giftWrap: true }],
      noshi: { omotegaki: '御歳暮' },
    });
    expect(result.items[0]?.giftWrap).toBe(true);
    expect(result.usePoints).toBe(0);
  });

  it.each(['無地', '御歳暮', '御年賀', '内祝'])('表書き「%s」を受け付ける', (omotegaki) => {
    expect(
      createOrderSchema.safeParse({ items: [{ productCode: 'MG-01', qty: 1 }], noshi: { omotegaki } }).success,
    ).toBe(true);
  });

  it('一覧にない表書きはエラー', () => {
    const result = createOrderSchema.safeParse({
      items: [{ productCode: 'MG-01', qty: 1 }],
      noshi: { omotegaki: '御中元' },
    });
    expect(result.success).toBe(false);
  });

  it('明細なしはエラー', () => {
    expect(createOrderSchema.safeParse({ items: [] }).success).toBe(false);
  });

  it.each([0, 100, 1.5])('数量 %d はエラー', (qty) => {
    expect(createOrderSchema.safeParse({ items: [{ productCode: 'BT-350', qty }] }).success).toBe(false);
  });
});
