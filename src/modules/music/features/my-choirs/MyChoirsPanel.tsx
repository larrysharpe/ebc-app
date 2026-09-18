import Link from 'next/link';

import type { ServiceMusicPlan } from '../../types';
import type { Choir } from '../../types/choir.types';
import { formatSundayLabel } from '../../utils/choir-schedule.utils';
import { formatServiceDate } from '../../utils/music.format';
import {
  choirsForPerson,
  formatChoirParticipation,
  type PersonChoirMembership,
} from './my-choirs.utils';

export type MyChoirsPanelProps = {
  choirs: Choir[];
  plans: ServiceMusicPlan[];
  personId?: string | null;
  /** Compact cards for the music home hub. */
  compact?: boolean;
};

function MembershipCard({
  membership,
  compact,
}: {
  membership: PersonChoirMembership;
  compact?: boolean;
}) {
  const { choir, participation, nextServiceDate, nextPlanId } = membership;
  const href = nextPlanId
    ? `/music/plans/${nextPlanId}/rehearse`
    : '/music/choirs';

  return (
    <Link
      href={href}
      className={
        compact
          ? 'block rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-ebc-burgundy/40'
          : 'block rounded-xl border border-slate-200 bg-white px-5 py-5 hover:border-ebc-burgundy/40'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={
              compact
                ? 'text-base font-semibold text-ebc-burgundy'
                : 'font-display text-lg text-ebc-burgundy'
            }
          >
            {choir.name}
          </h3>
          <p className="mt-1 text-base text-slate-600">
            {formatChoirParticipation(participation)}
            {choir.defaultSunday
              ? ` · ${formatSundayLabel(choir.defaultSunday)}`
              : null}
          </p>
        </div>
        {nextServiceDate ? (
          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Next up
            </p>
            <p className="text-base font-medium text-slate-900">
              {formatServiceDate(nextServiceDate)}
            </p>
            {nextPlanId ? (
              <p className="mt-1 text-sm font-semibold text-ebc-burgundy">
                Open Sunday songs →
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-base text-slate-500">No upcoming date yet</p>
        )}
      </div>
    </Link>
  );
}

export function MyChoirsPanel({
  choirs,
  plans,
  personId,
  compact = false,
}: MyChoirsPanelProps) {
  const memberships = personId
    ? choirsForPerson(choirs, personId, plans)
    : [];

  return (
    <section className={compact ? 'space-y-3' : 'space-y-4'}>
      {!compact ? (
        <div>
          <h2 className="font-display text-xl text-ebc-burgundy">My choirs</h2>
          <p className="mt-1 text-base text-slate-600">
            Choirs you sing, play, or lead — tap to open the next Sunday songs.
          </p>
        </div>
      ) : null}

      {!personId ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-base text-slate-500">
          Your account isn&apos;t linked to a person in the directory yet, so we
          can&apos;t show your choir roster. Ask office staff to match your email
          to your people record.
        </p>
      ) : memberships.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-base text-slate-500">
          You&apos;re not on a choir roster yet. Ask your choir director to add
          you.
        </p>
      ) : (
        <div className="space-y-3">
          {memberships.map((membership) => (
            <MembershipCard
              key={membership.choir.id}
              membership={membership}
              compact={compact}
            />
          ))}
        </div>
      )}
    </section>
  );
}
