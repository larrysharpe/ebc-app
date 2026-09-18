'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { SortableTh } from '@/components/ui/SortableTh';
import { useSortableRows } from '@/hooks/use-sortable-rows';
import { loginAsUserAction } from '@/modules/auth/actions/login-as.actions';
import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import { formatMinistryScopeLabels } from '@/modules/auth/utils/ministry-scope.utils';
import {
  formatChoirScopeLabels,
  type ChoirScopeOption,
} from '@/modules/auth/utils/choir-scope.utils';
import type { AdminUser } from '@/modules/auth/types/user-admin.types';
import type { UserRole } from '@/modules/auth/types/auth.types';
import { isSuperAdmin } from '@/modules/auth/utils/roles.utils';
import { canManageTargetUser } from '@/modules/auth/utils/user-admin.utils';
import { UserForm } from './UserForm';

type UserSortKey = 'name' | 'email' | 'roles' | 'ministries' | 'choirs' | 'status';

export type UserManagementProps = {
  users: AdminUser[];
  assignableRoles: UserRole[];
  choirOptions: ChoirScopeOption[];
  actor: { id: string; roles: readonly UserRole[] };
};

type EditorState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; user: AdminUser };

function formatRoleList(roles: readonly UserRole[]): string {
  return roles.map((role) => ROLE_LABELS[role]).join(', ');
}

export function UserManagement({
  users,
  assignableRoles,
  choirOptions,
  actor,
}: UserManagementProps) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });
  const [loginAsError, setLoginAsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canLoginAs = isSuperAdmin(actor.roles);

  const getSortValue = useCallback((user: AdminUser, key: UserSortKey) => {
    switch (key) {
      case 'name':
        return user.name;
      case 'email':
        return user.email;
      case 'roles':
        return formatRoleList(user.roles);
      case 'ministries':
        return formatMinistryScopeLabels(user.ministryIds);
      case 'choirs':
        return formatChoirScopeLabels(user.choirIds, choirOptions);
      case 'status':
        return user.status;
      default:
        return '';
    }
  }, [choirOptions]);

  const { sortedRows, sort, onSort } = useSortableRows<AdminUser, UserSortKey>(
    users,
    getSortValue,
    { key: 'name', direction: 'asc' },
  );

  function handleLoginAs(user: AdminUser) {
    setLoginAsError(null);
    startTransition(async () => {
      const confirmed = await confirm({
        title: `Log in as ${user.name}?`,
        description:
          'You’ll see the app with their access. Use “Return to my account” in the header when you’re done.',
        confirmLabel: 'Log in as user',
      });
      if (!confirmed) return;

      const result = await loginAsUserAction({ userId: user.id });
      if (!result.ok) {
        setLoginAsError(result.error);
        return;
      }
      router.push('/');
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ebc-burgundy">Staff accounts</h2>
          <p className="mt-1 text-sm text-slate-600">
            Issue sign-in accounts and assign multiple roles per person — deacon, choir member,
            ministry leader, and more.
            {canLoginAs
              ? ' As Super Admin, you can also log in as any active user to verify their view.'
              : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditor({ mode: 'create' })}
          className="rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-medium text-white hover:bg-ebc-burgundy-dark"
        >
          Add account
        </button>
      </div>

      {loginAsError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loginAsError}
        </p>
      ) : null}

      {editor.mode === 'create' ? (
        <UserForm
          assignableRoles={assignableRoles}
          choirOptions={choirOptions}
          onCancel={() => setEditor({ mode: 'closed' })}
          onSaved={() => setEditor({ mode: 'closed' })}
        />
      ) : null}

      {editor.mode === 'edit' ? (
        <UserForm
          initial={editor.user}
          assignableRoles={assignableRoles}
          choirOptions={choirOptions}
          onCancel={() => setEditor({ mode: 'closed' })}
          onSaved={() => setEditor({ mode: 'closed' })}
        />
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs">
            <tr>
              <SortableTh label="Name" columnKey="name" sort={sort} onSort={onSort} />
              <SortableTh label="Email" columnKey="email" sort={sort} onSort={onSort} />
              <SortableTh label="Roles" columnKey="roles" sort={sort} onSort={onSort} />
              <SortableTh
                label="Ministries"
                columnKey="ministries"
                sort={sort}
                onSort={onSort}
                className="hidden md:table-cell"
              />
              <SortableTh
                label="Choirs"
                columnKey="choirs"
                sort={sort}
                onSort={onSort}
                className="hidden lg:table-cell"
              />
              <SortableTh label="Status" columnKey="status" sort={sort} onSort={onSort} />
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((user) => {
              const editable = canManageTargetUser(actor, user);
              const ministryNames = formatMinistryScopeLabels(user.ministryIds);
              const choirNames = formatChoirScopeLabels(user.choirIds, choirOptions);
              const showLoginAs =
                canLoginAs && user.status === 'active' && user.id !== actor.id;

              return (
                <tr key={user.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="rounded-full bg-ebc-gold/20 px-2.5 py-0.5 text-xs font-semibold text-ebc-burgundy-dark"
                        >
                          {ROLE_LABELS[role]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                    {ministryNames || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">
                    {choirNames || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                      {showLoginAs ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleLoginAs(user)}
                          className="text-sm font-medium text-ebc-burgundy hover:underline disabled:opacity-50"
                        >
                          Log in as
                        </button>
                      ) : null}
                      {editable ? (
                        <button
                          type="button"
                          onClick={() => setEditor({ mode: 'edit', user })}
                          className="text-sm font-medium text-ebc-burgundy hover:underline"
                        >
                          Edit
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
