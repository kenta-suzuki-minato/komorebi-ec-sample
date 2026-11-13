import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'ポイント｜こもれびストア' };

// 会員ページのポイント（会員APIとの接続まではサンプルの会員の固定データ）
const HISTORY = [
  { date: '2026-11-02', description: 'ご購入（注文番号 KS-20261102-0042）', points: 33 },
  { date: '2026-10-18', description: 'ポイント利用（注文番号 KS-20261018-0017）', points: -200 },
  { date: '2026-10-05', description: 'ご購入（注文番号 KS-20261005-0008）', points: 57 },
] as const;

const BALANCE = 1240;

export default function PointsPage() {
  return (
    <>
      <h1>ポイント</h1>
      <p>
        会員番号 M-000123 様のポイント残高：<strong data-testid="point-balance">{BALANCE.toLocaleString('ja-JP')}ポイント</strong>
      </p>
      <h2>ポイント履歴</h2>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>内容</th>
            <th className="num">ポイント</th>
          </tr>
        </thead>
        <tbody>
          {HISTORY.map((row) => (
            <tr key={row.date}>
              <td>{row.date}</td>
              <td>{row.description}</td>
              <td className="num">{row.points > 0 ? `+${row.points}` : row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
