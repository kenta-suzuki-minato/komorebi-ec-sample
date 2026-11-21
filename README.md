# komorebi-ec-sample

架空の生活雑貨メーカー「こもれびリビング」の自社オンラインショップ「こもれびストア」を作り直している、という設定のサンプルリポジトリです。
AIコーディングエージェントの使い方を学ぶ書籍の練習用で、本文のレシピはすべてこのリポジトリで試せます。

登場する会社・人物・商品・データはすべて架空です（[NOTICE.md](NOTICE.md)）。

## 構成

| ディレクトリ | 内容 |
|---|---|
| `packages/domain` | 金額・消費税・ポイント・のし・住所の業務ルール |
| `packages/db` | PostgreSQL のマイグレーション（SQL）、Drizzle のテーブル定義、開発用データ |
| `apps/web` | Webフロント（注文画面の金額表示） |
| `apps/api` | APIサーバー（Hono。商品API、注文確認メール、領収書、リクエストの検証） |
| `batch` | ポイント有効期限、出荷指示データ（Shift_JIS） |
| `docs` | 要件定義書、技術設計書、用語集、オンボーディングメモ、テンプレート |
| `test-support` | テスト用の商品マスタ |

## セットアップ

`pnpm install` の前に、リポジトリ直下の [`.node-version`](.node-version) に指定された Node.js（現在は 22 系）をインストールし、使用するシェルでそのバージョンに切り替えます。たとえば、セットアップ済みの `fnm` を使う場合は PowerShell で次を実行します。

```powershell
$nodeVersion = (Get-Content .node-version -Raw).Trim()
fnm install $nodeVersion
fnm use $nodeVersion
node --version
```

`node --version` が `.node-version` の指定に合っていることを確認してから進みます。指定範囲外の Node.js では、`.npmrc` の `engine-strict=true` により `pnpm install` が `Unsupported engine` で止まります。

```console
pnpm install
pnpm test
```

APIを動かすときは、PostgreSQL を Docker で起動してからデータを入れます。

PostgreSQL のホスト側ポートは既定で `5432` です。別のコンテナやプロセスが `5432` を使っていると、`docker compose up -d db` は `port is already allocated` で止まります。その場合は、下の手順で `.env` を作成したあと、DB を起動する前に `.env` の `DB_PORT` を空いているポート（例 `DB_PORT=5433`）に設定してください。すでに `.env` がある場合は、そのファイルを編集します。Compose の公開ポートと、API・マイグレーション・シードの接続先には同じ `DB_PORT` が使われます。

```console
cp .env.example .env
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

`http://localhost:8787/api/products` で商品一覧が返れば成功です。単体テスト（`pnpm test`）は Docker なしで動きます（メモリ上の PostgreSQL＝PGlite を使います）。

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `pnpm lint` | ESLint |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | 単体テスト（Vitest） |
| `pnpm db:migrate` / `pnpm db:seed` | マイグレーション／開発用データ |
| `pnpm dev:api` | APIサーバーを起動（http://localhost:8787） |

## ブランチとPR

`feature/KEC-xx-短い説明` でブランチを作り、`develop` へPRを出します。`develop` と `main` には直接pushしません。

## ライセンス

MIT（[LICENSE](LICENSE)）
