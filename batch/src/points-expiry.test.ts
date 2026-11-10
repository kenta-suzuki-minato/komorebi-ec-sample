import { describe, expect, it } from 'vitest';
import { findExpiringMembers, type MemberPoints } from './points-expiry';

const member = (memberId: string, balance: number, lastPurchasedAt: string): MemberPoints => ({
  memberId,
  balance,
  lastPurchasedAt: new Date(lastPurchasedAt),
});

describe('findExpiringMembers', () => {
  const members = [
    member('M001', 120, '2025-12-01T14:00:00+09:00'),
    member('M002', 0, '2025-12-05T14:00:00+09:00'),
    member('M003', 33, '2026-03-10T11:00:00+09:00'),
    member('M004', 8, '2025-11-25T16:00:00+09:00'),
  ];

  it('30日以内に失効する会員を、失効日の早い順に返す', () => {
    expect(findExpiringMembers(members, '2026-11-18')).toEqual([
      { memberId: 'M004', balance: 8, expiresOn: '2026-11-25' },
      { memberId: 'M001', balance: 120, expiresOn: '2026-12-01' },
    ]);
  });

  it('残高0の会員は対象外', () => {
    expect(findExpiringMembers(members, '2026-11-18').map((m) => m.memberId)).not.toContain('M002');
  });

  it('日数を指定できる', () => {
    expect(findExpiringMembers(members, '2026-11-18', 7).map((m) => m.memberId)).toEqual(['M004']);
  });
});

describe('findExpiringMembers（日本時間の日付）', () => {
  it.fails('[TC-PT-014][B7] 2025-11-19 0:30（日本時間）に購入した会員の失効日は 2026-11-19', () => {
    const result = findExpiringMembers([member('M101', 55, '2025-11-19T00:30:00+09:00')], '2026-11-18');
    expect(result[0]?.expiresOn).toBe('2026-11-19');
  });
});
