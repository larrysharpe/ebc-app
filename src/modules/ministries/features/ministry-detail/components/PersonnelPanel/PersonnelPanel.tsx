'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { SortableTh } from '@/components/ui/SortableTh';
import { useToast } from '@/components/ui/Toast';
import { useSortableRows } from '@/hooks/use-sortable-rows';
import {
  addPersonnelAction,
  removePersonnelAction,
  updatePersonnelAction,
  type MinistryPersonRole,
} from '@/modules/ministries/actions/ministry.actions';
import { PERSON_ROLE_LABELS } from '@/modules/ministries/constants/ministry.constants';
import { searchPeopleAction } from '@/modules/members/actions/person.actions';
import type { Person } from '@/modules/members/types';
import { personDisplayName } from '@/modules/members/types';
import type {
  Ministry,
  MinistryDutyDefinition,
  MinistryDutyId,
  MinistryPerson,
} from '@/modules/ministries/types';
import {
  activeDutyCatalog,
  formatMinistryDuties,
} from '@/modules/ministries/utils/ministry-personnel.utils';

type PersonnelSortKey = 'name' | 'role' | 'duties' | 'contact';

export type PersonnelPanelProps = {
  ministry: Ministry;
  canManage?: boolean;
};

const ROLE_OPTIONS = Object.entries(PERSON_ROLE_LABELS) as [MinistryPersonRole, string][];

type PersonFormState = {
  id?: string;
  personId: string;
  memberLabel: string;
  name: string;
  role: MinistryPersonRole;
  title: string;
  duties: MinistryDutyId[];
  isOpenRole: boolean;
};

const EMPTY_FORM: PersonFormState = {
  personId: '',
  memberLabel: '',
  name: '',
  role: 'member',
  title: '',
  duties: [],
  isOpenRole: false,
};

function personToForm(person: MinistryPerson): PersonFormState {
  return {
    id: person.id,
    personId: person.personId ?? '',
    memberLabel: person.personId ? person.name : '',
    name: person.name,
    role: person.role,
    title: person.title ?? '',
    duties: person.duties ?? [],
    isOpenRole: Boolean(person.isOpenRole),
  };
}

function CollapsibleTableSection({
  id,
  title,
  count,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
      >
        <span className="flex-1 text-sm font-semibold text-slate-900">
          {title}
          <span className="ml-2 font-normal text-slate-500">({count})</span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? <div id={id}>{children}</div> : null}
    </div>
  );
}

function PersonnelTable({
  rows,
  dutyCatalog,
  sort,
  onSort,
  canManage,
  isPending,
  showContact,
  emptyMessage,
  onEdit,
  onRemove,
}: {
  rows: MinistryPerson[];
  dutyCatalog: MinistryDutyDefinition[];
  sort: { key: PersonnelSortKey; direction: 'asc' | 'desc' };
  onSort: (key: PersonnelSortKey) => void;
  canManage: boolean;
  isPending: boolean;
  showContact: boolean;
  emptyMessage: string;
  onEdit: (person: MinistryPerson) => void;
  onRemove: (personId: string) => void;
}): ReactElement {
  if (rows.length === 0) {
    return (
      <p className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border-t border-slate-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs">
          <tr>
            <SortableTh label="Name" columnKey="name" sort={sort} onSort={onSort} />
            <SortableTh label="Role" columnKey="role" sort={sort} onSort={onSort} />
            <SortableTh
              label="Duties"
              columnKey="duties"
              sort={sort}
              onSort={onSort}
              className="hidden md:table-cell"
            />
            {showContact ? (
              <SortableTh
                label="Contact"
                columnKey="contact"
                sort={sort}
                onSort={onSort}
                className="hidden sm:table-cell"
              />
            ) : null}
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((person) => (
            <tr key={person.id}>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{person.name}</p>
                <p className="text-xs text-slate-500">
                  {person.isOpenRole
                    ? 'Vacancy'
                    : person.personId
                      ? 'Linked member'
                      : 'Unlinked'}
                  {person.title ? ` · ${person.title}` : ''}
                </p>
                <p className="mt-1 text-xs text-slate-500 md:hidden">
                  {formatMinistryDuties(person.duties, dutyCatalog) || '—'}
                </p>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {PERSON_ROLE_LABELS[person.role]}
              </td>
              <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                {formatMinistryDuties(person.duties, dutyCatalog) || '—'}
              </td>
              {showContact ? (
                <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                  {person.email ? <p>{person.email}</p> : null}
                  {person.phone ? <p>{person.phone}</p> : null}
                  {!person.email && !person.phone ? '—' : null}
                </td>
              ) : null}
              <td className="px-4 py-3 text-right">
                {canManage ? (
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(person)}
                      disabled={isPending}
                      className="text-xs font-medium text-ebc-navy hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(person.id)}
                      disabled={isPending}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PersonnelPanel({ ministry, canManage = false }: PersonnelPanelProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PersonFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState('');
  const [memberResults, setMemberResults] = useState<Person[]>([]);
  const [rosterOpen, setRosterOpen] = useState(true);
  const [openRolesOpen, setOpenRolesOpen] = useState(true);

  const rosterPeople = useMemo(
    () => ministry.personnel.filter((person) => !person.isOpenRole),
    [ministry.personnel],
  );
  const openRolePeople = useMemo(
    () => ministry.personnel.filter((person) => Boolean(person.isOpenRole)),
    [ministry.personnel],
  );

  const dutyOptions = useMemo(() => {
    const active = activeDutyCatalog(ministry.dutyCatalog);
    const assignedInactive = ministry.dutyCatalog.filter(
      (duty) => !duty.active && form.duties.includes(duty.id),
    );
    return [...active, ...assignedInactive];
  }, [ministry.dutyCatalog, form.duties]);

  const getSortValue = useCallback(
    (person: MinistryPerson, key: PersonnelSortKey) => {
      switch (key) {
        case 'name':
          return person.name;
        case 'role':
          return PERSON_ROLE_LABELS[person.role];
        case 'duties':
          return formatMinistryDuties(person.duties, ministry.dutyCatalog);
        case 'contact':
          return person.email || person.phone || '';
        default:
          return '';
      }
    },
    [ministry.dutyCatalog],
  );

  const {
    sortedRows: sortedRoster,
    sort: rosterSort,
    onSort: onRosterSort,
  } = useSortableRows<MinistryPerson, PersonnelSortKey>(rosterPeople, getSortValue, {
    key: 'name',
    direction: 'asc',
  });

  const {
    sortedRows: sortedOpenRoles,
    sort: openRolesSort,
    onSort: onOpenRolesSort,
  } = useSortableRows<MinistryPerson, PersonnelSortKey>(openRolePeople, getSortValue, {
    key: 'name',
    direction: 'asc',
  });

  useEffect(() => {
    if (!formOpen || form.isOpenRole) return;
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void searchPeopleAction(memberQuery).then((result) => {
        if (cancelled || !result.ok) return;
        setMemberResults(result.people);
      });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [formOpen, form.isOpenRole, memberQuery]);

  function openCreate() {
    setError(null);
    setForm(EMPTY_FORM);
    setMemberQuery('');
    setFormOpen(true);
  }

  function openEdit(person: MinistryPerson) {
    setError(null);
    setForm(personToForm(person));
    setMemberQuery(person.personId ? person.name : '');
    setFormOpen(true);
  }

  function toggleDuty(dutyId: MinistryDutyId) {
    setForm((current) => ({
      ...current,
      duties: current.duties.includes(dutyId)
        ? current.duties.filter((item) => item !== dutyId)
        : [...current.duties, dutyId],
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      personId: form.isOpenRole ? undefined : form.personId || undefined,
      name: form.isOpenRole ? form.name : undefined,
      role: form.role,
      title: form.title || undefined,
      duties: form.duties,
      isOpenRole: form.isOpenRole,
    };

    startTransition(async () => {
      const result = form.id
        ? await updatePersonnelAction(ministry.slug, payload)
        : await addPersonnelAction(ministry.slug, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFormOpen(false);
      setForm(EMPTY_FORM);
      router.refresh();
    });
  }

  async function handleRemove(personId: string): Promise<void> {
    const person = ministry.personnel.find((entry) => entry.id === personId);
    const confirmed = await confirm({
      title: person?.isOpenRole
        ? 'Remove this open role?'
        : 'Remove this person from the roster?',
      description: person?.isOpenRole
        ? 'The open role will be removed from this ministry’s roster.'
        : `${person?.name ?? 'This person'} will be removed from this ministry’s roster.`,
      confirmLabel: 'Remove',
      tone: 'danger',
    });
    if (!confirmed) return;
    startTransition(async () => {
      await removePersonnelAction(ministry.slug, personId);
      toast({ title: 'Removed from roster', tone: 'success' });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ebc-burgundy">Ministry roster</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Roster entries link to{' '}
            <Link href="/people" className="font-medium text-ebc-navy hover:underline">
              church members
            </Link>
            . Assign leadership roles and duties from this ministry’s{' '}
            <Link
              href={`/ministries/${ministry.slug}?tab=duties`}
              className="font-medium text-ebc-navy hover:underline"
            >
              duty catalog
            </Link>
            .
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => {
              if (formOpen) {
                setFormOpen(false);
                setForm(EMPTY_FORM);
              } else {
                openCreate();
              }
            }}
            className="rounded-lg bg-ebc-burgundy px-3 py-1.5 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
          >
            {formOpen ? 'Cancel' : 'Add person'}
          </button>
        ) : null}
      </div>

      {formOpen && canManage ? (
        <form onSubmit={handleSubmit} className="ebc-card grid gap-3 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm font-semibold text-slate-800">
            {form.id ? 'Edit roster entry' : 'Add to roster'}
          </p>

          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isOpenRole}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isOpenRole: event.target.checked,
                  personId: '',
                  memberLabel: '',
                }))
              }
            />
            Open role / vacancy (not a directory member yet)
          </label>

          {form.isOpenRole ? (
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Role label *</span>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="e.g. Photographer"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          ) : (
            <div className="sm:col-span-2 space-y-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Church member *</span>
                <input
                  value={memberQuery}
                  onChange={(event) => {
                    setMemberQuery(event.target.value);
                    setForm((current) => ({
                      ...current,
                      personId: '',
                      memberLabel: '',
                    }));
                  }}
                  placeholder="Search members by name…"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              {form.personId ? (
                <p className="text-xs text-ebc-green-dark">
                  Selected: {form.memberLabel}{' '}
                  <button
                    type="button"
                    className="font-medium text-slate-500 hover:underline"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        personId: '',
                        memberLabel: '',
                      }))
                    }
                  >
                    Clear
                  </button>
                </p>
              ) : (
                <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                  {memberResults.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-slate-500">
                      No matches.{' '}
                      <Link href="/people" className="text-ebc-navy hover:underline">
                        Add them under Members
                      </Link>{' '}
                      first.
                    </li>
                  ) : (
                    memberResults.map((person) => (
                      <li key={person.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              personId: person.id,
                              memberLabel: personDisplayName(person),
                            }));
                            setMemberQuery(personDisplayName(person));
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="font-medium text-slate-800">
                            {personDisplayName(person)}
                          </span>
                          {person.email ? (
                            <span className="ml-2 text-xs text-slate-500">{person.email}</span>
                          ) : null}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Leadership role</span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as MinistryPersonRole,
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {ROLE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Title (optional)</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="e.g. Youth Bible Study"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-slate-700">Duties</legend>
            {dutyOptions.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                No duties in this ministry’s catalog yet.{' '}
                <Link
                  href={`/ministries/${ministry.slug}?tab=duties`}
                  className="font-medium text-ebc-navy hover:underline"
                >
                  Add duties
                </Link>{' '}
                first.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {dutyOptions.map((duty) => {
                  const checked = form.duties.includes(duty.id);
                  return (
                    <label
                      key={duty.id}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                        checked
                          ? 'border-ebc-burgundy bg-ebc-burgundy/10 text-ebc-burgundy'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleDuty(duty.id)}
                      />
                      {duty.label}
                      {!duty.active ? ' (inactive)' : ''}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : form.id ? 'Save changes' : 'Add to roster'}
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {ministry.personnel.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No one on the roster yet. Add church members to build it.
        </p>
      ) : (
        <div className="space-y-3">
          <CollapsibleTableSection
            id="ministry-roster-filled"
            title="Roster"
            count={rosterPeople.length}
            open={rosterOpen}
            onToggle={() => setRosterOpen((value) => !value)}
          >
            <PersonnelTable
              rows={sortedRoster}
              dutyCatalog={ministry.dutyCatalog}
              sort={rosterSort}
              onSort={onRosterSort}
              canManage={canManage}
              isPending={isPending}
              showContact
              emptyMessage="No filled roster entries yet."
              onEdit={openEdit}
              onRemove={handleRemove}
            />
          </CollapsibleTableSection>

          <CollapsibleTableSection
            id="ministry-roster-open-roles"
            title="Open roles"
            count={openRolePeople.length}
            open={openRolesOpen}
            onToggle={() => setOpenRolesOpen((value) => !value)}
          >
            <PersonnelTable
              rows={sortedOpenRoles}
              dutyCatalog={ministry.dutyCatalog}
              sort={openRolesSort}
              onSort={onOpenRolesSort}
              canManage={canManage}
              isPending={isPending}
              showContact={false}
              emptyMessage="No open roles or vacancies."
              onEdit={openEdit}
              onRemove={handleRemove}
            />
          </CollapsibleTableSection>
        </div>
      )}
    </div>
  );
}
