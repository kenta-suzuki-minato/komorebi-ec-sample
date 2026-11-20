// 会員ポイント（要件定義書 3.4、技術設計書 3.4）。
import type { PricedLine } from './tax';

/** 100円（税込）につき1ポイント */
export const POINT_UNIT_YEN = 100;

/** 出荷時に付与するポイント数 */
export function calcEarnedPoints(lines: readonly PricedLine[]): number {
  const productTotal = lines
    .filter((line) => line.lineType === 'product')
    .reduce((total, line) => total + line.amount, 0);
  return Math.floor(productTotal / POINT_UNIT_YEN);
}

/**
 * 購入時に充当できるポイント数。
 * 1ポイント＝1円。残高と、充当前の支払金額の小さいほうまで。
 */
export function calcUsablePoints(balance: number, requested: number, payableAmount: number): number {
  if (requested <= 0 || balance <= 0) return 0;
  return Math.min(requested, balance, payableAmount);
}

/** ポイントの有効期限：最後に購入した日から1年間。"YYYY-MM-DD" で返す */
export function calcPointExpiryDate(lastPurchasedAt: Date): string {
  const expiry = new Date(lastPurchasedAt.getTime());
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
  return expiry.toISOString().slice(0, 10);
}
