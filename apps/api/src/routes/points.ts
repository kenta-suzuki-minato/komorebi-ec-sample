import { calcPointExpiryDate } from '@komorebi/domain';
import { Hono } from 'hono';
import { renderPointsHistory } from '../../../web/src/pointsHistory';
import type { PointsHistoryResponse } from '../types';

interface MemberPointsSnapshot extends Omit<PointsHistoryResponse, 'expiresOn'> {
  lastPurchasedAt: Date | null;
}

/** 認証済み会員の情報を取得する。認証できない場合は null を返す。 */
export type LoadMemberPoints = (request: Request) => Promise<MemberPointsSnapshot | null>;

export function pointsRoutes(loadMemberPoints: LoadMemberPoints) {
  const app = new Hono();

  async function loadResponse(request: Request): Promise<PointsHistoryResponse | null> {
    const member = await loadMemberPoints(request);
    if (member === null) return null;

    const { balance, history, lastPurchasedAt } = member;
    return {
      balance,
      history,
      expiresOn: balance > 0 && lastPurchasedAt !== null ? calcPointExpiryDate(lastPurchasedAt) : null,
    };
  }

  app.get('/api/members/me/points', async (c) => {
    c.header('Cache-Control', 'private, no-store');
    const points = await loadResponse(c.req.raw);
    if (points === null) return c.json({ message: 'ログインが必要です' }, 401);
    return c.json(points);
  });

  app.get('/members/me/points', async (c) => {
    c.header('Cache-Control', 'private, no-store');
    const points = await loadResponse(c.req.raw);
    if (points === null) return c.text('ログインが必要です', 401);
    return c.html(renderPointsHistory(points));
  });

  return app;
}
