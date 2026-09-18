const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

function ordinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/** e.g. 2026-07-19 → "3rd Sunday"; 2026-07-06 → "1st Monday". */
export function formatOrdinalWeekday(isoDate: string): string | null {
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const occurrence = Math.ceil(date.getDate() / 7);
  if (occurrence < 1 || occurrence > 5) return null;

  return `${occurrence}${ordinalSuffix(occurrence)} ${WEEKDAY_NAMES[date.getDay()]}`;
}
