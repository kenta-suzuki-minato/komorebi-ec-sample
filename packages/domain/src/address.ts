// お届け先の入力チェック（郵便番号・電話番号）。

function normalizeNumberCharacters(input: string): string {
  return input
    .replace(/[０-９]/g, (digit) => digit.normalize('NFKC'))
    // - (U+002D), － (U+FF0D), ‐ (U+2010), − (U+2212), ー (U+30FC), ｰ (U+FF70)
    .replace(/[-－‐−ーｰ]/g, '-');
}

/** "123-4567" または "1234567" を "123-4567" にそろえる。形式が違えば null */
export function normalizePostalCode(input: string): string | null {
  const postalCode = normalizeNumberCharacters(input.trim()).replace(/^〒[ \u3000]*/, '');
  const match = /^(\d{3})-?(\d{4})$/.exec(postalCode);
  return match ? `${match[1]}-${match[2]}` : null;
}

/** 電話番号をハイフンなしの数字だけにそろえる。10桁または11桁でなければ null */
export function normalizePhoneNumber(input: string): string | null {
  const digits = normalizeNumberCharacters(input.trim())
    .replace(/[ \u3000]/g, '')
    .replace(/^(?:\((0\d+)\)|（(0\d+)）)/, '$1$2')
    .replace(/-/g, '');
  return /^0\d{9,10}$/.test(digits) ? digits : null;
}
