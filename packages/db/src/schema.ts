import { integer, numeric, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey(),
  orderNo: text('order_no').notNull().unique(),
  memberId: uuid('member_id'),
  orderedAt: timestamp('ordered_at', { withTimezone: true }).notNull(),
  status: text('status').notNull(),
  totalInclTax: numeric('total_incl_tax', { precision: 12, scale: 0 }).notNull(),
});

// Drizzle のテーブル定義（migrations/*.sql と同じ形）
export const products = pgTable('products', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  priceInclTax: integer('price_incl_tax').notNull(),
  taxRateCode: text('tax_rate_code').notNull(),
  colors: text('colors').array().notNull(),
});

export const inventory = pgTable(
  'inventory',
  {
    productCode: text('product_code').notNull(),
    color: text('color').notNull(),
    stock: integer('stock').notNull(),
  },
  (table) => [primaryKey({ columns: [table.productCode, table.color] })],
);

export const productImages = pgTable(
  'product_images',
  {
    productCode: text('product_code').notNull(),
    color: text('color').notNull(),
    width: integer('width').notNull(),
    url: text('url').notNull(),
  },
  (table) => [primaryKey({ columns: [table.productCode, table.color, table.width] })],
);
