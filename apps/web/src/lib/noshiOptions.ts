import { NOSHI_OMOTEGAKI } from '@komorebi/domain';

// 購入手続き画面「のし」の選択肢（KEC-13）。
export const NOSHI_OPTIONS = NOSHI_OMOTEGAKI.map((value) => ({ value, label: value } as const));

export const NOSHI_NONE_LABEL = 'のしなし';
