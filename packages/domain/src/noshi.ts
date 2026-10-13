// のし（KEC-13）。表書きは4種（技術設計書 3.3）。名入れは今回の範囲外。

export type NoshiOmotegaki = '無地' | '御歳暮' | '御年賀' | '内祝';

export interface NoshiOption {
  omotegaki: NoshiOmotegaki;
}

/** 出荷指示データの「のし」欄に入れる文字列。のしなしは空文字 */
export function noshiLabel(noshi: NoshiOption | undefined): string {
  if (!noshi) return '';
  return `のし（${noshi.omotegaki}）`;
}
