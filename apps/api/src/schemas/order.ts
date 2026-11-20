import { NOSHI_OMOTEGAKI } from '@komorebi/domain';
import { z } from 'zod';

// POST /api/orders のリクエスト（注文確定）
export const noshiSchema = z.object({
  omotegaki: z.enum(NOSHI_OMOTEGAKI),
});

export const orderItemSchema = z.object({
  productCode: z.string().regex(/^[A-Z]{2}-[A-Z0-9]{2,3}$/),
  color: z.string().optional(),
  qty: z.number().int().min(1).max(99),
  giftWrap: z.boolean().default(false),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  noshi: noshiSchema.optional(),
  usePoints: z.number().int().min(0).default(0),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
