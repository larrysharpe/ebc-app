import Link from 'next/link';

import type { SessionUser } from '@/modules/auth/types/auth.types';

import type { ServiceMusicPlan, Song } from '../../types';
import type { PlanResponseBoard } from '../../types/plan-response.types';
import {
  formatPracticeDateTime,
  formatServiceDate,
} from '../../utils/music.format';
import { PlanResponsePanel } from '../plan-recipient';
import { PlanRehearsalSetList } from './PlanRehearsalSetList';

export type PlanRehearsalProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
  currentUser?: SessionUser | null;
  responseBoard?: PlanResponseBoard | null;
  canViewRoster?: boolean;
};

export function PlanRehearsal({
  plan,
  songs,
  currentUser = null,
  responseBoard = null,
  canViewRoster = false,
}: PlanRehearsalProps) {
  const practice = formatPracticeDateTime(plan);
  const showResponses =
    plan.status === 'sent' && currentUser && responseBoard;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/music/plans/${plan.id}`}
          className="text-base font-medium text-ebc-burgundy hover:underline"
        >
          ← Back to plan
        </Link>
        <h2 className="mt-2 font-display text-2xl text-ebc-burgundy sm:text-3xl">
          {plan.title}
        </h2>
        <p className="mt-1 text-base text-slate-600">
          Sunday — {formatServiceDate(plan.serviceDate)}
          {practice ? ` · Practice — ${practice}` : ''}
        </p>
        <p className="mt-2 text-base text-slate-600">
          First, say if you can make it. Then open each song to practice.
        </p>
      </div>

      {showResponses ? (
        <PlanResponsePanel
          key={responseBoard.myAttendance?.updatedAt ?? 'attendance'}
          planId={plan.id}
          currentUser={currentUser}
          myAttendance={responseBoard.myAttendance}
          attendance={responseBoard.attendance}
          summary={responseBoard.summary}
          comments={responseBoard.comments}
          canViewRoster={canViewRoster}
        />
      ) : null}

      <PlanRehearsalSetList plan={plan} songs={songs} />
    </div>
  );
}
