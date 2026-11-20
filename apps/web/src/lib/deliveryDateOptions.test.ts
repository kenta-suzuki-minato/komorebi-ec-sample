import { describe, expect, it } from 'vitest';
import { filterDeliveryDateOptions } from './deliveryDateOptions.js';

describe('filterDeliveryDateOptions', () => {
  it.each([2027, 2028])('%i年末から翌年始までの休業日を除く', (year) => {
    const nextYear = year + 1;

    expect(filterDeliveryDateOptions([
      `${year}-12-28`,
      `${year}-12-29`,
      `${year}-12-30`,
      `${year}-12-31`,
      `${nextYear}-01-01`,
      `${nextYear}-01-02`,
      `${nextYear}-01-03`,
      `${nextYear}-01-04`,
    ])).toEqual([`${year}-12-28`, `${nextYear}-01-04`]);
  });

  it('年末年始の範囲外にある祝日を候補に残す', () => {
    expect(filterDeliveryDateOptions(['2027-02-11', '2027-05-05'])).toEqual([
      '2027-02-11',
      '2027-05-05',
    ]);
  });
});
