import type { PointsHistoryResponse } from '../../api/src/types';

const historyLabels = { grant: '付与', use: '利用', expire: '失効' };

export function renderPointsHistory({ balance, expiresOn, history }: PointsHistoryResponse): string {
  const expiry = expiresOn === null
    ? ''
    : `<dt>失効予定日</dt><dd><time datetime="${expiresOn}">${expiresOn}</time></dd>`;
  const rows = history.map(({ kind, points }) =>
    `<tr><td>${historyLabels[kind]}</td><td>${points}</td></tr>`,
  ).join('');

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ポイント履歴</title>
</head>
<body>
  <main>
    <h1>ポイント履歴</h1>
    <dl><dt>保有ポイント</dt><dd>${balance}</dd>${expiry}</dl>
    <table>
      <thead><tr><th scope="col">区分</th><th scope="col">ポイント</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </main>
</body>
</html>`;
}
