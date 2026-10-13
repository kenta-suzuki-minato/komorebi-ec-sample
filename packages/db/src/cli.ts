// pnpm db:migrate / pnpm db:seed から呼ぶ（接続先は .env の DB_*）
import pg from 'pg';
import { migrate } from './migrate';
import { seed } from './seed';

const pool = new pg.Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'komorebi',
  user: process.env.DB_USER ?? 'komorebi',
  password: process.env.DB_PASSWORD,
});

const command = process.argv[2];
try {
  const exec = (sql: string) => pool.query(sql);
  if (command === 'migrate') {
    const done = await migrate(exec, (sql) => pool.query(sql));
    console.log(done.length > 0 ? `適用しました：${done.join(', ')}` : '適用するマイグレーションはありません');
  } else if (command === 'seed') {
    await seed(exec);
    console.log('商品データを入れました');
  } else {
    console.error('使い方：tsx packages/db/src/cli.ts migrate|seed');
    process.exitCode = 1;
  }
} finally {
  await pool.end();
}
