'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import {
  deletePersonAction,
  updatePersonAction,
} from '@/modules/members/actions/person.actions';
import { HouseholdPanel } from '@/modules/members/features/household-detail';
import {
  MEMBERSHIP_STATUSES,
  NAME_SUFFIX_OPTIONS,
  type DirectoryPerson,
  type HouseholdDetail,
  type MembershipStatus,
  personDisplayName,
} from '@/modules/members/types';
import type { PersonMinistryAffiliation } from '@/modules/members/utils/person-ministry.utils';
import { personAgeBadge } from '@/modules/members/utils/person-minor.utils';
import { formatDirectoryRoleLabels } from '@/modules/members/utils/person-roles.utils';

import { PersonAccessPanel } from './PersonAccessPanel';

export type MemberDetailProps = {
  person: DirectoryPerson;
  household: HouseholdDetail | null;
  affiliations?: PersonMinistryAffiliation[];
  canManage?: boolean;
  startInEdit?: boolean;
};

export function MemberDetail({
  person,
  household,
  affiliations = [],
  canManage = false,
  startInEdit = false,
}: MemberDetailProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(startInEdit && canManage);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(person.firstName);
  const [lastName, setLastName] = useState(person.lastName);
  const [suffix, setSuffix] = useState(person.suffix ?? '');
  const [email, setEmail] = useState(person.email ?? '');
  const [phone, setPhone] = useState(person.phone ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(person.dateOfBirth ?? '');
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>(
    person.membershipStatus,
  );
  const [notes, setNotes] = useState(person.notes ?? '');

  const roleLabels = formatDirectoryRoleLabels(person);
  const ageBadge = personAgeBadge(person);

  function resetForm() {
    setFirstName(person.firstName);
    setLastName(person.lastName);
    setSuffix(person.suffix ?? '');
    setEmail(person.email ?? '');
    setPhone(person.phone ?? '');
    setDateOfBirth(person.dateOfBirth ?? '');
    setMembershipStatus(person.membershipStatus);
    setNotes(person.notes ?? '');
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOkMessage(null);

    startTransition(async () => {
      const result = await updatePersonAction({
        id: person.id,
        firstName,
        lastName,
        suffix: suffix || undefined,
        email: email || undefined,
        phone: phone || undefined,
        dateOfBirth: dateOfBirth || undefined,
        membershipStatus,
        notes: notes || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setOkMessage('Person updated.');
      router.refresh();
    });
  }

  async function handleDelete(): Promise<void> {
    const confirmed = await confirm({
      title: 'Remove from directory?',
      description: `${personDisplayName(person)} will be removed. This cannot be undone.`,
      confirmLabel: 'Remove person',
      tone: 'danger',
    });
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deletePersonAction({ id: person.id });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not remove person', description: result.error, tone: 'error' });
        return;
      }
      toast({ title: 'Person removed', tone: 'success' });
      router.push('/people');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/people" className="text-sm text-ebc-burgundy hover:underline">
            ← People
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-ebc-burgundy">
            {personDisplayName(person)}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1">
            {ageBadge === 'child' ? (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                Under 13 — no app login
              </span>
            ) : null}
            {ageBadge === 'junior' ? (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-800">
                Junior (13–17) — choir / band / volunteer access
              </span>
            ) : null}
            {roleLabels.map((label) => (
              <span
                key={label}
                className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs text-ebc-burgundy"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (editing) resetForm();
                setEditing((value) => !value);
                setError(null);
                setOkMessage(null);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-ebc-burgundy/40"
            >
              {editing ? 'Cancel edit' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleDelete();
              }}
              disabled={isPending}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ) : null}
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

      {editing && canManage ? (
        <form onSubmit={handleSave} className="ebc-card grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">First name *</span>
            <input
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Last name *</span>
            <input
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Suffix</span>
            <input
              list="name-suffixes"
              value={suffix}
              onChange={(event) => setSuffix(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Jr., III, IV…"
              disabled={isPending}
            />
            <datalist id="name-suffixes">
              {NAME_SUFFIX_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Birthday</span>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
            <span className="mt-1 block text-xs text-slate-500">
              App access from age 13 with junior roles (choir, band, volunteer). Under 13:
              no login — contact guardians.
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Membership status</span>
            <select
              value={membershipStatus}
              onChange={(event) =>
                setMembershipStatus(event.target.value as MembershipStatus)
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
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 min-h-[96px] w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={isPending}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="ebc-card space-y-4">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Contact info
            </h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-500">Suffix</dt>
                <dd className="mt-1 text-sm text-slate-900">{person.suffix ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Birthday</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {person.dateOfBirth ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {person.email ? (
                    <a
                      href={`mailto:${person.email}`}
                      className="text-ebc-burgundy hover:underline"
                    >
                      {person.email}
                    </a>
                  ) : ageBadge === 'child' ? (
                    '— (use household / guardians)'
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Phone</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {person.phone ? (
                    <a
                      href={`tel:${person.phone}`}
                      className="text-ebc-burgundy hover:underline"
                    >
                      {person.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Notes
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-900">
              {person.notes?.trim() ? person.notes : '—'}
            </p>
          </section>
        </div>
      )}

      <PersonAccessPanel
        person={person}
        affiliations={affiliations}
        canManage={canManage}
      />

      <HouseholdPanel person={person} household={household} canManage={canManage} />
    </div>
  );
}
