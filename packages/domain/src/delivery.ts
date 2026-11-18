/** お届け希望日の選択可否を、暦上の月（1〜12）と日で判定する。 */
export function isDeliveryDateSelectable(month: number, day: number): boolean {
  // TODO: 祝日の扱いが確定したら判定に追加する。
  // TODO: 倉庫の休業日が確定したら判定に追加する。
  return !(month === 12 && day >= 29) && !(month === 1 && day <= 3);
}
