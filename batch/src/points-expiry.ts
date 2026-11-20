// ポイント有効期限バッチ：失効予定日が近い会員を抜き出す（お知らせメール用）。
import { calcPointExpiryDate } from '@komorebi/domain';

export interface MemberPoints {
  memberId: string;
  balance: number;
  lastPurchasedAt: Date;
}

export interface ExpiringMember {
  memberId: string;
  balance: number;
  expiresOn: string;
}

/** today（YYYY-MM-DD）から days 日以内に失効する会員（残高0は除く） */
export function findExpiringMembers(
  members: readonly MemberPoints[],
  today: string,
  days = 30,
): ExpiringMember[] {
  const limit = new Date(`${today}T00:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() + days);
  const limitText = limit.toISOString().slice(0, 10);

  return members
    .filter((member) => member.balance > 0)
    .flatMap((member) => {
      const expiresOn = calcPointExpiryDate(member.lastPurchasedAt);
      return expiresOn === null ? [] : [{ memberId: member.memberId, balance: member.balance, expiresOn }];
    })
    .filter((member) => member.expiresOn >= today && member.expiresOn <= limitText)
    .sort((a, b) => a.expiresOn.localeCompare(b.expiresOn));
}
