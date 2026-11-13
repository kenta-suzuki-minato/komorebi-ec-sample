# komorebi-ec-sample

架空の生活雑貨メーカー「こもれびリビング」の自社オンラインショップ「こもれびストア」を作り直している、という設定のサンプルリポジトリです。
AIコーディングエージェントの使い方を学ぶ書籍の練習用で、本文のレシピはすべてこのリポジトリで試せます。

登場する会社・人物・商品・データはすべて架空です（[NOTICE.md](NOTICE.md)）。

## 構成

| ディレクトリ | 内容 |
|---|---|
| `packages/domain` | 金額・消費税・ポイント・のし・住所の業務ルール |
| `packages/db` | PostgreSQL のマイグレーション（SQL）、Drizzle のテーブル定義、開発用データ |
| `apps/web` | Webフロント（Next.js。商品ページ、カート、購入手続き） |
| `apps/api` | APIサーバー（Hono。商品API、注文確認メール、領収書、リクエストの検証） |
| `batch` | ポイント有効期限、出荷指示データ（Shift_JIS） |
| `docs` | 要件定義書、技術設計書、用語集、オンボーディングメモ、テンプレート |
| `test-support` | テスト用の商品マスタ |
| `e2e` | 画面のE2Eテスト（Playwright） |

## セットアップ

```console
pnpm install
pnpm test
```

APIを動かすときは、PostgreSQL を Docker で起動してからデータを入れます。

```console
cp .env.example .env
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

`http://localhost:8787/api/products` で商品一覧が返れば成功です。単体テスト（`pnpm test`）は Docker なしで動きます（メモリ上の PostgreSQL＝PGlite を使います）。

画面（Webフロント）は Docker なしで動きます。`pnpm dev:web` で起動し、`http://localhost:3000` を開きます。

E2Eテストは、初回だけブラウザを入れてから実行します。テストが Webフロントをビルドして、ポート 3100 で起動します。

```console
pnpm exec playwright install chromium
pnpm test:e2e
```

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | 単体テスト（Vitest） |
| `pnpm db:migrate` / `pnpm db:seed` | マイグレーション／開発用データ |
| `pnpm dev:api` | APIサーバーを起動（http://localhost:8787） |
| `pnpm dev:web` | Webフロントを起動（http://localhost:3000） |
| `pnpm test:e2e` | E2Eテスト（Playwright） |

## ブランチとPR

`feature/KEC-xx-短い説明` でブランチを作り、`develop` へPRを出します。`develop` と `main` には直接pushしません。

## ライセンス

MIT（[LICENSE](LICENSE)）
