import { describe, expect, it } from 'vitest';
import { isDeliveryDateSelectable } from '../src/delivery';

describe('お届け希望日の年末年始判定', () => {
  it.each([
    ['TC-KEC-19-001', 12, 28, '選択できる', true],
    ['TC-KEC-19-002', 12, 29, '選択できない', false],
    ['TC-KEC-19-003', 1, 3, '選択できない', false],
    ['TC-KEC-19-004', 1, 4, '選択できる', true],
  ])('[%s] %i月%i日は%s', (_id, month, day, _description, selectable) => {
    expect(isDeliveryDateSelectable(month, day)).toBe(selectable);
  });
});
