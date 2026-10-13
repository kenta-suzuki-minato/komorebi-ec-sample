// 金額（円）の表示と変換。
// 消費税の計算はここでは行わない（tax.ts の calcOrderTotals を使う）。

/** 3650 → "3,650円" */
export function formatYen(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${digits}円`;
}

/** "3,650円" / "¥3,650" / "3650" → 3650。数字として読めない場合は例外 */
export function parseYen(text: string): number {
  const cleaned = text.trim().replace(/[¥￥,円\s]/g, '');
  if (!/^-?\d+$/.test(cleaned)) {
    throw new Error(`金額として読めません: ${text}`);
  }
  return Number(cleaned);
}

export function sumYen(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
