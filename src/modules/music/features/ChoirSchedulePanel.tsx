import type { Person } from '@/modules/members/types/person.types';

import type { ChoirScheduleOverride, ServiceMusicPlan } from '../types';
import type { Choir } from '../types/choir.types';
import type { ChoirRotationConfig } from '../types/choir-rotation.types';
import { DEFAULT_CHOIR_ROTATION_CONFIG } from '../types/choir-rotation.types';
import {
  buildChoirLabels,
  buildScheduleRowsFromChoirs,
  getChoirName,
} from '../utils/choir.utils';
import { buildScheduleRows } from '../utils/choir-rotation.utils';
import { formatServiceDate } from '../utils/music.format';
import {
  formatSundayLabel,
  getDefaultChoirForSunday,
  getLeadersForChoirGroup,
  resolveChoirForDate,
} from '../utils/choir-schedule.utils';
import { formatLeadersList, peopleByIdMap } from '../utils/person-refs.utils';

type ChoirSchedulePanelProps = {
  overrides: ChoirScheduleOverride[];
  plans: ServiceMusicPlan[];
  choirs?: Choir[];
  people?: Person[];
  /** @deprecated Prefer `choirs`. */
  config?: ChoirRotationConfig;
};

export function ChoirSchedulePanel({
  overrides,
  plans,
  choirs,
  people = [],
  config = DEFAULT_CHOIR_ROTATION_CONFIG,
}: ChoirSchedulePanelProps) {
  const peopleMap = peopleByIdMap(people);
  const upcomingOverrides = [...overrides]
    .filter((o) => o.serviceDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));
  const scheduleRows = choirs
    ? buildScheduleRowsFromChoirs(choirs)
    : buildScheduleRows(config);
  const labels = choirs ? buildChoirLabels(choirs) : undefined;

  function labelFor(id: string): string {
    if (labels) return labels[id] ?? id;
    return getChoirName(id, choirs ?? []);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-lg text-ebc-burgundy">Chapel choir rotation</h2>
        <p className="mt-1 text-sm text-slate-600">
          Default schedule by Sunday of the month — directors can swap when needed (e.g. Men&apos;s
          Choir moved to 3rd Sunday in June so they were off Father&apos;s Day weekend).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-px lg:bg-slate-100">
        {scheduleRows.map(({ sunday, choirGroup, leaders }) => (
          <div
            key={sunday}
            className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-left lg:rounded-none lg:border-0 lg:text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ebc-gold">
              {formatSundayLabel(sunday)}
            </p>
            <p className="mt-2 text-sm font-semibold text-ebc-burgundy">
              {choirGroup ? labelFor(choirGroup) : 'Unassigned'}
            </p>
            <p className="mt-2 text-xs leading-snug text-slate-600">
              {formatLeadersList(leaders, peopleMap)}
            </p>
          </div>
        ))}
      </div>

      {upcomingOverrides.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Schedule swaps</h3>
          <ul className="mt-3 space-y-3">
            {upcomingOverrides.map((override) => {
              const defaultChoir = choirs
                ? choirs.find((c) => c.defaultSunday === override.sundayOfMonth)?.id
                : getDefaultChoirForSunday(override.sundayOfMonth, config);
              return (
                <li
                  key={override.id}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
                >
                  <p className="font-medium text-amber-950">
                    {formatServiceDate(override.serviceDate)} ·{' '}
                    {formatSundayLabel(override.sundayOfMonth)}
                  </p>
                  <p className="mt-1 text-amber-900">
                    <span className="font-semibold">{labelFor(override.choirGroup)}</span>
                    {defaultChoir && defaultChoir !== override.choirGroup ? (
                      <>
                        {' '}
                        <span className="text-amber-800">
                          (normally {labelFor(defaultChoir)})
                        </span>
                      </>
                    ) : null}
                  </p>
                  {override.note ? (
                    <p className="mt-1 text-amber-800/90">{override.note}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        Each choir plan records which choir sang and whether the date was a schedule swap.
      </div>
    </section>
  );
}

type ScheduleBadgeProps = {
  serviceDate: string;
  choirGroup: ServiceMusicPlan['choirGroup'];
  sundayOfMonth?: ServiceMusicPlan['sundayOfMonth'];
  scheduleOverride?: boolean;
  scheduleNote?: string;
  overrides?: ChoirScheduleOverride[];
  choirs?: Choir[];
  people?: Person[];
  compact?: boolean;
};

export function ScheduleBadge({
  serviceDate,
  choirGroup,
  sundayOfMonth,
  scheduleOverride,
  scheduleNote,
  overrides = [],
  choirs = [],
  people = [],
  compact,
}: ScheduleBadgeProps) {
  const peopleMap = peopleByIdMap(people);
  const resolved = resolveChoirForDate(serviceDate, overrides, [
    {
      id: '_',
      title: '',
      choirGroup,
      serviceDate,
      sundayOfMonth,
      scheduleOverride,
      scheduleNote,
      status: 'sent',
      directorName: '',
      songs: [],
    },
  ]);

  const sunday = resolved.sundayOfMonth;
  const isSwap = resolved.isOverride;
  const name = getChoirName(choirGroup, choirs);
  const leadersList =
    choirs.find((c) => c.id === choirGroup)?.leaders ??
    getLeadersForChoirGroup(choirGroup);

  if (compact) {
    return (
      <span className="text-sm text-slate-600">
        {name}
        {sunday && ` · ${formatSundayLabel(sunday)}`}
        {isSwap && (
          <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
            Swapped
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <p className="font-medium text-slate-900">
        {name}
        {sunday && (
          <span className="font-normal text-slate-600"> · {formatSundayLabel(sunday)}</span>
        )}
        {isSwap && (
          <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            Schedule swap
          </span>
        )}
      </p>
      <p className="mt-1 text-slate-600">
        Leader{leadersList.length > 1 ? 's' : ''}:{' '}
        {formatLeadersList(leadersList, peopleMap)}
      </p>
      {resolved.scheduleNote ? (
        <p className="mt-1 text-slate-600">{resolved.scheduleNote}</p>
      ) : null}
    </div>
  );
}
