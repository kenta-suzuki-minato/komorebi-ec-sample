import { readFileSync } from 'node:fs';
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
    expect(first).toContain('0004_add_noshi_oiwai.sql');
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

it('0003 適用済みの注文を保持して「御祝」の保存を許可する', async () => {
  const pg = new PGlite();
  try {
    await pg.exec('CREATE TABLE schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
    for (const name of ['0001_init.sql', '0002_points.sql', '0003_gift.sql']) {
      await pg.exec(readFileSync(new URL(`../migrations/${name}`, import.meta.url), 'utf8'));
      await pg.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    }

    const insertOrder = (orderNo: string, omotegaki: string | null) =>
      pg.query(
        "INSERT INTO orders (id, order_no, ordered_at, status, total_incl_tax, noshi_omotegaki) VALUES (gen_random_uuid(), $1, now(), 'new', 0, $2)",
        [orderNo, omotegaki],
      );
    const existing = ['無地', '御歳暮', '御年賀', '内祝', null];
    for (const [index, omotegaki] of existing.entries()) {
      await insertOrder(`KS-${index}`, omotegaki);
    }
    await expect(insertOrder('KS-5', '御祝')).rejects.toMatchObject({ code: '23514' });

    const exec = (sql: string) => pg.exec(sql);
    const query = (sql: string) => pg.query<Record<string, unknown>>(sql);
    expect(await migrate(exec, query)).toEqual(['0004_add_noshi_oiwai.sql']);
    await insertOrder('KS-5', '御祝');
    await expect(insertOrder('KS-6', '御中元')).rejects.toMatchObject({ code: '23514' });
    const { rows } = await query('SELECT noshi_omotegaki FROM orders ORDER BY order_no');
    expect(rows.map((row) => row.noshi_omotegaki)).toEqual([...existing, '御祝']);
    expect(await migrate(exec, query)).toEqual([]);
  } finally {
    await pg.close();
  }
});
