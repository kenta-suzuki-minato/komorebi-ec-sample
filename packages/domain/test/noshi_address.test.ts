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
