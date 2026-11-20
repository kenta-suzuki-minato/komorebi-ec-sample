// のし（KEC-13）。表書きは技術設計書 3.3 を参照。

export const NOSHI_OMOTEGAKI = ['無地', '御歳暮', '御年賀', '内祝', '御祝'] as const;

export type NoshiOmotegaki = (typeof NOSHI_OMOTEGAKI)[number];

export interface NoshiOption {
  omotegaki: NoshiOmotegaki;
}

/** 出荷指示データの「のし」欄に入れる文字列。のしなしは空文字 */
export function noshiLabel(noshi: NoshiOption | undefined): string {
  if (!noshi) return '';
  return `のし（${noshi.omotegaki}）`;
}
