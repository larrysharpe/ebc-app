'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { SortableTh } from '@/components/ui/SortableTh';
import { useToast } from '@/components/ui/Toast';
import { useSortableRows } from '@/hooks/use-sortable-rows';
import {
  addMinistryDutyAction,
  removeMinistryDutyAction,
  updateMinistryDutyAction,
} from '@/modules/ministries/actions/ministry.actions';
import {
  DUTY_NEEDED_COUNT_MAX,
  DUTY_NEEDED_COUNT_MIN,
} from '@/modules/ministries/constants/ministry.constants';
import type { Ministry, MinistryDutyDefinition } from '@/modules/ministries/types';
import {
  dutyIdsInUse,
  findDutySopTitle,
} from '@/modules/ministries/utils/ministry-personnel.utils';

type DutySortKey = 'label' | 'email' | 'sop' | 'needed' | 'assigned' | 'status';

export type DutiesPanelProps = {
  ministry: Ministry;
  canManage?: boolean;
};

type DutyFormState = {
  id?: string;
  label: string;
  description: string;
  email: string;
  sopId: string;
  neededCount: number;
  active: boolean;
};

const EMPTY_FORM: DutyFormState = {
  label: '',
  description: '',
  email: '',
  sopId: '',
  neededCount: DUTY_NEEDED_COUNT_MIN,
  active: true,
};

export function DutiesPanel({ ministry, canManage = false }: DutiesPanelProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<DutyFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function openCreate() {
    setError(null);
    setNotice(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(duty: MinistryDutyDefinition) {
    setError(null);
    setNotice(null);
    setForm({
      id: duty.id,
      label: duty.label,
      description: duty.description ?? '',
      email: duty.email ?? '',
      sopId: duty.sopId ?? '',
      neededCount: duty.neededCount,
      active: duty.active,
    });
    setFormOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    startTransition(async () => {
      const result = form.id
        ? await updateMinistryDutyAction(ministry.slug, {
            id: form.id,
            label: form.label,
            description: form.description || undefined,
            email: form.email || undefined,
            sopId: form.sopId || undefined,
            neededCount: form.neededCount,
            active: form.active,
          })
        : await addMinistryDutyAction(ministry.slug, {
            label: form.label,
            description: form.description || undefined,
            email: form.email || undefined,
            sopId: form.sopId || undefined,
            neededCount: form.neededCount,
          });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setFormOpen(false);
      setForm(EMPTY_FORM);
      if (result.message) setNotice(result.message);
      router.refresh();
    });
  }

  async function handleRemove(duty: MinistryDutyDefinition): Promise<void> {
    const assigned = dutyIdsInUse(ministry.personnel, duty.id);
    const confirmed = await confirm({
      title:
        assigned > 0
          ? `Deactivate “${duty.label}”?`
          : `Remove “${duty.label}”?`,
      description:
        assigned > 0
          ? 'This duty is assigned on the roster. It will be deactivated instead of deleted.'
          : 'This removes the duty from this ministry’s duty list.',
      confirmLabel: assigned > 0 ? 'Deactivate' : 'Remove',
      tone: 'danger',
    });
    if (!confirmed) return;

    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await removeMinistryDutyAction(ministry.slug, { id: duty.id });
      if (!result.ok) {
        setError(result.error);
        toast({ title: 'Could not update duty', description: result.error, tone: 'error' });
        return;
      }
      if (result.message) setNotice(result.message);
      toast({
        title: assigned > 0 ? 'Duty deactivated' : 'Duty removed',
        tone: 'success',
      });
      router.refresh();
    });
  }

  const getSortValue = useCallback(
    (duty: MinistryDutyDefinition, key: DutySortKey) => {
      switch (key) {
        case 'label':
          return duty.label;
        case 'email':
          return duty.email ?? '';
        case 'sop':
          return findDutySopTitle(duty.sopId, ministry.sops) ?? '';
        case 'needed':
          return duty.neededCount;
        case 'assigned':
          return dutyIdsInUse(ministry.personnel, duty.id);
        case 'status':
          return duty.active ? 1 : 0;
        default:
          return '';
      }
    },
    [ministry.personnel, ministry.sops],
  );

  const { sortedRows: catalog, sort, onSort } = useSortableRows<
    MinistryDutyDefinition,
    DutySortKey
  >(ministry.dutyCatalog, getSortValue, { key: 'label', direction: 'asc' });

  const sopOptions = [...ministry.sops].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ebc-burgundy">Duty catalog</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Define duties for the{' '}
            <Link
              href={`/ministries/${ministry.slug}?tab=personnel`}
              className="font-medium text-ebc-navy hover:underline"
            >
              Roster
            </Link>{' '}
            roster. Each duty can have its own contact email and linked{' '}
            <Link
              href={`/ministries/${ministry.slug}?tab=sops`}
              className="font-medium text-ebc-navy hover:underline"
            >
              SOP
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
            {formOpen ? 'Cancel' : 'Add duty'}
          </button>
        ) : null}
      </div>

      {formOpen && canManage ? (
        <form onSubmit={handleSubmit} className="ebc-card grid gap-3 sm:grid-cols-2">
          <p className="sm:col-span-2 text-sm font-semibold text-slate-800">
            {form.id ? 'Edit duty' : 'Add duty'}
          </p>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Name *</span>
            <input
              required
              value={form.label}
              onChange={(event) =>
                setForm((current) => ({ ...current, label: event.target.value }))
              }
              placeholder="e.g. In-service slides"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              rows={2}
              placeholder="Optional notes for leaders assigning this duty"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Duty email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="Optional shared inbox for this duty"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">How many needed *</span>
            <input
              required
              type="number"
              inputMode="numeric"
              min={DUTY_NEEDED_COUNT_MIN}
              max={DUTY_NEEDED_COUNT_MAX}
              value={form.neededCount}
              onChange={(event) => {
                const next = Number.parseInt(event.target.value, 10);
                setForm((current) => ({
                  ...current,
                  neededCount: Number.isNaN(next) ? DUTY_NEEDED_COUNT_MIN : next,
                }));
              }}
              className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            />
            <p className="mt-1 text-xs text-slate-500">
              How many people should fill this duty on the roster.
            </p>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Linked SOP</span>
            <select
              value={form.sopId}
              onChange={(event) =>
                setForm((current) => ({ ...current, sopId: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select an SOP…</option>
              {sopOptions.map((sop) => (
                <option key={sop.id} value={sop.id}>
                  {sop.title}
                </option>
              ))}
            </select>
            {sopOptions.length === 0 ? (
              <p className="mt-1 text-xs text-slate-500">
                No SOPs yet — add one on the{' '}
                <Link
                  href={`/ministries/${ministry.slug}?tab=sops`}
                  className="font-medium text-ebc-navy hover:underline"
                >
                  SOPs
                </Link>{' '}
                tab.
              </p>
            ) : null}
          </label>
          {form.id ? (
            <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm((current) => ({ ...current, active: event.target.checked }))
                }
              />
              Active (available for new roster assignments)
            </label>
          ) : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
            >
              {isPending ? 'Saving…' : form.id ? 'Save changes' : 'Add duty'}
            </button>
          </div>
        </form>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {notice ? <p className="text-sm text-ebc-green-dark">{notice}</p> : null}

      {catalog.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No duties defined yet.
          {canManage ? ' Add duties here, then assign them on the Roster tab.' : ''}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <SortableTh label="Duty" columnKey="label" sort={sort} onSort={onSort} />
                <SortableTh
                  label="Email"
                  columnKey="email"
                  sort={sort}
                  onSort={onSort}
                  className="hidden md:table-cell"
                />
                <SortableTh
                  label="SOP"
                  columnKey="sop"
                  sort={sort}
                  onSort={onSort}
                  className="hidden lg:table-cell"
                />
                <SortableTh
                  label="Needed"
                  columnKey="needed"
                  sort={sort}
                  onSort={onSort}
                  className="hidden sm:table-cell"
                />
                <SortableTh
                  label="Assigned"
                  columnKey="assigned"
                  sort={sort}
                  onSort={onSort}
                  className="hidden sm:table-cell"
                />
                <SortableTh label="Status" columnKey="status" sort={sort} onSort={onSort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catalog.map((duty) => {
                const assigned = dutyIdsInUse(ministry.personnel, duty.id);
                const sopTitle = findDutySopTitle(duty.sopId, ministry.sops);
                return (
                  <tr key={duty.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{duty.label}</p>
                      {duty.description ? (
                        <p className="text-xs text-slate-500">{duty.description}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500 md:hidden">
                        {duty.email ?? 'No duty email'}
                      </p>
                      <p className="text-xs text-slate-500 lg:hidden">
                        {sopTitle ? (
                          <Link
                            href={`/ministries/${ministry.slug}?tab=sops`}
                            className="font-medium text-ebc-navy hover:underline"
                          >
                            {sopTitle}
                          </Link>
                        ) : (
                          <span className="text-amber-700">No SOP linked</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 sm:hidden">
                        {assigned} of {duty.neededCount} filled
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                      {duty.email ? (
                        <a
                          href={`mailto:${duty.email}`}
                          className="text-ebc-navy hover:underline"
                        >
                          {duty.email}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {sopTitle ? (
                        <Link
                          href={`/ministries/${ministry.slug}?tab=sops`}
                          className="font-medium text-ebc-navy hover:underline"
                        >
                          {sopTitle}
                        </Link>
                      ) : (
                        <span className="text-xs font-medium text-amber-700">
                          No SOP linked
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      {duty.neededCount}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-600 sm:table-cell">
                      {assigned}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                          duty.active
                            ? 'bg-ebc-green/10 text-ebc-green-dark'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {duty.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canManage ? (
                        <div className="flex justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => openEdit(duty)}
                            disabled={isPending}
                            className="text-xs font-medium text-ebc-navy hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleRemove(duty);
                            }}
                            disabled={isPending}
                            className="text-xs font-medium text-red-600 hover:text-red-800"
                          >
                            {assigned > 0 ? 'Deactivate' : 'Remove'}
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
