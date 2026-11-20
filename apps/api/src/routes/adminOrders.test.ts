import { schema } from '@komorebi/db';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { createTestDb } from '../testDb';

describe('管理画面の注文一覧', () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    testDb = await createTestDb();
    await testDb.db.insert(schema.orders).values([
      { id: '00000000-0000-4000-8000-000000000001', orderNo: 'ORDER-BEFORE', orderedAt: new Date('2026-11-19T14:59:59.999Z'), status: 'paid', totalInclTax: '1000' },
      { id: '00000000-0000-4000-8000-000000000002', orderNo: 'ORDER-START', orderedAt: new Date('2026-11-19T15:00:00.000Z'), status: 'paid', totalInclTax: '2000' },
      { id: '00000000-0000-4000-8000-000000000003', orderNo: 'ORDER-END', orderedAt: new Date('2026-11-20T14:59:59.999Z'), status: 'shipped', totalInclTax: '3000' },
      { id: '00000000-0000-4000-8000-000000000004', orderNo: 'ORDER-AFTER', orderedAt: new Date('2026-11-20T15:00:00.000Z'), status: 'paid', totalInclTax: '4000' },
    ]);
    app = createApp(testDb.db, { enableLocalAdmin: true });
  });

  afterAll(async () => { await testDb?.close(); });

  it.each([
    ['', ['AFTER', 'END', 'START', 'BEFORE']],
    ['?from=2026-11-20', ['AFTER', 'END', 'START']],
    ['?to=2026-11-20', ['END', 'START', 'BEFORE']],
    ['?from=2026-11-20&to=2026-11-20', ['END', 'START']],
    ['?status=paid', ['AFTER', 'START', 'BEFORE']],
    ['?from=2026-11-20&to=2026-11-20&status=paid', ['START']],
    ['?status=unknown', []],
  ])('検索条件 %s に一致する注文を新しい順に表示する', async (query, expected) => {
    const response = await app.request(`/admin/orders${query}`);
    expect(response.status).toBe(200);
    const body = await response.text();
    const orderNumbers = Array.from(body.matchAll(/<td>ORDER-([A-Z]+)<\/td>/g), (match) => match[1]);
    expect(orderNumbers).toEqual(expected);
    if (expected.length === 0) expect(body).toContain('該当する注文はありません。');
  });

  it('フォームに検索条件を保持する', async () => {
    const response = await app.request('/admin/orders?from=2026-11-20&to=2026-11-21&status=paid');
    const body = await response.text();
    expect(body).toContain('name="from" value="2026-11-20"');
    expect(body).toContain('name="to" value="2026-11-21"');
    expect(body).toContain('<option value="paid" selected>');
    expect(body).toContain('value="shipped"');
  });

  it.each([
    ['?from=2026-02-30', '注文日は有効な日付を指定してください。'],
    ['?to=2026-2-01', '注文日は有効な日付を指定してください。'],
    ['?from=2026-11-21&to=2026-11-20', '終了日は開始日以降を指定してください。'],
  ])('無効な検索条件 %s を表示する', async (query, message) => {
    const response = await app.request(`/admin/orders${query}`);
    expect(response.status).toBe(400);
    expect(await response.text()).toContain(message);
  });

  it('ローカル管理画面を有効化していない場合は公開しない', async () => {
    const response = await createApp(testDb.db).request('/admin/orders');
    expect(response.status).toBe(404);
  });
});
