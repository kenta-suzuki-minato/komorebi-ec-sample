import { PGlite } from '@electric-sql/pglite';
import { migrate, schema, seed } from '@komorebi/db';
import { drizzle } from 'drizzle-orm/pglite';
import type { Db } from './db';

/** テスト用のDB（PGlite＝メモリ上の PostgreSQL）。発行したSQLの数を数える */
export async function createTestDb(): Promise<{ db: Db; queries: string[]; close: () => Promise<void> }> {
  const client = new PGlite();
  await migrate((sql) => client.exec(sql), (sql) => client.query<Record<string, unknown>>(sql));
  await seed((sql) => client.exec(sql));
  const queries: string[] = [];
  const db = drizzle(client, { schema, logger: { logQuery: (query) => queries.push(query) } });
  return { db: db as unknown as Db, queries, close: () => client.close() };
}
