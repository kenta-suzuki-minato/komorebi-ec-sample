import { PGlite } from '@electric-sql/pglite';
import { afterAll, describe, expect, it } from 'vitest';
import { migrate, seed, SEED_PRODUCTS } from '../src';

describe('migrate / seed', () => {
  const pg = new PGlite();
  const exec = (sql: string) => pg.exec(sql);
  const query = (sql: string) => pg.query<Record<string, unknown>>(sql);

  afterAll(async () => {
    await pg.close();
  });

  it('マイグレーションを番号順に適用し、2回目は何もしない', async () => {
    const first = await migrate(exec, query);
    expect(first[0]).toBe('0001_init.sql');
    expect(await migrate(exec, query)).toEqual([]);
  });

  it('商品10件と、カラーごとの在庫を入れる', async () => {
    await seed(exec);
    const products = await query('SELECT count(*)::int AS n FROM products');
    expect(products.rows[0]?.n).toBe(SEED_PRODUCTS.length);
    const bottle = await query("SELECT color FROM inventory WHERE product_code = 'BT-350' ORDER BY color");
    expect(bottle.rows.map((row) => row.color).sort()).toEqual(['墨', '桜', '生成り', '若草'].sort());
  });

  it('のしの表書きは一覧にないものを入れられない', async () => {
    await expect(
      exec(
        "INSERT INTO orders (id, order_no, ordered_at, status, total_incl_tax, noshi_omotegaki) VALUES ('00000000-0000-0000-0000-000000000001', 'KS-1', now(), 'new', 0, '御中元')",
      ),
    ).rejects.toThrow();
  });
});
