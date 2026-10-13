import type { LineType } from '@komorebi/domain';

/** DBの order_lines 1行（PostgreSQL の numeric は文字列で返る） */
export interface OrderLineRecord {
  id: string;
  lineType: LineType;
  productCode: string | null;
  name: string;
  qty: number;
  /** 税込金額（numeric → 文字列） */
  amountInclTax: string;
  /** 'standard'（標準10%） */
  taxRateCode: 'standard';
  parentLineId: string | null;
}

export interface OrderRecord {
  id: string;
  orderNo: string;
  orderedAt: string;
  customerName: string;
  lines: OrderLineRecord[];
  noshi?: { omotegaki: string };
}
