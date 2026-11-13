'use client';

// カートと購入手続きの入力を、画面をまたいで持つ（ブラウザのメモリ上だけ。再読み込みで消える）
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { NoshiOmotegaki } from '@komorebi/domain';
import type { CartItem } from '../../src/lib/pricing/types';
import { EMPTY_DELIVERY, type DeliveryForm, type PaymentMethod } from '../../src/lib/checkout';

interface StoreState {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity' | 'giftWrap'>) => void;
  updateCartItem: (sku: string, change: Partial<Pick<CartItem, 'quantity' | 'giftWrap'>>) => void;
  removeFromCart: (sku: string) => void;
  delivery: DeliveryForm;
  setDelivery: (form: DeliveryForm) => void;
  noshi: NoshiOmotegaki | '';
  setNoshi: (value: NoshiOmotegaki | '') => void;
  payment: PaymentMethod | '';
  setPayment: (method: PaymentMethod | '') => void;
  /** 注文の確定後に、カートと入力を空にする */
  reset: () => void;
}

const StoreContext = createContext<StoreState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [delivery, setDelivery] = useState<DeliveryForm>(EMPTY_DELIVERY);
  const [noshi, setNoshi] = useState<NoshiOmotegaki | ''>('');
  const [payment, setPayment] = useState<PaymentMethod | ''>('');

  const value = useMemo<StoreState>(
    () => ({
      cart,
      addToCart: (item) =>
        setCart((current) =>
          current.some((line) => line.sku === item.sku)
            ? current.map((line) => (line.sku === item.sku ? { ...line, quantity: line.quantity + 1 } : line))
            : [...current, { ...item, quantity: 1, giftWrap: false }],
        ),
      updateCartItem: (sku, change) =>
        setCart((current) => current.map((line) => (line.sku === sku ? { ...line, ...change } : line))),
      removeFromCart: (sku) => setCart((current) => current.filter((line) => line.sku !== sku)),
      delivery,
      setDelivery,
      noshi,
      setNoshi,
      payment,
      setPayment,
      reset: () => {
        setCart([]);
        setDelivery(EMPTY_DELIVERY);
        setNoshi('');
        setPayment('');
      },
    }),
    [cart, delivery, noshi, payment],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const store = useContext(StoreContext);
  if (!store) throw new Error('StoreProvider の外では使えません');
  return store;
}
