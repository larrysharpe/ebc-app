export type PlanAttendanceStatus = 'attending' | 'not_attending' | 'maybe';

export const PLAN_ATTENDANCE_STATUSES = [
  'attending',
  'not_attending',
  'maybe',
] as const satisfies readonly PlanAttendanceStatus[];

export const PLAN_ATTENDANCE_STATUS_LABELS: Record<PlanAttendanceStatus, string> = {
  attending: "Yes — I'll be there",
  not_attending: "No — I can't make it",
  maybe: 'Maybe',
};

export const PLAN_ATTENDANCE_STATUS_SHORT: Record<PlanAttendanceStatus, string> = {
  attending: 'Yes',
  not_attending: 'No',
  maybe: 'Maybe',
};

export type PlanAttendance = {
  id: string;
  planId: string;
  userId: string;
  personId?: string;
  status: PlanAttendanceStatus;
  note?: string;
  /** Display name from the responding user. */
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanComment = {
  id: string;
  planId: string;
  userId: string;
  personId?: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanAttendanceSummary = {
  attending: number;
  not_attending: number;
  maybe: number;
  total: number;
};

export type PlanResponseBoard = {
  attendance: PlanAttendance[];
  comments: PlanComment[];
  summary: PlanAttendanceSummary;
  myAttendance: PlanAttendance | null;
};
