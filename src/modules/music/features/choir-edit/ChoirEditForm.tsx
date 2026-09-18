'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { personDisplayName, type Person } from '@/modules/members/types/person.types';
import {
  deleteChoirAction,
  saveChoirAction,
} from '@/modules/music/actions/choir.actions';
import type { Choir } from '@/modules/music/types/choir.types';
import { isCombinedChoir } from '@/modules/music/types/choir.types';
import {
  CHOIR_MEMBER_ROLE_LABELS,
  CHOIR_MEMBER_ROLES,
  type ChoirLeader,
  type ChoirMember,
  type ChoirMemberRole,
} from '@/modules/music/types';
import { membersByRole } from '@/modules/music/utils/person-refs.utils';

export type ChoirEditFormProps = {
  choir?: Choir;
  people: Person[];
};

export function ChoirEditForm({ choir, people }: ChoirEditFormProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const isNew = !choir;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(choir?.name ?? '');
  const [leaders, setLeaders] = useState<ChoirLeader[]>(
    choir?.leaders.length ? choir.leaders : [{ personId: '' }],
  );
  const [members, setMembers] = useState<ChoirMember[]>(
    choir?.members.length ? choir.members : [],
  );
  const [active, setActive] = useState(choir?.active ?? true);
  const [notes, setNotes] = useState(choir?.notes ?? '');

  const peopleOptions = useMemo(
    () =>
      [...people].sort((a, b) =>
        personDisplayName(a).localeCompare(personDisplayName(b)),
      ),
    [people],
  );

  const memberIds = useMemo(
    () => new Set(members.map((member) => member.personId).filter(Boolean)),
    [members],
  );

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveChoirAction({
        id: choir?.id,
        name,
        leaders: leaders.filter((leader) => leader.personId.trim()),
        members: members.filter((member) => member.personId.trim()),
        active,
        notes: notes || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push('/music/choirs');
      router.refresh();
    });
  }

  async function handleDelete(): Promise<void> {
    if (!choir) return;
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
      toast({ title: 'Choir deleted', tone: 'success' });
      router.push('/music/choirs');
      router.refresh();
    });
  }

  function addMemberFromSelect(personId: string, role: ChoirMemberRole) {
    if (!personId || memberIds.has(personId)) return;
    setMembers([...members, { personId, role }]);
  }

  function setMemberRole(personId: string, role: ChoirMemberRole) {
    setMembers(
      members.map((member) =>
        member.personId === personId ? { ...member, role } : member,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/music/choirs" className="text-sm text-ebc-burgundy hover:underline">
            ← Choir setup
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-ebc-burgundy">
            {isNew ? 'New choir' : `Edit ${choir.name}`}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Leaders, roster members, and choir details.
          </p>
        </div>
        {!isNew ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              void handleDelete();
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete choir
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {choir && isCombinedChoir(choir.id) ? (
        <p className="rounded-lg border border-ebc-burgundy/20 bg-ebc-burgundy/5 px-3 py-2 text-sm text-slate-700">
          Use Combined Choir for joint engagements. Add the singers taking part, then on the
          choir plan, set the occasion (e.g. “Youth + Senior”) so everyone knows who is
          singing. Combined is not assigned a monthly Sunday.
        </p>
      ) : null}

      <section className="ebc-card space-y-4">
        <label className="block max-w-md">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={isPending}
          />
        </label>

        <div>
          <p className="text-sm font-medium text-slate-700">Leaders</p>
          <p className="mt-0.5 text-xs text-slate-500">
            From the church directory. Optional title (e.g. Deaconess).
          </p>
          <ul className="mt-2 space-y-2">
            {leaders.map((leader, index) => (
              <li key={index} className="flex flex-wrap gap-2">
                <select
                  value={leader.personId}
                  onChange={(event) => {
                    const next = [...leaders];
                    next[index] = { ...leader, personId: event.target.value };
                    setLeaders(next);
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  disabled={isPending}
                >
                  <option value="">Select person…</option>
                  {peopleOptions.map((person) => (
                    <option key={person.id} value={person.id}>
                      {personDisplayName(person)}
                    </option>
                  ))}
                </select>
                <input
                  value={leader.title ?? ''}
                  onChange={(event) => {
                    const next = [...leaders];
                    next[index] = {
                      ...leader,
                      title: event.target.value || undefined,
                    };
                    setLeaders(next);
                  }}
                  placeholder="Title (optional)"
                  className="w-36 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() =>
                    setLeaders(
                      leaders.length > 1
                        ? leaders.filter((_, i) => i !== index)
                        : [{ personId: '' }],
                    )
                  }
                  className="text-xs text-slate-600 hover:text-red-700"
                  disabled={isPending}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setLeaders([...leaders, { personId: '' }])}
            className="mt-2 text-xs font-medium text-ebc-burgundy hover:underline"
            disabled={isPending}
          >
            + Add leader
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700">Roster</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Divide participants into singers, soloists, and band members.
            </p>
          </div>

          {CHOIR_MEMBER_ROLES.map((role) => {
            const group = membersByRole(members, role);
            return (
              <div key={role} className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ebc-burgundy">
                    {CHOIR_MEMBER_ROLE_LABELS[role]}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {group.length}
                  </span>
                </div>

                {group.length === 0 ? (
                  <p className="text-sm text-slate-500">None yet.</p>
                ) : (
                  <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-white">
                    {group.map((member) => {
                      const person = peopleOptions.find(
                        (row) => row.id === member.personId,
                      );
                      return (
                        <li
                          key={member.personId}
                          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-900">
                            {person ? personDisplayName(person) : member.personId}
                          </span>
                          <div className="flex items-center gap-2">
                            <select
                              value={member.role}
                              onChange={(event) =>
                                setMemberRole(
                                  member.personId,
                                  event.target.value as ChoirMemberRole,
                                )
                              }
                              className="rounded border border-slate-300 px-2 py-1 text-xs"
                              disabled={isPending}
                              aria-label="Change role"
                            >
                              {CHOIR_MEMBER_ROLES.map((option) => (
                                <option key={option} value={option}>
                                  {CHOIR_MEMBER_ROLE_LABELS[option]}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() =>
                                setMembers(
                                  members.filter(
                                    (row) => row.personId !== member.personId,
                                  ),
                                )
                              }
                              className="text-xs font-medium text-red-700 hover:underline"
                              disabled={isPending}
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <label className="block max-w-md">
                  <span className="sr-only">
                    Add {CHOIR_MEMBER_ROLE_LABELS[role]}
                  </span>
                  <select
                    value=""
                    onChange={(event) => {
                      addMemberFromSelect(event.target.value, role);
                      event.target.value = '';
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    disabled={isPending}
                  >
                    <option value="">
                      + Add {CHOIR_MEMBER_ROLE_LABELS[role].toLowerCase()}…
                    </option>
                    {peopleOptions
                      .filter((person) => !memberIds.has(person.id))
                      .map((person) => (
                        <option key={person.id} value={person.id}>
                          {personDisplayName(person)}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            );
          })}
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            disabled={isPending}
          />
          Active (available on new plans)
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 min-h-[72px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={isPending}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending || !name.trim()}
            onClick={handleSave}
            className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? 'Saving…' : isNew ? 'Create choir' : 'Save changes'}
          </button>
          <Link
            href="/music/choirs"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </section>
    </div>
  );
}
