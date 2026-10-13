// お届け先の入力チェック（郵便番号・電話番号）。

/** "123-4567" または "1234567" を "123-4567" にそろえる。形式が違えば null */
export function normalizePostalCode(input: string): string | null {
  const match = /^(\d{3})-?(\d{4})$/.exec(input.trim());
  return match ? `${match[1]}-${match[2]}` : null;
}

/** 電話番号をハイフンなしの数字だけにそろえる。10桁または11桁でなければ null */
export function normalizePhoneNumber(input: string): string | null {
  const digits = input.trim().replace(/-/g, '');
  return /^0\d{9,10}$/.test(digits) ? digits : null;
}
