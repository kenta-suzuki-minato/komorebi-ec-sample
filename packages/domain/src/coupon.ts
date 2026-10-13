// クーポン値引き（定額・定率）。

export type Coupon =
  | { kind: 'fixed'; code: string; amount: number }
  | { kind: 'percent'; code: string; percent: number };

/** 値引き後の金額。値引き額は四捨五入、0円未満にはしない */
export function applyCoupon(subtotal: number, coupon: Coupon): { discount: number; subtotalAfter: number } {
  const discount =
    coupon.kind === 'fixed' ? coupon.amount : Math.round((subtotal * coupon.percent) / 100);
  const capped = Math.min(discount, subtotal);
  return { discount: capped, subtotalAfter: subtotal - capped };
}

export function isCouponCode(text: string): boolean {
  return /^[A-Z0-9]{6,12}$/.test(text);
}
