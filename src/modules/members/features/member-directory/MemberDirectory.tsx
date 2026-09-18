'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { SortableTh } from '@/components/ui/SortableTh';
import { useToast } from '@/components/ui/Toast';
import type { SortDirection, SortState } from '@/lib/table-sort';
import { toggleSortState } from '@/lib/table-sort';
import {
  createPersonAction,
  deletePersonAction,
} from '@/modules/members/actions/person.actions';
import {
  MEMBERSHIP_STATUSES,
  NAME_SUFFIX_OPTIONS,
  type DirectoryPerson,
  type MembershipStatus,
  personDisplayName,
} from '@/modules/members/types';
import {
  directoryHref,
  type PersonDirectoryPage,
  type PersonDirectorySortKey,
} from '@/modules/members/utils/person-directory.utils';
import {
  canHaveAppAccess,
  personAgeBadge,
} from '@/modules/members/utils/person-minor.utils';
import { formatDirectoryRoleLabels } from '@/modules/members/utils/person-roles.utils';

import { AddRoleButton } from './AddRoleButton';

export type MemberDirectoryProps = {
  people: DirectoryPerson[];
  page: PersonDirectoryPage;
  query: string;
  status: string;
  sort: PersonDirectorySortKey;
  dir: SortDirection;
  canManage?: boolean;
};

type CreateFormState = {
  firstName: string;
  lastName: string;
  suffix: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  membershipStatus: MembershipStatus;
  notes: string;
};

const EMPTY_FORM: CreateFormState = {
  firstName: '',
  lastName: '',
  suffix: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  membershipStatus: 'member',
  notes: '',
};

export function MemberDirectory({
  people,
  page,
  query,
  status,
  sort,
  dir,
  canManage = false,
}: MemberDirectoryProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(query);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const sortState: SortState<PersonDirectorySortKey> = { key: sort, direction: dir };

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  function navigate(next: {
    q?: string;
    status?: string;
    page?: number;
    sort?: PersonDirectorySortKey;
    dir?: SortDirection;
  }) {
    router.push(
      directoryHref({
        q: next.q,
        status: next.status,
        page: next.page,
        sort: next.sort ?? sort,
        dir: next.dir ?? dir,
      }),
    );
  }

  function handleSort(columnKey: PersonDirectorySortKey): void {
    const next = toggleSortState(sortState, columnKey);
    navigate({
      q: query || undefined,
      status: status || undefined,
      page: 1,
      sort: next.key,
      dir: next.direction,
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({
      q: searchInput.trim() || undefined,
      status: status || undefined,
      page: 1,
    });
  }

  function handleStatusChange(nextStatus: string) {
    navigate({
      q: query || undefined,
      status: nextStatus || undefined,
      page: 1,
    });
  }

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOkMessage(null);

    startTransition(async () => {
      const result = await createPersonAction({
        firstName: form.firstName,
        lastName: form.lastName,
        suffix: form.suffix || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        membershipStatus: form.membershipStatus,
        notes: form.notes || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setShowForm(false);
      setForm(EMPTY_FORM);
      setOkMessage('Person added to the directory.');
      router.refresh();
    });
  }

  async function handleDelete(person: DirectoryPerson): Promise<void> {
    const confirmed = await confirm({
      title: 'Remove from directory?',
      description: `${personDisplayName(person)} will be removed. This cannot be undone.`,
      confirmLabel: 'Remove person',
      tone: 'danger',
    });
    if (!confirmed) return;

    setError(null);
    setOkMessage(null);
    startTransition(async () => {
      const result = await deletePersonAction({ id: person.id });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not remove person', description: result.error, tone: 'error' });
        return;
      }
      setOkMessage('Person removed.');
      toast({ title: 'Person removed', tone: 'success' });
      router.refresh();
    });
  }

  const rangeStart = page.total === 0 ? 0 : (page.page - 1) * page.pageSize + 1;
  const rangeEnd = Math.min(page.page * page.pageSize, page.total);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ebc-burgundy">People</h2>
          <p className="mt-1 text-sm text-slate-600">
            Church directory. Ministry rosters link to these people.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setShowForm((value) => !value);
              setError(null);
              setOkMessage(null);
            }}
            className="rounded-lg bg-ebc-burgundy px-3 py-1.5 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
          >
            {showForm ? 'Cancel' : 'Add person'}
          </button>
        ) : null}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="block min-w-[16rem] flex-1">
          <span className="sr-only">Search people</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filter by status</span>
          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {Object.entries(MEMBERSHIP_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-ebc-burgundy/40"
        >
          Search
        </button>
      </form>

      {showForm && canManage ? (
        <form onSubmit={handleCreate} className="ebc-card grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h3 className="text-base font-semibold text-ebc-burgundy">Add person</h3>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">First name *</span>
            <input
              required
              value={form.firstName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, firstName: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Last name *</span>
            <input
              required
              value={form.lastName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, lastName: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Suffix</span>
            <input
              list="name-suffixes-create"
              value={form.suffix}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, suffix: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Jr., III, IV…"
              disabled={isPending}
            />
            <datalist id="name-suffixes-create">
              {NAME_SUFFIX_OPTIONS.map((suffix) => (
                <option key={suffix} value={suffix} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Birthday</span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
            <span className="mt-1 block text-xs text-slate-500">
              App access from age 13 (junior roles). Under 13: no login.
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Membership status</span>
            <select
              value={form.membershipStatus}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  membershipStatus: event.target.value as MembershipStatus,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            >
              {Object.entries(MEMBERSHIP_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              className="mt-1 min-h-[72px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save person'}
            </button>
          </div>
        </form>
      ) : null}

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

      {people.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No people match that search.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <SortableTh
                  label="Last name"
                  columnKey="lastName"
                  sort={sortState}
                  onSort={handleSort}
                />
                <SortableTh
                  label="First name"
                  columnKey="firstName"
                  sort={sortState}
                  onSort={handleSort}
                />
                <SortableTh
                  label="Membership"
                  columnKey="status"
                  sort={sortState}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {people.map((person) => {
                const roleLabels = formatDirectoryRoleLabels(person);
                return (
                  <tr key={person.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        href={`/people/${person.id}`}
                        className="text-ebc-burgundy hover:underline"
                      >
                        {person.lastName}
                        {person.suffix ? ` ${person.suffix}` : ''}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {person.firstName}
                      {(() => {
                        const badge = personAgeBadge(person);
                        if (badge === 'child') {
                          return (
                            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                              Under 13
                            </span>
                          );
                        }
                        if (badge === 'junior') {
                          return (
                            <span className="ml-2 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-800">
                              Junior
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1">
                        {roleLabels.map((label) => (
                          <span
                            key={label}
                            className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs text-ebc-burgundy"
                          >
                            {label}
                          </span>
                        ))}
                        {canManage && canHaveAppAccess(person) ? (
                          <AddRoleButton
                            person={person}
                            onError={setError}
                            onSuccess={setOkMessage}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/people/${person.id}`}
                          className="text-sm font-medium text-ebc-burgundy hover:underline"
                        >
                          View
                        </Link>
                        {canManage ? (
                          <>
                            <Link
                              href={`/people/${person.id}?edit=1`}
                              className="text-sm font-medium text-ebc-burgundy hover:underline"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                void handleDelete(person);
                              }}
                              disabled={isPending}
                              className="text-sm font-medium text-red-700 hover:underline disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <p>
          {page.total === 0
            ? '0 people'
            : `Showing ${rangeStart}–${rangeEnd} of ${page.total}`}
        </p>
        <div className="flex items-center gap-2">
          {page.page > 1 ? (
            <Link
              href={directoryHref({
                q: query || undefined,
                status: status || undefined,
                page: page.page - 1,
              })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-ebc-burgundy/40"
            >
              Previous
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">
              Previous
            </span>
          )}
          <span className="px-1">
            Page {page.page} of {page.totalPages}
          </span>
          {page.page < page.totalPages ? (
            <Link
              href={directoryHref({
                q: query || undefined,
                status: status || undefined,
                page: page.page + 1,
              })}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:border-ebc-burgundy/40"
            >
              Next
            </Link>
          ) : (
            <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-400">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
