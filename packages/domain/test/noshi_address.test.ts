import { describe, expect, it } from 'vitest';
import { normalizePhoneNumber, normalizePostalCode } from '../src/address';
import { noshiLabel } from '../src/noshi';

describe('noshiLabel', () => {
  it.each(['無地', '御歳暮', '御年賀', '内祝'] as const)('表書き「%s」', (omotegaki) => {
    expect(noshiLabel({ omotegaki })).toBe(`のし（${omotegaki}）`);
  });

  it('のしなしは空文字', () => {
    expect(noshiLabel(undefined)).toBe('');
  });
});

describe('normalizePostalCode', () => {
  it.each([
    ['123-4567', '123-4567'],
    ['1234567', '123-4567'],
    [' 000-0001 ', '000-0001'],
  ])('"%s" → %s', (input, expected) => {
    expect(normalizePostalCode(input)).toBe(expected);
  });

  it.each(['12-34567', '123-456', 'abc-defg', ''])('"%s" は郵便番号ではない', (input) => {
    expect(normalizePostalCode(input)).toBeNull();
  });
});

describe('normalizePhoneNumber', () => {
  it.each([
    ['045-000-3127', '0450003127'],
    ['03-0000-1234', '0300001234'],
    ['090-0000-1234', '09000001234'],
    ['0450003127', '0450003127'],
  ])('"%s" → %s', (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });

  it.each(['045-000', '1234567890', ''])('"%s" は電話番号ではない', (input) => {
    expect(normalizePhoneNumber(input)).toBeNull();
  });
});

// お届け先の入力ゆれ。スマートフォンの日本語入力では全角数字や長音記号が入る。
// it.fails は「いまは失敗する」ことを確かめるテスト。直したら it に戻す。
describe('normalizePostalCode（全角・記号のゆれ）', () => {
  const variants: [string, string][] = [
    ['１２３－４５６７', '全角数字と全角ハイフン'],
    ['１２３４５６７', '全角数字のみ'],
    ['123－4567', '全角ハイフン（－）'],
    ['123ー4567', '長音記号（ー）'],
    ['123ｰ4567', '半角カタカナの長音記号（ｰ）'],
    ['123‐4567', 'ハイフン記号（‐）'],
    ['123−4567', 'マイナス記号（−）'],
    ['〒123-4567', '郵便記号つき'],
  ];
  variants.forEach(([input, note], index) => {
    const id = `TC-ADR-${String(index + 1).padStart(2, '0')}`;
    it.fails(`[${id}][B8] ${note}「${input}」→ 123-4567`, () => {
      expect(normalizePostalCode(input)).toBe('123-4567');
    });
  });
});

describe('normalizePhoneNumber（全角・記号のゆれ）', () => {
  const variants: [string, string][] = [
    ['０４５－０００－３１２７', '全角数字と全角ハイフン'],
    ['045ー000ー3127', '長音記号（ー）'],
    ['045−000−3127', 'マイナス記号（−）'],
    ['045 000 3127', '空白区切り'],
    ['(045)000-3127', 'かっこ付きの市外局番'],
    ['０４５０００３１２７', '全角数字のみ'],
    ['045ｰ000ｰ3127', '半角カタカナの長音記号（ｰ）'],
  ];
  variants.forEach(([input, note], index) => {
    const id = `TC-ADR-${String(index + 11).padStart(2, '0')}`;
    it.fails(`[${id}][B8] ${note}「${input}」→ 0450003127`, () => {
      expect(normalizePhoneNumber(input)).toBe('0450003127');
    });
  });
});
