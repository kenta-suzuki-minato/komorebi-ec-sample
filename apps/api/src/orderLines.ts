import type { PricedLine } from '@komorebi/domain';
import type { OrderLineRecord } from './types';

const TAX_RATE_BY_CODE = { standard: 0.1 } as const;

/** DBの明細を金額計算用の明細に変換する */
export function toPricedLines(lines: readonly OrderLineRecord[]): PricedLine[] {
  return lines.map((line) => ({
    lineType: line.lineType,
    amount: Number(line.amountInclTax),
    taxRate: TAX_RATE_BY_CODE[line.taxRateCode],
  }));
}
