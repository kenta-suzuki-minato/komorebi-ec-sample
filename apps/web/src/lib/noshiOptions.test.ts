import { expect, it } from 'vitest';
import { NOSHI_NONE_LABEL, NOSHI_OPTIONS } from './noshiOptions';

it('購入手続きで既存4種に続いて「御祝」を選べる', () => {
  expect(NOSHI_OPTIONS).toEqual([
    { value: '無地', label: '無地' },
    { value: '御歳暮', label: '御歳暮' },
    { value: '御年賀', label: '御年賀' },
    { value: '内祝', label: '内祝' },
    { value: '御祝', label: '御祝' },
  ]);
  expect(NOSHI_NONE_LABEL).toBe('のしなし');
});
