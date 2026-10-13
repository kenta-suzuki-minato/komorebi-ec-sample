import type { SqlExecutor } from './migrate';

// 開発・テスト用の商品データ（価格は税込、こもれびリビング様の現行価格）
export const SEED_PRODUCTS = [
  { code: 'BT-350', name: 'ぬくもりボトル 350ml', category: 'bottle', price: 3300, colors: ['生成り', '墨', '桜', '若草'] },
  { code: 'BT-500', name: 'ぬくもりボトル 500ml', category: 'bottle', price: 3850, colors: ['生成り', '墨', '桜', '若草'] },
  { code: 'SB-480', name: 'すっきりボトル 480ml', category: 'bottle', price: 2970, colors: ['生成り', '墨', '若草'] },
  { code: 'FC-S', name: 'ふた付き保存容器 S', category: 'container', price: 880, colors: [] },
  { code: 'FC-M', name: 'ふた付き保存容器 M', category: 'container', price: 1100, colors: [] },
  { code: 'FC-L', name: 'ふた付き保存容器 L', category: 'container', price: 1430, colors: [] },
  { code: 'FC-SET', name: 'ふた付き保存容器 3点セット', category: 'container', price: 3190, colors: [] },
  { code: 'LT-01', name: 'リネンふきん 2枚組', category: 'linen', price: 1650, colors: [] },
  { code: 'LT-02', name: 'リネンバスタオル', category: 'linen', price: 5500, colors: [] },
  { code: 'MG-01', name: '木のマグカップ', category: 'kitchen', price: 2640, colors: [] },
] as const;

const COLOR_SLUGS: Record<string, string> = { 生成り: 'kinari', 墨: 'sumi', 桜: 'sakura', 若草: 'wakakusa' };
const WIDTHS = [400, 800, 1200];

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

/** 商品・在庫・画像を入れ直す（何度実行しても同じ結果） */
export async function seed(exec: SqlExecutor): Promise<void> {
  const statements: string[] = ['DELETE FROM product_images', 'DELETE FROM inventory', 'DELETE FROM products'];
  SEED_PRODUCTS.forEach((product, index) => {
    const colors = `ARRAY[${product.colors.map(quote).join(',')}]::text[]`;
    statements.push(
      `INSERT INTO products (code, name, category, price_incl_tax, tax_rate_code, colors) VALUES (${quote(product.code)}, ${quote(product.name)}, ${quote(product.category)}, ${product.price}, 'standard', ${colors})`,
    );
    const variants: string[] = product.colors.length > 0 ? [...product.colors] : [''];
    variants.forEach((color, colorIndex) => {
      const stock = 20 + ((index * 7 + colorIndex * 13) % 60);
      statements.push(`INSERT INTO inventory (product_code, color, stock) VALUES (${quote(product.code)}, ${quote(color)}, ${stock})`);
      const slug = color === '' ? 'default' : COLOR_SLUGS[color] ?? 'default';
      for (const width of WIDTHS) {
        const url = `https://img.example.com/products/${product.code}/${slug}_${width}.webp`;
        statements.push(
          `INSERT INTO product_images (product_code, color, width, url) VALUES (${quote(product.code)}, ${quote(color)}, ${width}, ${quote(url)})`,
        );
      }
    });
  });
  await exec(statements.join(';\n'));
}
