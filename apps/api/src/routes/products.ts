import { schema } from '@komorebi/db';
import { asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import type { Db } from '../db';

const { inventory, productImages, products } = schema;

export interface ProductListItem {
  code: string;
  name: string;
  category: string;
  price: number;
  colors: { color: string; stock: number; image: string | null }[];
}

/** GET /api/products（商品一覧。カテゴリで絞り込み） */
export function productRoutes(db: Db) {
  const app = new Hono();

  app.get('/', async (c) => {
    const category = c.req.query('category');
    const rows = await db
      .select()
      .from(products)
      .where(category ? eq(products.category, category) : undefined)
      .orderBy(asc(products.code));

    const items: ProductListItem[] = [];
    for (const product of rows) {
      const stocks = await db.select().from(inventory).where(eq(inventory.productCode, product.code));
      const images = await db.select().from(productImages).where(eq(productImages.productCode, product.code));
      items.push({
        code: product.code,
        name: product.name,
        category: product.category,
        price: product.priceInclTax,
        colors: stocks.map((stock) => ({
          color: stock.color,
          stock: stock.stock,
          image: images.find((image) => image.color === stock.color && image.width === 400)?.url ?? null,
        })),
      });
    }
    return c.json({ items });
  });

  app.get('/:code', async (c) => {
    const code = c.req.param('code');
    const [product] = await db.select().from(products).where(eq(products.code, code));
    if (!product) return c.json({ message: '商品が見つかりません' }, 404);
    const stocks = await db.select().from(inventory).where(eq(inventory.productCode, code));
    const images = await db.select().from(productImages).where(eq(productImages.productCode, code));
    return c.json({
      code: product.code,
      name: product.name,
      price: product.priceInclTax,
      colors: stocks.map((stock) => ({
        color: stock.color,
        stock: stock.stock,
        images: images.filter((image) => image.color === stock.color).map(({ width, url }) => ({ width, url })),
      })),
    });
  });

  return app;
}
