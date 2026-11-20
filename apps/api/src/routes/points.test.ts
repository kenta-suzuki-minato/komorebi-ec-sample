import { describe, expect, it } from 'vitest';
import { pointsRoutes } from './points';

describe('ポイント履歴の失効予定日', () => {
  it.each(['00:00', '00:30', '08:59', '09:00'])(
    '日本時間 %s の購入から1年後の同じ日をAPIと画面で返す',
    async (time) => {
      const history = [{ kind: 'grant', points: 33 }] as const;
      const app = pointsRoutes(async () => ({
        balance: 33,
        history,
        lastPurchasedAt: new Date(`2026-11-18T${time}:00+09:00`),
      }));

      const apiResponse = await app.request('/api/members/me/points');
      expect(apiResponse.status).toBe(200);
      expect(await apiResponse.json()).toEqual({ balance: 33, history, expiresOn: '2027-11-18' });

      const pageResponse = await app.request('/members/me/points');
      expect(pageResponse.status).toBe(200);
      expect(await pageResponse.text()).toContain(
        '<dt>失効予定日</dt><dd><time datetime="2027-11-18">2027-11-18</time></dd>',
      );
    },
  );

  it('翌年に同じ日付が存在しない場合は失効予定日を表示しない', async () => {
    const app = pointsRoutes(async () => ({
      balance: 33,
      history: [],
      lastPurchasedAt: new Date('2024-02-29T00:30:00+09:00'),
    }));

    const apiResponse = await app.request('/api/members/me/points');
    expect(await apiResponse.json()).toMatchObject({ expiresOn: null });
    const pageResponse = await app.request('/members/me/points');
    expect(await pageResponse.text()).not.toContain('失効予定日');
  });

  it('会員を確認できないリクエストには履歴を返さない', async () => {
    const app = pointsRoutes(async () => null);
    expect((await app.request('/api/members/me/points')).status).toBe(401);
    expect((await app.request('/members/me/points')).status).toBe(401);
  });
});
