/**
 * Next calendar day on or after `fromIso` that is not already in `takenDates`
 * (dates that already have a scheduled church service).
 */
export function getNextUnscheduledDate(
  takenDates: readonly string[],
  fromIso: string = new Date().toISOString().slice(0, 10),
): string {
  const taken = new Set(
    takenDates.map((date) => date.slice(0, 10)).filter(Boolean),
  );
  const from = fromIso.slice(0, 10);
  const cursor = new Date(`${from}T12:00:00`);
  if (Number.isNaN(cursor.getTime())) {
    return from;
  }

  for (let i = 0; i < 366; i += 1) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!taken.has(iso)) return iso;
    cursor.setDate(cursor.getDate() + 1);
  }

  return cursor.toISOString().slice(0, 10);
}
