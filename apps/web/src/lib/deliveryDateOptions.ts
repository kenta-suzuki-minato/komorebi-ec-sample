/** お届け希望日の候補（YYYY-MM-DD）から年末年始の休業日を除く。 */
export function filterDeliveryDateOptions(dates: readonly string[]): string[] {
  return dates.filter((date) => {
    const monthDay = date.slice(5);
    const isYearEnd = monthDay >= '12-29' && monthDay <= '12-31';
    const isNewYear = monthDay >= '01-01' && monthDay <= '01-03';
    return !isYearEnd && !isNewYear;
  });
}
