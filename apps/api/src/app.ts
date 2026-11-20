import { Hono } from 'hono';
import type { Db } from './db';
import { productRoutes } from './routes/products';
import { adminOrderRoutes } from './routes/adminOrders';

export function createApp(db: Db, { enableLocalAdmin = false } = {}) {
  const app = new Hono();
  app.get('/health', (c) => c.json({ status: 'ok' }));
  app.route('/api/products', productRoutes(db));
  if (enableLocalAdmin) app.route('/admin/orders', adminOrderRoutes(db));
  return app;
}
