// 会員ポイント（要件定義書 3.4、技術設計書 3.4）。
import type { PricedLine } from './tax';

/** 100円（税込）につき1ポイント */
export const POINT_UNIT_YEN = 100;

/** 出荷時に付与するポイント数 */
export function calcEarnedPoints(lines: readonly PricedLine[]): number {
  return lines
    .filter((line) => line.lineType !== 'shipping')
    .reduce((points, line) => points + Math.floor(line.amount / POINT_UNIT_YEN), 0);
}

/**
 * 購入時に充当できるポイント数。
 * 1ポイント＝1円。残高と、充当前の支払金額の小さいほうまで。
 */
export function calcUsablePoints(balance: number, requested: number, payableAmount: number): number {
  if (requested <= 0 || balance <= 0) return 0;
  return Math.min(requested, balance, payableAmount);
}

const purchaseDateFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' });

/** 日本時間の購入日から1年後を返す。翌年に同じ日付がない場合は未確定。 */
export function calcPointExpiryDate(lastPurchasedAt: Date): string | null {
  const purchaseDate = purchaseDateFormatter.format(lastPurchasedAt);
  const expiry = new Date(`${purchaseDate}T00:00:00Z`);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
  const expiryDate = expiry.toISOString().slice(0, 10);
  return expiryDate.slice(5) === purchaseDate.slice(5) ? expiryDate : null;
}
