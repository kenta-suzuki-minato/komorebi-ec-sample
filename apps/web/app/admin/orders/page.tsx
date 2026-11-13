import type { Metadata } from 'next';
import { formatYen } from '../../../src/lib/catalog';

export const metadata: Metadata = { title: '注文一覧｜こもれびストア 管理画面' };

// 管理画面：注文一覧（注文APIとの接続まではサンプルの固定データ。新しい順）
const ORDERS = [
  { orderNo: 'KS-20261115-0063', orderedAt: '2026-11-15 20:41', member: 'M-000418', total: 7850, status: '出荷準備中' },
  { orderNo: 'KS-20261114-0058', orderedAt: '2026-11-14 09:12', member: 'M-000123', total: 3650, status: '出荷済み' },
  { orderNo: 'KS-20261112-0051', orderedAt: '2026-11-12 13:30', member: 'M-000077', total: 2310, status: '出荷済み' },
] as const;

export default function AdminOrdersPage() {
  return (
    <>
      <h1>注文一覧</h1>
      <table>
        <thead>
          <tr>
            <th>注文番号</th>
            <th>注文日時</th>
            <th>会員番号</th>
            <th className="num">合計（税込）</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((order) => (
            <tr key={order.orderNo}>
              <td>{order.orderNo}</td>
              <td>{order.orderedAt}</td>
              <td>{order.member}</td>
              <td className="num">{formatYen(order.total)}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
