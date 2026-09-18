'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import { searchPeopleAction } from '@/modules/members/actions/person.actions';
import type { DirectoryPerson, Person } from '@/modules/members/types';
import { personDisplayName } from '@/modules/members/types';
import {
  addChoirRosterMemberAction,
  assignMusicRoleAction,
  removeChoirRosterMemberAction,
  removeMusicRoleAction,
} from '@/modules/music/actions/music-people.actions';
import type { MusicManageableRole } from '@/modules/music/schemas/music-people.schemas';
import type { Choir } from '@/modules/music/types/choir.types';
import { isCombinedChoir } from '@/modules/music/types/choir.types';
import {
  CHOIR_MEMBER_ROLE_LABELS,
  CHOIR_MEMBER_ROLES,
  type ChoirMemberRole,
} from '@/modules/music/types';
import { formatSundayLabel } from '@/modules/music/utils/choir-schedule.utils';

import {
  groupPeopleByMusicRole,
  musicMinisters,
} from './music-people.utils';

export type MusicPeopleManagementProps = {
  choirs: Choir[];
  peopleById: Record<string, Person>;
  externalMusicians: Person[];
  rolePeople: DirectoryPerson[];
};

type WorkspaceTab = 'choirs' | 'external' | 'access';

export function MusicPeopleManagement({
  choirs,
  peopleById,
  externalMusicians,
  rolePeople,
}: MusicPeopleManagementProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [tab, setTab] = useState<WorkspaceTab>('choirs');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const chapelChoirs = useMemo(
    () => choirs.filter((choir) => !isCombinedChoir(choir.id)),
    [choirs],
  );
  const combined = useMemo(
    () => choirs.find((choir) => isCombinedChoir(choir.id)),
    [choirs],
  );

  function refreshWithMessage(message: string) {
    setOkMessage(message);
    router.refresh();
  }

  function addToChoir(
    choirId: string,
    personId: string,
    role: ChoirMemberRole,
    successMessage: string,
  ) {
    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await addChoirRosterMemberAction({
        choirId,
        personId,
        role,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refreshWithMessage(successMessage);
    });
  }

  async function removeFromChoir(
    choirId: string,
    person: Person,
    choirName: string,
  ): Promise<void> {
    const confirmed = await confirm({
      title: 'Remove from choir?',
      description: `${personDisplayName(person)} will be removed from ${choirName}.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!confirmed) return;
    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await removeChoirRosterMemberAction({
        choirId,
        personId: person.id,
      });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not remove', description: result.error, tone: 'error' });
        return;
      }
      refreshWithMessage(`Removed ${personDisplayName(person)} from ${choirName}.`);
      toast({
        title: 'Removed from choir',
        description: `${personDisplayName(person)} · ${choirName}`,
        tone: 'success',
      });
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600">
          Tie people from the church directory to each choir. Keep external
          musicians in a call-up pool, then place them on a choir when needed.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            ['choirs', 'Choirs'],
            ['external', 'External musicians'],
            ['access', 'App access'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === id
                ? 'bg-ebc-burgundy text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-ebc-burgundy/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      {tab === 'choirs' ? (
        <div className="space-y-6">
          {chapelChoirs.map((choir) => (
            <ChoirRosterCard
              key={choir.id}
              choir={choir}
              peopleById={peopleById}
              isPending={isPending}
              onAdd={(personId, role) =>
                addToChoir(
                  choir.id,
                  personId,
                  role,
                  `Added to ${choir.name}.`,
                )
              }
              onRemove={(person) => {
                void removeFromChoir(choir.id, person, choir.name);
              }}
            />
          ))}
          {combined ? (
            <ChoirRosterCard
              key={combined.id}
              choir={combined}
              peopleById={peopleById}
              isPending={isPending}
              onAdd={(personId, role) =>
                addToChoir(
                  combined.id,
                  personId,
                  role,
                  'Added to Combined Choir.',
                )
              }
              onRemove={(person) => {
                void removeFromChoir(combined.id, person, combined.name);
              }}
            />
          ) : null}
        </div>
      ) : null}

      {tab === 'external' ? (
        <ExternalMusiciansPanel
          musicians={externalMusicians}
          choirs={choirs}
          isPending={isPending}
          onCallUp={(choirId, personId, role, choirName, personName) =>
            addToChoir(
              choirId,
              personId,
              role,
              `Called up ${personName} to ${choirName}.`,
            )
          }
        />
      ) : null}

      {tab === 'access' ? (
        <AppAccessPanel
          people={rolePeople}
          isPending={isPending}
          onAssign={(personId, role) => {
            setError(null);
            setOkMessage(null);
            startTransition(async () => {
              const result = await assignMusicRoleAction({ personId, role });
              if (!result.ok) {
                setError(result.error);
                return;
              }
              refreshWithMessage(
                `Granted ${ROLE_LABELS[role]} to ${personDisplayName(result.person)}.`,
              );
            });
          }}
          onRemove={(person, role) => {
            void (async () => {
              const confirmed = await confirm({
                title: 'Remove app role?',
                description: `Remove ${ROLE_LABELS[role]} from ${personDisplayName(person)}?`,
                confirmLabel: 'Remove role',
                tone: 'danger',
              });
              if (!confirmed) return;
              setError(null);
              setOkMessage(null);
              startTransition(async () => {
                const result = await removeMusicRoleAction({
                  personId: person.id,
                  role,
                });
                if (!result.ok) {
                  setError(result.error);
                  toast({
                    title: 'Could not remove role',
                    description: result.error,
                    tone: 'error',
                  });
                  return;
                }
                toast({ title: 'Role removed', tone: 'success' });
                refreshWithMessage(
                  `Removed ${ROLE_LABELS[role]} from ${personDisplayName(person)}.`,
                );
              });
            })();
          }}
        />
      ) : null}
    </div>
  );
}

function ChoirRosterCard({
  choir,
  peopleById,
  isPending,
  onAdd,
  onRemove,
}: {
  choir: Choir;
  peopleById: Record<string, Person>;
  isPending: boolean;
  onAdd: (personId: string, role: ChoirMemberRole) => void;
  onRemove: (person: Person) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<ChoirMemberRole>('singer');
  const [results, setResults] = useState<Person[]>([]);

  const rosterIds = useMemo(() => {
    const ids = new Set(choir.members.map((member) => member.personId));
    for (const leader of choir.leaders) ids.add(leader.personId);
    return ids;
  }, [choir]);

  useEffect(() => {
    if (!picking) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void searchPeopleAction(query).then((result) => {
        if (cancelled || !result.ok) return;
        setResults(result.people.filter((person) => !rosterIds.has(person.id)));
      });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [picking, query, rosterIds]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ebc-burgundy">{choir.name}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {choir.defaultSunday
              ? `${formatSundayLabel(choir.defaultSunday)} · `
              : null}
            {choir.members.length} on roster
            {choir.leaders.length
              ? ` · ${choir.leaders.length} leader${choir.leaders.length === 1 ? '' : 's'}`
              : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/music/choirs/${choir.id}`}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-ebc-burgundy/40"
          >
            Full setup
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setPicking((open) => !open);
              setQuery('');
              setResults([]);
            }}
            className="rounded-lg border border-ebc-burgundy/40 px-3 py-1.5 text-sm font-medium text-ebc-burgundy hover:bg-ebc-burgundy/5 disabled:opacity-50"
          >
            {picking ? 'Cancel' : 'Add person'}
          </button>
        </div>
      </div>

      {choir.leaders.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Leaders
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {choir.leaders.map((leader) => {
              const person = peopleById[leader.personId];
              return (
                <li key={leader.personId} className="text-slate-800">
                  {person ? personDisplayName(person) : leader.personId}
                  {leader.title ? (
                    <span className="text-slate-500"> · {leader.title}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {CHOIR_MEMBER_ROLES.map((memberRole) => {
          const rows = choir.members.filter((member) => member.role === memberRole);
          if (rows.length === 0) return null;
          return (
            <div key={memberRole}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {CHOIR_MEMBER_ROLE_LABELS[memberRole]}
              </p>
              <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {rows.map((member) => {
                  const person = peopleById[member.personId];
                  return (
                    <li
                      key={member.personId}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="font-medium text-slate-900">
                          {person ? personDisplayName(person) : member.personId}
                        </span>
                        {person?.membershipStatus === 'hired' ? (
                          <span className="ml-2 text-xs font-medium text-amber-800">
                            External
                          </span>
                        ) : null}
                      </span>
                      {person ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => onRemove(person)}
                          className="text-sm text-slate-600 hover:text-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
        {choir.members.length === 0 ? (
          <p className="text-sm text-slate-500">No roster members yet.</p>
        ) : null}
      </div>

      {picking ? (
        <div className="mt-4 space-y-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Roster role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as ChoirMemberRole)}
              className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {CHOIR_MEMBER_ROLES.map((option) => (
                <option key={option} value={option}>
                  {CHOIR_MEMBER_ROLE_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <DirectorySearch
            query={query}
            onQueryChange={setQuery}
            results={results}
            isPending={isPending}
            emptyHint="Type to search the church directory."
            onPick={(person) => {
              onAdd(person.id, role);
              setPicking(false);
              setQuery('');
              setResults([]);
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

function ExternalMusiciansPanel({
  musicians,
  choirs,
  isPending,
  onCallUp,
}: {
  musicians: Person[];
  choirs: Choir[];
  isPending: boolean;
  onCallUp: (
    choirId: string,
    personId: string,
    role: ChoirMemberRole,
    choirName: string,
    personName: string,
  ) => void;
}) {
  const [selectedId, setSelectedId] = useState(musicians[0]?.id ?? '');
  const [choirId, setChoirId] = useState(choirs[0]?.id ?? '');
  const [role, setRole] = useState<ChoirMemberRole>('band');

  const selected = musicians.find((person) => person.id === selectedId);

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div>
        <h2 className="text-lg font-bold text-ebc-burgundy">External musicians</h2>
        <p className="mt-1 text-sm text-slate-600">
          Hired and guest musicians from the directory (status: Hired). Call them
          up onto a choir roster when they are playing with that group.
        </p>
      </div>

      {musicians.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
          No external musicians yet. Add someone in People with membership status{' '}
          <span className="font-medium">Hired</span>.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {musicians.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm ${
                    selectedId === person.id
                      ? 'bg-ebc-burgundy/5'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span>
                    <span className="font-medium text-slate-900">
                      {personDisplayName(person)}
                    </span>
                    {person.email ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {person.email}
                      </span>
                    ) : null}
                    {person.notes ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {person.notes}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs font-medium text-amber-800">External</span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-sm font-semibold text-amber-950">
                Call up {personDisplayName(selected)}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Choir</span>
                  <select
                    value={choirId}
                    onChange={(event) => setChoirId(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {choirs.map((choir) => (
                      <option key={choir.id} value={choir.id}>
                        {choir.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">As</span>
                  <select
                    value={role}
                    onChange={(event) =>
                      setRole(event.target.value as ChoirMemberRole)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {CHOIR_MEMBER_ROLES.map((option) => (
                      <option key={option} value={option}>
                        {CHOIR_MEMBER_ROLE_LABELS[option]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                disabled={isPending || !choirId}
                onClick={() => {
                  const choir = choirs.find((row) => row.id === choirId);
                  if (!choir) return;
                  onCallUp(
                    choir.id,
                    selected.id,
                    role,
                    choir.name,
                    personDisplayName(selected),
                  );
                }}
                className="mt-4 rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
              >
                {isPending ? 'Calling up…' : 'Call up to choir'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function AppAccessPanel({
  people,
  isPending,
  onAssign,
  onRemove,
}: {
  people: DirectoryPerson[];
  isPending: boolean;
  onAssign: (personId: string, role: MusicManageableRole) => void;
  onRemove: (person: DirectoryPerson, role: MusicManageableRole) => void;
}) {
  const groups = useMemo(() => groupPeopleByMusicRole(people), [people]);
  const ministers = useMemo(() => musicMinisters(people), [people]);
  const [pickingRole, setPickingRole] = useState<MusicManageableRole | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Person[]>([]);

  const assignedForRole = useMemo(() => {
    if (!pickingRole) return new Set<string>();
    return new Set(
      groups
        .find((group) => group.role === pickingRole)
        ?.people.map((person) => person.id) ?? [],
    );
  }, [groups, pickingRole]);

  useEffect(() => {
    if (!pickingRole) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void searchPeopleAction(query).then((result) => {
        if (cancelled || !result.ok) return;
        setResults(
          result.people.filter((person) => !assignedForRole.has(person.id)),
        );
      });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [pickingRole, query, assignedForRole]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        App login roles for Music (who can sign in as choir/band director or
        member). Separate from which choir roster they sing on.
      </p>

      {ministers.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <h2 className="text-lg font-bold text-ebc-burgundy">Music Minister</h2>
          <p className="mt-1 text-sm text-slate-600">
            Managed in Settings → Users.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {ministers.map((person) => (
              <li key={person.id} className="font-medium text-slate-900">
                {personDisplayName(person)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {groups.map((group) => (
        <section
          key={group.role}
          className="rounded-xl border border-slate-200 bg-white px-5 py-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ebc-burgundy">
                {ROLE_LABELS[group.role]}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {group.people.length === 0
                  ? 'No one assigned.'
                  : `${group.people.length} with app access`}
              </p>
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setPickingRole((current) =>
                  current === group.role ? null : group.role,
                );
                setQuery('');
                setResults([]);
              }}
              className="rounded-lg border border-ebc-burgundy/40 px-3 py-1.5 text-sm font-medium text-ebc-burgundy hover:bg-ebc-burgundy/5 disabled:opacity-50"
            >
              {pickingRole === group.role ? 'Cancel' : 'Grant access'}
            </button>
          </div>

          {group.people.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {group.people.map((person) => (
                <li
                  key={person.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-900">
                    {personDisplayName(person)}
                  </span>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => onRemove(person, group.role)}
                    className="text-sm text-slate-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {pickingRole === group.role ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <DirectorySearch
                query={query}
                onQueryChange={setQuery}
                results={results}
                isPending={isPending}
                emptyHint="Search the directory to grant this app role."
                onPick={(person) => {
                  onAssign(person.id, group.role);
                  setPickingRole(null);
                  setQuery('');
                  setResults([]);
                }}
              />
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function DirectorySearch({
  query,
  onQueryChange,
  results,
  isPending,
  emptyHint,
  onPick,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  results: Person[];
  isPending: boolean;
  emptyHint: string;
  onPick: (person: Person) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Search the directory
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Name or email…"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          autoFocus
        />
      </label>
      {results.length === 0 ? (
        <p className="text-sm text-slate-500">
          {query.trim() ? 'No matching people.' : emptyHint}
        </p>
      ) : (
        <ul className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {results.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => onPick(person)}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-ebc-burgundy/5 disabled:opacity-50"
              >
                <span>
                  <span className="font-medium text-slate-900">
                    {personDisplayName(person)}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {person.email ?? 'No email'}
                    {person.membershipStatus === 'hired' ? ' · External' : ''}
                  </span>
                </span>
                <span className="text-xs font-medium text-ebc-burgundy">Add</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
