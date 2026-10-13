import { describe, expect, it } from 'vitest';
import { formatYen, parseYen, sumYen } from '../src/money';

describe('formatYen', () => {
  it.each([
    [0, '0円'],
    [350, '350円'],
    [3300, '3,300円'],
    [3650, '3,650円'],
    [14800000, '14,800,000円'],
    [-500, '-500円'],
  ])('%d は %s と表示する', (amount, expected) => {
    expect(formatYen(amount)).toBe(expected);
  });
});

describe('parseYen', () => {
  it.each([
    ['3,650円', 3650],
    ['¥3,650', 3650],
    ['￥3,300', 3300],
    ['3650', 3650],
    [' 880 ', 880],
    ['-500', -500],
  ])('"%s" を %d と読む', (text, expected) => {
    expect(parseYen(text)).toBeYen(expected);
  });

  it.each(['', 'abc', '3.5', '1,2,3円x'])('"%s" は例外にする', (text) => {
    expect(() => parseYen(text)).toThrow('金額として読めません');
  });
});

describe('sumYen', () => {
  it('空の配列は0円', () => {
    expect(sumYen([])).toBeYen(0);
  });

  it('税込金額を合計する', () => {
    expect(sumYen([3300, 350, 3850, 350])).toBeYen(7850);
  });
});
