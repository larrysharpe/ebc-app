'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import type { Person } from '@/modules/members/types/person.types';
import {
  deleteChoirAction,
  saveChoirSundayAssignmentsAction,
} from '@/modules/music/actions/choir.actions';
import {
  deleteScheduleOverrideAction,
  saveScheduleOverrideAction,
} from '@/modules/music/actions/choir-rotation.actions';
import type { Choir } from '@/modules/music/types/choir.types';
import { isCombinedChoir } from '@/modules/music/types/choir.types';
import type {
  ChoirGroup,
  ChoirScheduleOverride,
  ServiceMusicPlan,
  SundayOfMonth,
} from '@/modules/music/types';
import {
  buildScheduleRowsFromChoirs,
  getChoirName,
  getActiveChoirs,
  getRotationChoirs,
} from '@/modules/music/utils/choir.utils';
import { formatSundayLabel } from '@/modules/music/utils/choir-schedule.utils';
import { formatServiceDate } from '@/modules/music/utils/music.format';
import {
  formatLeadersList,
  peopleByIdMap,
} from '@/modules/music/utils/person-refs.utils';

import { ChoirSchedulePanel } from '../ChoirSchedulePanel';
import { MyChoirsPanel } from '../my-choirs';

const SUNDAYS: SundayOfMonth[] = [1, 2, 3, 4, 5];

export type ChoirSetupProps = {
  choirs: Choir[];
  people: Person[];
  overrides: ChoirScheduleOverride[];
  plans: ServiceMusicPlan[];
  canManage: boolean;
  /** Person id for the signed-in user (member/director read view). */
  personId?: string | null;
};

export function ChoirSetup({
  choirs: initialChoirs,
  people,
  overrides,
  plans,
  canManage,
  personId = null,
}: ChoirSetupProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const [sundayMap, setSundayMap] = useState<Record<SundayOfMonth, string>>(() =>
    buildSundayMap(initialChoirs),
  );

  const [swapDate, setSwapDate] = useState('');
  const [swapChoir, setSwapChoir] = useState(initialChoirs[0]?.id ?? '');
  const [swapNote, setSwapNote] = useState('');

  const activeChoirs = useMemo(() => getActiveChoirs(initialChoirs), [initialChoirs]);
  const rotationChoirs = useMemo(
    () => getRotationChoirs(initialChoirs),
    [initialChoirs],
  );
  const peopleMap = useMemo(() => peopleByIdMap(people), [people]);

  if (!canManage) {
    return (
      <div className="space-y-8">
        <MyChoirsPanel
          choirs={initialChoirs}
          plans={plans}
          personId={personId}
        />
        <div className="border-t border-slate-100 pt-8">
          <ChoirSchedulePanel
            overrides={overrides}
            plans={plans}
            choirs={initialChoirs}
            people={people}
          />
        </div>
      </div>
    );
  }

  async function handleDelete(choir: Choir): Promise<void> {
    const confirmed = await confirm({
      title: `Delete ${choir.name}?`,
      description: 'This cannot be undone.',
      confirmLabel: 'Delete choir',
      tone: 'danger',
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteChoirAction({ id: choir.id });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not delete choir', description: result.error, tone: 'error' });
        return;
      }
      setOkMessage('Choir deleted.');
      toast({ title: 'Choir deleted', tone: 'success' });
      router.refresh();
    });
  }

  function handleSaveSundays() {
    setError(null);
    setOkMessage(null);
    const assignments = initialChoirs.map((choir) => {
      const sunday = SUNDAYS.find((s) => sundayMap[s] === choir.id) ?? null;
      return { choirId: choir.id, defaultSunday: sunday };
    });
    startTransition(async () => {
      const result = await saveChoirSundayAssignmentsAction({ assignments });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOkMessage('Sunday rotation saved.');
      router.refresh();
    });
  }

  function handleAddSwap() {
    setError(null);
    startTransition(async () => {
      const result = await saveScheduleOverrideAction({
        serviceDate: swapDate,
        choirGroup: swapChoir as ChoirGroup,
        note: swapNote || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSwapDate('');
      setSwapNote('');
      setOkMessage('Schedule swap added.');
      router.refresh();
    });
  }

  function handleDeleteSwap(id: string) {
    startTransition(async () => {
      const result = await deleteScheduleOverrideAction({ id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const previewRows = buildScheduleRowsFromChoirs(
    initialChoirs.map((choir) => {
      const sunday = SUNDAYS.find((s) => sundayMap[s] === choir.id) ?? null;
      return { ...choir, defaultSunday: sunday };
    }),
  );

  const upcomingOverrides = [...overrides]
    .filter((o) => o.serviceDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {okMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {okMessage}
        </p>
      ) : null}

      <section className="ebc-card space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ebc-burgundy">Choirs</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create and manage chapel choirs. Plans and the Sunday rotation use these.
            </p>
          </div>
          <Link
            href="/music/choirs/new"
            className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy/90"
          >
            Add choir
          </Link>
        </div>

        {initialChoirs.length === 0 ? (
          <p className="text-sm text-slate-500">No choirs yet. Add one to get started.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {initialChoirs.map((choir) => (
              <li
                key={choir.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {choir.name}
                    {isCombinedChoir(choir.id) ? (
                      <span className="ml-2 text-xs font-medium text-ebc-burgundy">
                        (combined engagements)
                      </span>
                    ) : null}
                    {!choir.active ? (
                      <span className="ml-2 text-xs font-medium text-slate-500">
                        (inactive)
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {formatLeadersList(choir.leaders, peopleMap) || 'No leaders listed'}
                    {isCombinedChoir(choir.id)
                      ? ' · Not in Sunday rotation'
                      : choir.defaultSunday
                        ? ` · ${formatSundayLabel(choir.defaultSunday)}`
                        : ' · No Sunday assigned'}
                    {` · ${formatRosterCounts(choir.members)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/music/choirs/${choir.id}`}
                    className="text-xs font-medium text-ebc-burgundy hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      void handleDelete(choir);
                    }}
                    className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="ebc-card space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ebc-burgundy">Sunday rotation</h2>
          <p className="mt-1 text-sm text-slate-600">
            Which choir sings which Sunday of the month by default.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {SUNDAYS.map((sunday) => (
            <label key={sunday} className="block rounded-lg border border-slate-200 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-ebc-gold">
                {formatSundayLabel(sunday)}
              </span>
              <select
                value={sundayMap[sunday] ?? ''}
                onChange={(event) =>
                  setSundayMap((prev) => ({ ...prev, [sunday]: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="">Unassigned</option>
                {rotationChoirs.map((choir) => (
                  <option key={choir.id} value={choir.id}>
                    {choir.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={handleSaveSundays}
          className="rounded-lg border border-ebc-burgundy/40 px-4 py-2 text-sm font-medium text-ebc-burgundy hover:bg-ebc-burgundy/5 disabled:opacity-50"
        >
          Save Sunday rotation
        </button>
        <ul className="grid gap-2 sm:grid-cols-5 text-xs text-slate-600">
          {previewRows.map((row) => (
            <li key={row.sunday}>
              <span className="font-semibold text-slate-800">
                {formatSundayLabel(row.sunday)}
              </span>
              <br />
              {row.choirGroup
                ? getChoirName(row.choirGroup, initialChoirs)
                : 'Unassigned'}
            </li>
          ))}
        </ul>
      </section>

      <section className="ebc-card space-y-4">
        <div>
          <h2 className="text-lg font-bold text-ebc-burgundy">Schedule swaps</h2>
          <p className="mt-1 text-sm text-slate-600">
            One-off changes for a specific Sunday date.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Sunday date</span>
            <input
              type="date"
              value={swapDate}
              onChange={(event) => setSwapDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Choir singing</span>
            <select
              value={swapChoir}
              onChange={(event) => setSwapChoir(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {activeChoirs.map((choir) => (
                <option key={choir.id} value={choir.id}>
                  {choir.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-3">
            <span className="text-sm font-medium text-slate-700">Note</span>
            <input
              value={swapNote}
              onChange={(event) => setSwapNote(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={isPending || !swapDate || !swapChoir}
          onClick={handleAddSwap}
          className="rounded-lg border border-ebc-burgundy/40 px-4 py-2 text-sm font-medium text-ebc-burgundy disabled:opacity-50"
        >
          Add schedule swap
        </button>
        {upcomingOverrides.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming swaps.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingOverrides.map((override) => (
              <li
                key={override.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-amber-950">
                    {formatServiceDate(override.serviceDate)} ·{' '}
                    {formatSundayLabel(override.sundayOfMonth)}
                  </p>
                  <p className="mt-1 text-amber-900">
                    {getChoirName(override.choirGroup, initialChoirs)}
                  </p>
                  {override.note ? (
                    <p className="mt-1 text-amber-800/90">{override.note}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDeleteSwap(override.id)}
                  className="text-xs font-medium text-red-700 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function buildSundayMap(choirs: Choir[]): Record<SundayOfMonth, string> {
  const map = { 1: '', 2: '', 3: '', 4: '', 5: '' } as Record<SundayOfMonth, string>;
  for (const choir of choirs) {
    if (choir.defaultSunday) {
      map[choir.defaultSunday] = choir.id;
    }
  }
  return map;
}

function formatRosterCounts(members: Choir['members']): string {
  if (members.length === 0) return '0 on roster';
  const singers = members.filter((member) => member.role === 'singer').length;
  const soloists = members.filter((member) => member.role === 'soloist').length;
  const band = members.filter((member) => member.role === 'band').length;
  const parts = [
    singers ? `${singers} singer${singers === 1 ? '' : 's'}` : null,
    soloists ? `${soloists} soloist${soloists === 1 ? '' : 's'}` : null,
    band ? `${band} band` : null,
  ].filter(Boolean);
  return parts.join(' · ') || `${members.length} on roster`;
}
