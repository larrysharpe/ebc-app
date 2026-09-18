export type PlanningHoliday = {
  date: string;
  name: string;
};

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** nth weekday in month (weekday: 0=Sun … 6=Sat). */
function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number,
): string {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return toIso(year, month, day);
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): string {
  const last = new Date(Date.UTC(year, month, 0));
  const day = last.getUTCDate() - ((last.getUTCDay() - weekday + 7) % 7);
  return toIso(year, month, day);
}

/** Easter Sunday (Anonymous Gregorian algorithm). */
export function easterSundayIso(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toIso(year, month, day);
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function holidaysForYear(year: number): PlanningHoliday[] {
  const easter = easterSundayIso(year);
  return [
    { date: toIso(year, 1, 1), name: "New Year's Day" },
    {
      date: nthWeekdayOfMonth(year, 1, 1, 3),
      name: 'Martin Luther King Jr. Day',
    },
    { date: nthWeekdayOfMonth(year, 2, 1, 3), name: "Presidents' Day" },
    { date: addDaysIso(easter, -2), name: 'Good Friday' },
    { date: easter, name: 'Easter Sunday' },
    { date: lastWeekdayOfMonth(year, 5, 1), name: 'Memorial Day' },
    { date: toIso(year, 6, 19), name: 'Juneteenth' },
    { date: toIso(year, 7, 4), name: 'Independence Day' },
    { date: nthWeekdayOfMonth(year, 9, 1, 1), name: 'Labor Day' },
    { date: nthWeekdayOfMonth(year, 10, 1, 2), name: 'Columbus Day' },
    { date: toIso(year, 11, 11), name: 'Veterans Day' },
    { date: nthWeekdayOfMonth(year, 11, 4, 4), name: 'Thanksgiving Day' },
    {
      date: addDaysIso(nthWeekdayOfMonth(year, 11, 4, 4), 1),
      name: 'Day after Thanksgiving',
    },
    { date: toIso(year, 12, 24), name: 'Christmas Eve' },
    { date: toIso(year, 12, 25), name: 'Christmas Day' },
    { date: toIso(year, 12, 31), name: "New Year's Eve" },
  ];
}

/**
 * US civic + common church calendar dates between `fromIso` and `toIso` (inclusive).
 */
export function listPlanningHolidays(
  fromIso: string,
  toIso: string,
): PlanningHoliday[] {
  const from = fromIso.slice(0, 10);
  const to = toIso.slice(0, 10);
  const startYear = Number(from.slice(0, 4));
  const endYear = Number(to.slice(0, 4));
  const out: PlanningHoliday[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    for (const holiday of holidaysForYear(year)) {
      if (holiday.date >= from && holiday.date <= to) {
        out.push(holiday);
      }
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function defaultPlanningWindow(now: Date = new Date()): {
  fromIso: string;
  toIso: string;
} {
  const fromIso = now.toISOString().slice(0, 10);
  const to = new Date(now);
  to.setUTCDate(to.getUTCDate() + 90);
  return { fromIso, toIso: to.toISOString().slice(0, 10) };
}
