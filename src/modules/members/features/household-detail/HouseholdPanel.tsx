'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  addHouseholdChildAction,
  addHouseholdMemberAction,
  createHouseholdAction,
  unlinkHouseholdMemberAction,
  updateHouseholdMemberRoleAction,
} from '@/modules/members/actions/household.actions';
import { searchPeopleAction } from '@/modules/members/actions/person.actions';
import type {
  HouseholdDetail,
  HouseholdRole,
  Person,
} from '@/modules/members/types';
import {
  HOUSEHOLD_ROLES,
  NAME_SUFFIX_OPTIONS,
  personDisplayName,
} from '@/modules/members/types';
import { personAgeBadge } from '@/modules/members/utils/person-minor.utils';

export type HouseholdPanelProps = {
  person: Person;
  household: HouseholdDetail | null;
  canManage?: boolean;
};

export function HouseholdPanel({
  person,
  household,
  canManage = false,
}: HouseholdPanelProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState(
    `${person.lastName} family`,
  );
  const [linkPersonId, setLinkPersonId] = useState('');
  const [linkRole, setLinkRole] = useState<HouseholdRole>('spouse');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [childFirst, setChildFirst] = useState('');
  const [childLast, setChildLast] = useState(person.lastName);
  const [childSuffix, setChildSuffix] = useState('');
  const [childDob, setChildDob] = useState('');

  const otherMembers = useMemo(
    () => household?.members.filter((member) => member.personId !== person.id) ?? [],
    [household, person.id],
  );

  function refresh(): void {
    router.refresh();
  }

  function handleCreateHousehold(): void {
    setError(null);
    startTransition(async () => {
      const result = await createHouseholdAction({
        name: householdName,
        founderPersonId: person.id,
        founderRole: 'head',
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  function handleSearchPeople(): void {
    setError(null);
    startTransition(async () => {
      const result = await searchPeopleAction(searchQuery);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSearchResults(
        result.people.filter((row) => row.id !== person.id),
      );
    });
  }

  function handleLinkMember(): void {
    if (!household || !linkPersonId) return;
    setError(null);
    startTransition(async () => {
      const result = await addHouseholdMemberAction({
        householdId: household.id,
        personId: linkPersonId,
        role: linkRole,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLinkPersonId('');
      setSearchResults([]);
      setSearchQuery('');
      refresh();
    });
  }

  function handleAddChild(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!household) return;
    setError(null);
    startTransition(async () => {
      const result = await addHouseholdChildAction({
        householdId: household.id,
        firstName: childFirst,
        lastName: childLast,
        suffix: childSuffix || undefined,
        dateOfBirth: childDob || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setChildFirst('');
      setChildSuffix('');
      setChildDob('');
      refresh();
    });
  }

  function handleRoleChange(personId: string, role: HouseholdRole): void {
    setError(null);
    startTransition(async () => {
      const result = await updateHouseholdMemberRoleAction({ personId, role });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  async function handleUnlink(personId: string, name: string): Promise<void> {
    const confirmed = await confirm({
      title: 'Unlink from household?',
      description: `${name} will be unlinked from this household.`,
      confirmLabel: 'Unlink',
      tone: 'danger',
    });
    if (!confirmed) return;
    setError(null);
    startTransition(async () => {
      const result = await unlinkHouseholdMemberAction({ personId });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not unlink', description: result.error, tone: 'error' });
        return;
      }
      toast({ title: 'Unlinked from household', tone: 'success' });
      refresh();
    });
  }

  return (
    <section className="ebc-card space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Family / household
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Link spouse, kids, and others. Birthday drives age: under 13 have no app login;
          juniors (13–17) can get choir / band / volunteer access with an email.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {!household ? (
        canManage ? (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Household name</span>
              <input
                value={householdName}
                onChange={(event) => setHouseholdName(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                disabled={isPending}
              />
            </label>
            <button
              type="button"
              onClick={handleCreateHousehold}
              disabled={isPending || !householdName.trim()}
              className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
            >
              {isPending ? 'Creating…' : 'Create household'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No household linked yet.</p>
        )
      ) : (
        <>
          <div>
            <p className="text-base font-semibold text-ebc-burgundy">{household.name}</p>
            {(household.primaryEmail || household.primaryPhone) && (
              <p className="mt-1 text-sm text-slate-600">
                {[household.primaryPhone, household.primaryEmail]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>

          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {household.members.map((member) => {
              const name = personDisplayName(member.person);
              const isSelf = member.personId === person.id;
              const ageBadge = personAgeBadge(member.person);
              return (
                <li
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                >
                  <div>
                    {isSelf ? (
                      <span className="font-medium text-slate-900">{name}</span>
                    ) : (
                      <Link
                        href={`/people/${member.personId}`}
                        className="font-medium text-ebc-burgundy hover:underline"
                      >
                        {name}
                      </Link>
                    )}
                    <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {HOUSEHOLD_ROLES[member.role]}
                    </span>
                    {ageBadge === 'child' ? (
                      <span className="ml-1 rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                        Under 13
                      </span>
                    ) : null}
                    {ageBadge === 'junior' ? (
                      <span className="ml-1 rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-800">
                        Junior
                      </span>
                    ) : null}
                  </div>
                  {canManage ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(event) =>
                          handleRoleChange(
                            member.personId,
                            event.target.value as HouseholdRole,
                          )
                        }
                        disabled={isPending}
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        {(Object.keys(HOUSEHOLD_ROLES) as HouseholdRole[]).map(
                          (role) => (
                            <option key={role} value={role}>
                              {HOUSEHOLD_ROLES[role]}
                            </option>
                          ),
                        )}
                      </select>
                      {!isSelf ? (
                        <button
                          type="button"
                          onClick={() => {
                            void handleUnlink(member.personId, name);
                          }}
                          disabled={isPending}
                          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          Unlink
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {canManage ? (
            <div className="grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800">
                  Link existing person
                </h4>
                <div className="flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search name…"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={handleSearchPeople}
                    disabled={isPending}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Search
                  </button>
                </div>
                <select
                  value={linkPersonId}
                  onChange={(event) => setLinkPersonId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={isPending}
                >
                  <option value="">Select person…</option>
                  {searchResults.map((row) => (
                    <option key={row.id} value={row.id}>
                      {personDisplayName(row)}
                    </option>
                  ))}
                  {otherMembers.map((member) => (
                    <option key={`listed-${member.personId}`} value={member.personId} disabled>
                      {personDisplayName(member.person)} (already linked)
                    </option>
                  ))}
                </select>
                <select
                  value={linkRole}
                  onChange={(event) =>
                    setLinkRole(event.target.value as HouseholdRole)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  disabled={isPending}
                >
                  {(Object.keys(HOUSEHOLD_ROLES) as HouseholdRole[]).map((role) => (
                    <option key={role} value={role}>
                      {HOUSEHOLD_ROLES[role]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleLinkMember}
                  disabled={isPending || !linkPersonId}
                  className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
                >
                  Add to household
                </button>
              </div>

              <form onSubmit={handleAddChild} className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800">Add child</h4>
                <p className="text-xs text-slate-500">
                  Creates a person marked as a minor and links them as Child.
                </p>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">First name *</span>
                  <input
                    required
                    value={childFirst}
                    onChange={(event) => setChildFirst(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    disabled={isPending}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Last name *</span>
                  <input
                    required
                    value={childLast}
                    onChange={(event) => setChildLast(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    disabled={isPending}
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Suffix</span>
                  <input
                    list="name-suffixes-child"
                    value={childSuffix}
                    onChange={(event) => setChildSuffix(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Jr., IV…"
                    disabled={isPending}
                  />
                  <datalist id="name-suffixes-child">
                    {NAME_SUFFIX_OPTIONS.map((suffix) => (
                      <option key={suffix} value={suffix} />
                    ))}
                  </datalist>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Birthday</span>
                  <input
                    type="date"
                    value={childDob}
                    onChange={(event) => setChildDob(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    disabled={isPending}
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Optional but recommended. App access from 13; without a birthday,
                    household children stay without login.
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg border border-ebc-burgundy px-4 py-2 text-sm font-medium text-ebc-burgundy hover:bg-ebc-burgundy/5 disabled:opacity-50"
                >
                  {isPending ? 'Adding…' : 'Add child'}
                </button>
              </form>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
