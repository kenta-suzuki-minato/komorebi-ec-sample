import { schema } from '@komorebi/db';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

/** APIが使うDB（本番・開発は node-postgres、テストは PGlite） */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
