import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

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
