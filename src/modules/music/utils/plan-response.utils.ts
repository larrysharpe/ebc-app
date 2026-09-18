import type {
  PlanAttendance,
  PlanAttendanceStatus,
  PlanAttendanceSummary,
} from '../types/plan-response.types';

export function isPlanAttendanceStatus(
  value: string,
): value is PlanAttendanceStatus {
  return (
    value === 'attending' || value === 'not_attending' || value === 'maybe'
  );
}

export function summarizePlanAttendance(
  rows: readonly Pick<PlanAttendance, 'status'>[],
): PlanAttendanceSummary {
  const summary: PlanAttendanceSummary = {
    attending: 0,
    not_attending: 0,
    maybe: 0,
    total: rows.length,
  };
  for (const row of rows) {
    summary[row.status] += 1;
  }
  return summary;
}
