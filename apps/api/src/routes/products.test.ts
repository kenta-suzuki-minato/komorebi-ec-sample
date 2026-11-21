import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { createTestDb } from '../testDb';
import type { ProductListItem } from './products';

describe('GET /api/products', () => {
  let ctx: Awaited<ReturnType<typeof createTestDb>>;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    ctx = await createTestDb();
    app = createApp(ctx.db);
  });
  beforeEach(() => {
    ctx.queries.length = 0;
  });
  afterAll(async () => {
    await ctx.close();
  });

  const list = async (path = '/api/products') => {
    const response = await app.request(path);
    expect(response.status).toBe(200);
    return ((await response.json()) as { items: ProductListItem[] }).items;
  };

  it('[TC-API-001] 商品10件を商品コード順に返す', async () => {
    const items = await list();
    expect(items).toHaveLength(10);
    expect(items[0]?.code).toBe('BT-350');
  });

  it('[TC-API-002] ぬくもりボトルは4色それぞれの在庫と幅400の画像を持つ', async () => {
    const bottle = (await list()).find((item) => item.code === 'BT-350');
    expect(bottle?.price).toBe(3300);
    expect(bottle?.colors.map((color) => color.color).sort()).toEqual(['墨', '桜', '生成り', '若草'].sort());
    expect(bottle?.colors[0]?.image).toMatch(/_400\.webp$/);
  });

  it('[TC-API-003] カテゴリで絞り込む', async () => {
    const items = await list('/api/products?category=container');
    expect(items.map((item) => item.code)).toEqual(['FC-L', 'FC-M', 'FC-S', 'FC-SET']);
  });

  it('[TC-API-005] 商品詳細：カラーごとに幅400／800／1200の画像', async () => {
    const response = await app.request('/api/products/BT-500');
    const body = (await response.json()) as { colors: { images: { width: number }[] }[] };
    expect(body.colors).toHaveLength(4);
    expect(body.colors[0]?.images.map((image) => image.width).sort((a, b) => a - b)).toEqual([400, 800, 1200]);
  });

  it('[TC-API-006] ない商品は404', async () => {
    const response = await app.request('/api/products/XX-999');
    expect(response.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('ok を返す', async () => {
    const ctx = await createTestDb();
    const response = await createApp(ctx.db).request('/health');
    expect(await response.json()).toEqual({ status: 'ok' });
    await ctx.close();
  });
});

describe('GET /api/products の発行SQL', () => {
  it('[TC-API-004][B4] 商品一覧（10件）を返すSQLは3本以内', async () => {
    const ctx = await createTestDb();
    try {
      const response = await createApp(ctx.db).request('/api/products');
      expect(response.status).toBe(200);
      expect(ctx.queries.length).toBeLessThanOrEqual(3);
    } finally {
      await ctx.close();
    }
  });
});
