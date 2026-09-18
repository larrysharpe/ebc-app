/**
 * Time-of-day overlap helpers for church room conflict checks.
 * Times are HH:MM (24h). Missing times are treated as all-day occupancy.
 */

export type TimedInterval = {
  startTime?: string;
  endTime?: string;
};

/** Minutes from midnight; invalid strings return null. */
export function timeToMinutes(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Resolve a booking window in minutes.
 * - No start/end → full day [0, 1440)
 * - Start only → [start, 1440)
 * - End only → [0, end)
 * - Both → [start, end) ; if end <= start, treat end as next-day wrap (end + 1440)
 */
export function resolveIntervalMinutes(interval: TimedInterval): {
  start: number;
  end: number;
} {
  const start = timeToMinutes(interval.startTime);
  const end = timeToMinutes(interval.endTime);

  if (start === null && end === null) {
    return { start: 0, end: 1440 };
  }
  if (start !== null && end === null) {
    return { start, end: 1440 };
  }
  if (start === null && end !== null) {
    return { start: 0, end };
  }

  const safeStart = start as number;
  let safeEnd = end as number;
  if (safeEnd <= safeStart) {
    safeEnd += 1440;
  }
  return { start: safeStart, end: safeEnd };
}

export function intervalsOverlap(
  a: TimedInterval,
  b: TimedInterval,
): boolean {
  const left = resolveIntervalMinutes(a);
  const right = resolveIntervalMinutes(b);
  return left.start < right.end && right.start < left.end;
}
