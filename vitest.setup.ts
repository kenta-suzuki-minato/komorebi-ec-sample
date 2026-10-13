import { expect } from 'vitest';

// 金額の比較。失敗したときは CI のメールと同じ「期待：331　実際：332」の形で表示する。
expect.extend({
  toBeYen(received: unknown, expected: number) {
    const pass = received === expected;
    return {
      pass,
      message: () =>
        pass
          ? `期待：${expected} 以外　実際：${String(received)}`
          : `期待：${expected}　実際：${String(received)}`,
      actual: received,
      expected,
    };
  },
});

interface YenMatchers<R = unknown> {
  toBeYen(expected: number): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends YenMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends YenMatchers {}
}
