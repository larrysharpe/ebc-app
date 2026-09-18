'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { saveUserAction } from '@/modules/auth/actions/user-admin.actions';
import { MINISTRY_SCOPES } from '@/modules/auth/constants/ministry-scope.constants';
import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import type { ChoirScopeOption } from '@/modules/auth/utils/choir-scope.utils';
import type { AdminUser } from '@/modules/auth/types/user-admin.types';
import type { UserRole, UserStatus } from '@/modules/auth/types/auth.types';

export type UserFormProps = {
  initial?: AdminUser;
  assignableRoles: UserRole[];
  choirOptions: ChoirScopeOption[];
  onCancel: () => void;
  onSaved?: () => void;
};

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function UserForm({
  initial,
  assignableRoles,
  choirOptions,
  onCancel,
  onSaved,
}: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(
    initial?.roles ? [...initial.roles] : [assignableRoles[0] ?? 'volunteer'],
  );
  const [ministryIds, setMinistryIds] = useState<string[]>(
    initial?.ministryIds ? [...initial.ministryIds] : [],
  );
  const [choirIds, setChoirIds] = useState<string[]>(
    initial?.choirIds ? [...initial.choirIds] : [],
  );

  const showMinistryPicker = roles.includes('ministry_leader');
  const showChoirPicker = roles.includes('choir_director');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    const payload = {
      ...(initial ? { id: initial.id } : {}),
      email: String(formData.get('email') ?? ''),
      name: String(formData.get('name') ?? ''),
      roles,
      status: String(formData.get('status') ?? 'active') as UserStatus,
      ministryIds: showMinistryPicker ? ministryIds : [],
      choirIds: showChoirPicker ? choirIds : [],
      password: String(formData.get('password') ?? '') || undefined,
    };

    startTransition(async () => {
      const result = await saveUserAction(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved?.();
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-display text-lg text-ebc-burgundy">
        {initial ? 'Edit staff account' : 'New staff account'}
      </h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Full name</span>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Church email</span>
          <input
            name="email"
            type="email"
            required
            readOnly={Boolean(initial)}
            defaultValue={initial?.email}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm read-only:bg-slate-50"
          />
        </label>

        <fieldset className="block sm:col-span-2">
          <legend className="text-sm font-medium text-slate-700">Roles</legend>
          <p className="mt-1 text-xs text-slate-500">
            Select every hat this person wears — e.g. Deacon, Choir Member, and JAMM Leader.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {assignableRoles.map((option) => (
              <label
                key={option}
                className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={roles.includes(option)}
                  onChange={() => setRoles((current) => toggleValue(current, option))}
                />
                {ROLE_LABELS[option]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            name="status"
            defaultValue={initial?.status ?? 'active'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>

        {showMinistryPicker ? (
          <fieldset className="block sm:col-span-2">
            <legend className="text-sm font-medium text-slate-700">Assigned ministries</legend>
            <p className="mt-1 text-xs text-slate-500">
              Required for ministry leaders. Select every ministry they lead.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MINISTRY_SCOPES.map((ministry) => (
                <label
                  key={ministry.id}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={ministryIds.includes(ministry.id)}
                    onChange={() =>
                      setMinistryIds((current) => toggleValue(current, ministry.id))
                    }
                  />
                  {ministry.name}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {showChoirPicker ? (
          <fieldset className="block sm:col-span-2">
            <legend className="text-sm font-medium text-slate-700">Assigned choirs</legend>
            <p className="mt-1 text-xs text-slate-500">
              Required for choir directors. They only finish and edit plans for these choirs.
            </p>
            {choirOptions.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                No choirs set up yet. Add choirs under Music → Choir setup first.
              </p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {choirOptions.map((choir) => (
                  <label
                    key={choir.id}
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={choirIds.includes(choir.id)}
                      onChange={() =>
                        setChoirIds((current) => toggleValue(current, choir.id))
                      }
                    />
                    {choir.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ) : null}

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            {initial ? 'New password (leave blank to keep)' : 'Temporary password'}
          </span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required={!initial}
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="ebc-action-primary disabled:opacity-60"
        >
          {isPending ? 'Saving…' : initial ? 'Save changes' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="ebc-action-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
