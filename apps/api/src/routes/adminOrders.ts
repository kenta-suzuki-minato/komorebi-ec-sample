import { schema } from '@komorebi/db';
import { and, asc, desc, eq, gte, lt } from 'drizzle-orm';
import { Hono } from 'hono';
import { html } from 'hono/html';
import type { Db } from '../db';

const { orders } = schema;
const dayMs = 24 * 60 * 60 * 1000;
const orderDateFormat = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Tokyo',
});
const yenFormat = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

function parseOrderDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return undefined;
  const midnightUtc = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(midnightUtc.getTime()) || midnightUtc.toISOString().slice(0, 10) !== value) {
    return undefined;
  }
  return new Date(`${value}T00:00:00+09:00`);
}

export function adminOrderRoutes(db: Db) {
  const app = new Hono();
  app.get('/', async (c) => {
    c.header('Cache-Control', 'no-store');
    const { from = '', to = '', status = '' } = c.req.query();
    const start = parseOrderDate(from);
    const end = parseOrderDate(to);
    const error = (from && !start) || (to && !end)
      ? '注文日は有効な日付を指定してください。'
      : start && end && start > end
        ? '終了日は開始日以降を指定してください。'
        : '';

    const statuses = await db.selectDistinct({ status: orders.status }).from(orders).orderBy(asc(orders.status));
    const rows = error ? [] : await db
      .select({
        orderNo: orders.orderNo,
        orderedAt: orders.orderedAt,
        status: orders.status,
        totalInclTax: orders.totalInclTax,
      })
      .from(orders)
      .where(and(
        start ? gte(orders.orderedAt, start) : undefined,
        end ? lt(orders.orderedAt, new Date(end.getTime() + dayMs)) : undefined,
        status ? eq(orders.status, status) : undefined,
      ))
      .orderBy(desc(orders.orderedAt), asc(orders.orderNo));

    return c.html(html`<!doctype html>
      <html lang="ja">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>注文一覧 | こもれびストア</title>
      </head>
      <body>
        <main>
          <h1>注文一覧</h1>
          <form action="/admin/orders" method="get">
            <fieldset>
              <legend>検索条件</legend>
              <label>注文日（日本時間）の開始日 <input type="date" name="from" value="${from}"></label>
              <label>終了日 <input type="date" name="to" value="${to}"></label>
              <label>状態
                <select name="status">
                  <option value="">すべて</option>
                  ${status && !statuses.some((row) => row.status === status)
                    ? html`<option value="${status}" selected>${status}</option>` : ''}
                  ${statuses.map((row) => html`<option value="${row.status}" ${row.status === status ? 'selected' : ''}>${row.status}</option>`)}
                </select>
              </label>
              <button type="submit">検索</button>
              <a href="/admin/orders">条件をクリア</a>
            </fieldset>
          </form>
          ${error ? html`<p role="alert">${error}</p>` : rows.length ? html`
            <table>
              <thead><tr><th scope="col">注文番号</th><th scope="col">注文日時</th><th scope="col">状態</th><th scope="col">税込合計</th></tr></thead>
              <tbody>
                ${rows.map((row) => html`<tr>
                  <td>${row.orderNo}</td><td>${orderDateFormat.format(row.orderedAt)}</td>
                  <td>${row.status}</td><td>${yenFormat.format(Number(row.totalInclTax))}</td>
                </tr>`)}
              </tbody>
            </table>` : html`<p>該当する注文はありません。</p>`}
        </main>
      </body>
      </html>`, error ? 400 : 200);
  });
  return app;
}
