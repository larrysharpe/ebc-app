import Link from 'next/link';

import type { ServiceMusicPlan } from '../../types';
import { ScheduleBadge } from '../ChoirSchedulePanel';
import { formatPracticeDateTime, formatServiceDate } from '../../utils/music.format';

type PlanListProps = {
  plans: ServiceMusicPlan[];
};

export function PlanList({ plans }: PlanListProps) {
  if (plans.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-slate-500">
        No choir plans yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <Link
          key={plan.id}
          href={`/music/plans/${plan.id}`}
          className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-ebc-burgundy/40 hover:shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <ScheduleBadge
                serviceDate={plan.serviceDate}
                choirGroup={plan.choirGroup}
                sundayOfMonth={plan.sundayOfMonth}
                scheduleOverride={plan.scheduleOverride}
                scheduleNote={plan.scheduleNote}
                compact
              />
              <h3 className="mt-2 font-display text-lg text-ebc-burgundy">{plan.title}</h3>
              <p className="mt-1 text-sm text-slate-600">
                Service — {formatServiceDate(plan.serviceDate)}
              </p>
              {formatPracticeDateTime(plan) && (
                <p className="text-sm text-slate-500">
                  Practice — {formatPracticeDateTime(plan)}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                plan.status === 'sent'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {plan.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {plan.songs.length} songs · {plan.directorName}
          </p>
        </Link>
      ))}
    </div>
  );
}
