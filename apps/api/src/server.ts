// ローカルでAPIを起動する：pnpm dev:api（先に docker compose up -d db と pnpm db:migrate）
import { serve } from '@hono/node-server';
import { schema } from '@komorebi/db';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { createApp } from './app';

const pool = new pg.Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? 'komorebi',
  user: process.env.DB_USER ?? 'komorebi',
  password: process.env.DB_PASSWORD,
});

const db = drizzle(pool, { schema, logger: process.env.LOG_SQL === '1' });
const port = Number(process.env.API_PORT ?? 8787);

const enableLocalAdmin = process.env.ENABLE_LOCAL_ADMIN === '1';
const hostname = enableLocalAdmin ? '127.0.0.1' : undefined;

serve({ fetch: createApp(db, { enableLocalAdmin }).fetch, port, hostname }, (info) => {
  console.log(`API: http://localhost:${info.port}`);
});
