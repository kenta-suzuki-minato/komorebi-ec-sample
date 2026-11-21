import { schema } from '@komorebi/db';
import { and, asc, eq, inArray } from 'drizzle-orm';
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

    if (rows.length === 0) return c.json({ items: [] });

    const productCodes = rows.map((product) => product.code);
    const stockRows = await db
      .select({
        productCode: inventory.productCode,
        color: inventory.color,
        stock: inventory.stock,
        image: productImages.url,
      })
      .from(inventory)
      .leftJoin(
        productImages,
        and(
          eq(productImages.productCode, inventory.productCode),
          eq(productImages.color, inventory.color),
          eq(productImages.width, 400),
        ),
      )
      .where(inArray(inventory.productCode, productCodes));

    const colorsByProduct = new Map(rows.map(({ code }) => [code, [] as ProductListItem['colors']]));
    for (const { productCode, color, stock, image } of stockRows) {
      colorsByProduct.get(productCode)?.push({
        color,
        stock,
        image,
      });
    }
    const items: ProductListItem[] = rows.map((product) => ({
      code: product.code,
      name: product.name,
      category: product.category,
      price: product.priceInclTax,
      colors: colorsByProduct.get(product.code) ?? [],
    }));
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
