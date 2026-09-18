import Link from 'next/link';

import type { MusicAccess } from '@/modules/auth/types/permissions.types';
import { resolveScopedChoirIds } from '@/modules/auth/utils/choir-scope.utils';

import type { BandMusician, ChoirScheduleOverride, ServiceMusicPlan } from '../types';
import type { Choir } from '../types/choir.types';
import { formatServiceDate } from '../utils/music.format';
import type { RepertoireSnapshot } from '../utils/repertoire.utils';
import { BandRosterSummary } from './BandRosterPanel';
import { ScheduleBadge } from './ChoirSchedulePanel';
import {
  filterPlansForDirectorScope,
  ledChoirIdsForPerson,
  MyChoirsPanel,
} from './my-choirs';
import { RepertoireCoach } from './repertoire-coach';

type MusicHubProps = {
  plans: ServiceMusicPlan[];
  scheduleOverrides: ChoirScheduleOverride[];
  bandRoster: BandMusician[];
  repertoire: RepertoireSnapshot;
  access: MusicAccess;
  choirs?: Choir[];
  personId?: string | null;
  /** Explicit User.choirIds from session (preferred over roster fallback). */
  assignedChoirIds?: readonly string[];
};

function planHref(plan: ServiceMusicPlan, canEdit: boolean): string {
  return canEdit ? `/music/plans/${plan.id}` : `/music/plans/${plan.id}/rehearse`;
}

function ThisSundayCard({
  plan,
  scheduleOverrides,
  canEdit,
}: {
  plan: ServiceMusicPlan;
  scheduleOverrides: ChoirScheduleOverride[];
  canEdit: boolean;
}) {
  const href = planHref(plan, canEdit);

  return (
    <section className="rounded-2xl border-2 border-ebc-burgundy/25 bg-white p-4 shadow-sm sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-ebc-gold-bright">
        This Sunday
      </p>
      <h2 className="mt-2 text-xl font-bold text-ebc-burgundy sm:text-2xl">
        {plan.title}
      </h2>
      <div className="mt-2">
        <ScheduleBadge
          serviceDate={plan.serviceDate}
          choirGroup={plan.choirGroup}
          sundayOfMonth={plan.sundayOfMonth}
          scheduleOverride={plan.scheduleOverride}
          scheduleNote={plan.scheduleNote}
          overrides={scheduleOverrides}
          compact
        />
      </div>
      <p className="mt-3 text-base text-slate-600">
        {canEdit
          ? 'Open the plan to edit songs, see who’s coming, or share with the choir.'
          : 'Practice the songs and tell us if you can make it.'}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link href={href} className="ebc-action-primary">
          {canEdit ? 'Open plan' : 'Practice songs'}
        </Link>
        {!canEdit ? (
          <Link href={`${href}#attendance`} className="ebc-action-secondary">
            Can you make it?
          </Link>
        ) : (
          <Link href="/music/plans" className="ebc-action-secondary">
            All choir plans
          </Link>
        )}
      </div>
    </section>
  );
}

function MoreMusicLinks({ access }: { access: MusicAccess }) {
  const links: { href: string; label: string }[] = [];

  if (access.canEditPlans) {
    links.push({ href: '/music/plans/new', label: 'New choir plan' });
    links.push({ href: '/music/plans', label: 'All choir plans' });
  }
  if (access.canViewPlans) {
    links.push({ href: '/music/songs', label: 'Songs' });
  }
  if (access.canManageSongs) {
    links.push({ href: '/music/song-requests', label: 'Song requests' });
  }
  if (access.canViewBand) {
    links.push({ href: '/music/band', label: 'Band' });
  }
  if (access.canManageRotation) {
    links.push({ href: '/music/choirs', label: 'Choir setup' });
  } else if (access.canViewPlans) {
    links.push({ href: '/music/choirs', label: 'My choirs' });
  }
  if (access.canManagePeople) {
    links.push({ href: '/music/people', label: 'Music people' });
  }
  if (access.canManageIntake) {
    links.push({ href: '/music/musician-intake', label: 'New musicians' });
  }
  if (access.canEditPlans) {
    links.push({ href: '/music/director-settings', label: 'Director settings' });
  }

  if (links.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-slate-800">More in Music</h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="ebc-action-quiet">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MusicHub({
  plans,
  scheduleOverrides,
  bandRoster,
  repertoire,
  access,
  choirs = [],
  personId = null,
  assignedChoirIds = [],
}: MusicHubProps) {
  const upcoming = plans.filter((p) => p.status === 'sent').slice(0, 3);
  const drafts = access.canEditPlans
    ? filterPlansForDirectorScope(
        plans.filter((p) => p.status === 'draft'),
        {
          seeAll: access.canManageRotation,
          ledChoirIds: resolveScopedChoirIds(
            assignedChoirIds,
            ledChoirIdsForPerson(choirs, personId),
          ),
        },
      )
    : [];
  const thisSunday = upcoming[0] ?? null;
  const isChoirDirectorDesk = access.canEditPlans;
  const isChoirViewer = access.canViewPlans && !access.canEditPlans;
  const isBandOnly = access.canViewBand && !access.canViewPlans;

  if (isBandOnly) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <section className="rounded-2xl border-2 border-ebc-burgundy/25 bg-white p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-ebc-gold-bright">
            Band
          </p>
          <h2 className="mt-2 text-xl font-bold text-ebc-burgundy sm:text-2xl">
            Who’s playing this month
          </h2>
          <p className="mt-2 text-base text-slate-600">
            See the Sunday rotation. Tap below for the full roster.
          </p>
          <div className="mt-5">
            <Link href="/music/band" className="ebc-action-primary">
              Open band roster
            </Link>
          </div>
        </section>
        <BandRosterSummary roster={bandRoster} />
        <MoreMusicLinks access={access} />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {thisSunday ? (
        <ThisSundayCard
          plan={thisSunday}
          scheduleOverrides={scheduleOverrides}
          canEdit={isChoirDirectorDesk}
        />
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 sm:p-6">
          <h2 className="text-xl font-bold text-ebc-burgundy">This Sunday</h2>
          <p className="mt-2 text-base text-slate-600">
            {isChoirDirectorDesk
              ? 'No shared choir plan yet. Create one when you’re ready.'
              : 'No Sunday plan has been shared yet. Check back, or ask your choir director.'}
          </p>
          {isChoirDirectorDesk ? (
            <div className="mt-5">
              <Link href="/music/plans/new" className="ebc-action-primary">
                New choir plan
              </Link>
            </div>
          ) : null}
        </section>
      )}

      {isChoirViewer ? (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold text-ebc-burgundy">My choirs</h2>
            <Link
              href="/music/choirs"
              className="text-base font-semibold text-ebc-burgundy hover:underline"
            >
              View schedule
            </Link>
          </div>
          <MyChoirsPanel
            choirs={choirs}
            plans={plans}
            personId={personId}
            compact
          />
        </section>
      ) : null}

      {isChoirDirectorDesk && drafts.length > 0 ? (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold text-ebc-burgundy">
              Finish these drafts
            </h2>
            <Link
              href="/music/plans/new"
              className="text-base font-semibold text-ebc-burgundy hover:underline"
            >
              New choir plan
            </Link>
          </div>
          <div className="space-y-2">
            {drafts.map((plan) => (
              <Link
                key={plan.id}
                href={`/music/plans/${plan.id}`}
                className="block rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 hover:border-amber-300"
              >
                <p className="text-base font-semibold text-amber-900">{plan.title}</p>
                <p className="mt-1 text-base text-amber-800/80">
                  Still drafting · {formatServiceDate(plan.serviceDate)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {access.canViewPlans && upcoming.length > 1 ? (
        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold text-ebc-burgundy">Coming up</h2>
            {access.canEditPlans ? (
              <Link
                href="/music/plans"
                className="text-base font-semibold text-ebc-burgundy hover:underline"
              >
                View all
              </Link>
            ) : null}
          </div>
          <div className="space-y-3">
            {upcoming.slice(1).map((plan) => (
              <Link
                key={plan.id}
                href={planHref(plan, isChoirDirectorDesk)}
                className="block rounded-xl border border-slate-200 bg-white px-4 py-4 hover:border-ebc-burgundy/30"
              >
                <p className="text-base font-semibold text-slate-900">{plan.title}</p>
                <ScheduleBadge
                  serviceDate={plan.serviceDate}
                  choirGroup={plan.choirGroup}
                  sundayOfMonth={plan.sundayOfMonth}
                  scheduleOverride={plan.scheduleOverride}
                  scheduleNote={plan.scheduleNote}
                  overrides={scheduleOverrides}
                  compact
                />
                <p className="mt-2 text-sm font-semibold text-ebc-burgundy">
                  {isChoirViewer ? 'Practice songs →' : 'Open plan →'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {access.canViewBand ? (
        <section className="border-t border-slate-100 pt-6 sm:pt-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-lg font-bold text-ebc-burgundy">Band</h2>
            <Link
              href="/music/band"
              className="text-base font-semibold text-ebc-burgundy hover:underline"
            >
              Full roster
            </Link>
          </div>
          <BandRosterSummary roster={bandRoster} />
        </section>
      ) : null}

      {isChoirDirectorDesk ? (
        <section className="border-t border-slate-100 pt-6 sm:pt-8">
          <RepertoireCoach snapshot={repertoire} canRefresh={access.canEditPlans} />
        </section>
      ) : null}

      <MoreMusicLinks access={access} />
    </div>
  );
}
