import Link from 'next/link';

import type { OperationalSnapshot } from '@/modules/dashboard/types/dashboard.types';
import { getChoirName } from '@/modules/music/utils/choir.utils';
import { formatEventDate } from '@/modules/ministries/utils/ministry.utils';

type ThisWeekPanelProps = {
  snapshot: OperationalSnapshot;
};

export function ThisWeekPanel({ snapshot }: ThisWeekPanelProps) {
  return (
    <section className="ebc-card">
      <p className="ebc-section-label">This week</p>
      <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Ministry calendar</h2>

      {snapshot.upcomingEvents.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No ministry events in the next 14 days. Add dates on a ministry&apos;s Calendar tab.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {snapshot.upcomingEvents.map((event) => (
            <li key={event.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold text-slate-900">{event.title}</p>
                <p className="text-sm text-ebc-burgundy">{formatEventDate(event.startAt)}</p>
                {event.location ? (
                  <p className="text-sm text-slate-600">{event.location}</p>
                ) : null}
              </div>
              <Link
                href={`/ministries/${event.ministrySlug}?tab=calendar`}
                className="shrink-0 text-xs font-medium text-ebc-navy hover:underline"
              >
                {event.ministryName}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {snapshot.draftPlans.length > 0 ? (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-900">Music drafts</p>
          <ul className="mt-2 space-y-2">
            {snapshot.draftPlans.map((plan) => (
              <li key={plan.id}>
                <Link href={`/music/plans/${plan.id}`} className="text-sm text-ebc-burgundy hover:underline">
                  {plan.title} · {getChoirName(plan.choirGroup)} · {plan.serviceDate}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

export function QuickActions() {
  const actions = [
    {
      label: 'Log visitor',
      description: 'Record a first-time guest for follow-up',
      href: '/visitors',
      accent: 'bg-ebc-green/10 border-ebc-green/30 hover:border-ebc-green',
    },
    {
      label: 'New choir plan',
      description: 'Build a choir set list for any church event',
      href: '/music/plans/new',
      accent: 'bg-ebc-burgundy/5 border-ebc-burgundy/30 hover:border-ebc-burgundy',
    },
    {
      label: 'Ministry roster',
      description: 'Update personnel, calendar, and SOPs',
      href: '/ministries',
      accent: 'bg-ebc-navy/5 border-ebc-navy/30 hover:border-ebc-navy',
    },
    {
      label: 'Send choir plan',
      description: 'Review drafts and mark plans sent',
      href: '/music/plans',
      accent: 'bg-ebc-gold/10 border-ebc-gold/50 hover:border-ebc-gold',
    },
  ] as const;

  return (
    <section className="ebc-card">
      <p className="ebc-section-label">Quick actions</p>
      <h2 className="mt-1 text-lg font-bold text-ebc-burgundy">Start here</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`min-h-11 rounded-xl border-2 p-4 transition-colors ${action.accent}`}
          >
            <p className="text-base font-semibold text-slate-900">{action.label}</p>
            <p className="mt-1 text-base text-slate-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
