import type { NoshiOption, PricedLine } from '@komorebi/domain';

/** カートの1行（画面の状態） */
export interface CartItem {
  sku: string;
  name: string;
  /** 税込単価 */
  unitPrice: number;
  quantity: number;
  /** ギフト包装を付けるか（商品ごとに選択） */
  giftWrap: boolean;
  noshi?: NoshiOption;
}

/** 注文画面に表示する明細 */
export interface OrderLine extends PricedLine {
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  /** 明細の消費税額（表示用） */
  taxAmount: number;
  /** 包装行が対象とする商品の SKU */
  parentSku?: string;
}

export interface OrderSummary {
  lines: OrderLine[];
  total: number;
  taxTotal: number;
  pointsToEarn: number;
}
