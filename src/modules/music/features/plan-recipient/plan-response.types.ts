import type { SessionUser } from '@/modules/auth/types/auth.types';
import type {
  PlanAttendance,
  PlanAttendanceSummary,
  PlanComment,
} from '@/modules/music/types/plan-response.types';

export type PlanResponseViewProps = {
  planId: string;
  currentUser: SessionUser;
  myAttendance: PlanAttendance | null;
  attendance: PlanAttendance[];
  summary: PlanAttendanceSummary;
  comments: PlanComment[];
  /** Directors see the full attendance roster. */
  canViewRoster: boolean;
};

export type PlanResponseTabId = 'attendance' | 'comments';
