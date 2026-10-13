import { Hono } from 'hono';
import type { Db } from './db';
import { productRoutes } from './routes/products';

export function createApp(db: Db) {
  const app = new Hono();
  app.get('/health', (c) => c.json({ status: 'ok' }));
  app.route('/api/products', productRoutes(db));
  return app;
}
