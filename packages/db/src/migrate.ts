import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** SQL を1回で実行する関数（node-postgres の Pool#query、PGlite#exec など） */
export type SqlExecutor = (sql: string) => Promise<unknown>;
export type SqlQuery = (sql: string) => Promise<{ rows: Record<string, unknown>[] }>;

const MIGRATIONS_DIR = fileURLToPath(new URL('../migrations/', import.meta.url));

/** migrations/*.sql を番号順に適用する。適用済みのものは schema_migrations に記録して飛ばす */
export async function migrate(exec: SqlExecutor, query: SqlQuery): Promise<string[]> {
  await exec('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const applied = new Set((await query('SELECT name FROM schema_migrations')).rows.map((row) => String(row.name)));
  const files = readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith('.sql')).sort();
  const done: string[] = [];
  for (const name of files) {
    if (applied.has(name)) continue;
    await exec(readFileSync(MIGRATIONS_DIR + name, 'utf8'));
    await exec(`INSERT INTO schema_migrations (name) VALUES ('${name}')`);
    done.push(name);
  }
  return done;
}
