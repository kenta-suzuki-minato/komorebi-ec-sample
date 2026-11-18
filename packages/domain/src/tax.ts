// 消費税の計算（技術設計書 4章）。
// 消費税額は注文ごと・税率ごとに税込合計から1回だけ計算し、1円未満を切り捨てる。

export type LineType = 'product' | 'gift_wrap' | 'shipping';

/** 税率（標準10%） */
export const TAX_RATES = {
  standard: 0.1,
} as const;

/** 金額計算に使う明細。金額はすべて税込 */
export interface PricedLine {
  lineType: LineType;
  /** 税込金額（単価 × 数量） */
  amount: number;
  /** 税率。標準税率は 0.1 */
  taxRate: number;
}

export interface TaxBreakdown {
  /** 税率（0.1 など） */
  rate: number;
  /** その税率の税込合計 */
  taxableAmount: number;
  /** その税率の消費税額 */
  tax: number;
}

export interface OrderTotals {
  total: number;
  taxTotal: number;
  breakdown: TaxBreakdown[];
}

/** 税込金額に含まれる消費税額（1円未満切り捨て） */
export function taxIncluded(amount: number, rate: number): number {
  const percent = Math.round(rate * 100);
  return Math.floor((amount * percent) / (100 + percent));
}

/** 注文の合計と、税率ごとの消費税額を計算する */
export function calcOrderTotals(lines: readonly PricedLine[]): OrderTotals {
  const amountByRate = new Map<number, number>();
  for (const line of lines) {
    amountByRate.set(line.taxRate, (amountByRate.get(line.taxRate) ?? 0) + line.amount);
  }

  const breakdown = [...amountByRate.entries()]
    .sort(([rateA], [rateB]) => rateB - rateA)
    .map(([rate, taxableAmount]) => ({
      rate,
      taxableAmount,
      tax: taxIncluded(taxableAmount, rate),
    }));

  return {
    total: breakdown.reduce((sum, row) => sum + row.taxableAmount, 0),
    taxTotal: breakdown.reduce((sum, row) => sum + row.tax, 0),
    breakdown,
  };
}

/** 税率の表示（0.1 → "10%"） */
export function formatTaxRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
