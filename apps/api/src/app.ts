import { Hono } from 'hono';
import type { Db } from './db';
import { pointsRoutes, type LoadMemberPoints } from './routes/points';
import { productRoutes } from './routes/products';

export function createApp(db: Db, loadMemberPoints?: LoadMemberPoints) {
  const app = new Hono();
  app.get('/health', (c) => c.json({ status: 'ok' }));
  app.route('/api/products', productRoutes(db));
  if (loadMemberPoints) app.route('/', pointsRoutes(loadMemberPoints));
  return app;
}
