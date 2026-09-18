'use client';

import { useCallback } from 'react';

import { SortableTh } from '@/components/ui/SortableTh';
import { useSortableRows } from '@/hooks/use-sortable-rows';
import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import {
  getAclPermissionRows,
  getAclRouteRows,
  MUSIC_HIERARCHY_OVERVIEW,
} from '@/modules/auth/data/acl-overview.constants';

type RouteSortKey = 'module' | 'roles';

export function AccessOverview() {
  const routes = getAclRouteRows();
  const permissions = getAclPermissionRows();

  const getSortValue = useCallback(
    (row: (typeof routes)[number], key: RouteSortKey) => {
      if (key === 'module') return row.label;
      return row.roles.map((role) => ROLE_LABELS[role]).join(' · ');
    },
    [],
  );

  const { sortedRows, sort, onSort } = useSortableRows<
    (typeof routes)[number],
    RouteSortKey
  >(routes, getSortValue, {
    key: 'module',
    direction: 'asc',
  });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl text-ebc-burgundy">Module access by role</h2>
        <p className="mt-1 text-sm text-slate-600">
          Which roles can open each area of the app. Super Admin and Administrator always have full
          access.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <SortableTh
                  label="Module"
                  columnKey="module"
                  sort={sort}
                  onSort={onSort}
                />
                <SortableTh
                  label="Roles with access"
                  columnKey="roles"
                  sort={sort}
                  onSort={onSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRows.map((row) => (
                <tr key={row.route}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.label}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.roles.map((role) => ROLE_LABELS[role]).join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-ebc-burgundy">Music ministry hierarchy</h2>
        <p className="mt-1 text-sm text-slate-600">
          Higher rank inherits permissions in that branch. Music Minister sits above both branches.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">Choir branch</h3>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {MUSIC_HIERARCHY_OVERVIEW.choir.map((role) => (
                <li key={role}>{ROLE_LABELS[role]}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold text-slate-900">Band branch</h3>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {MUSIC_HIERARCHY_OVERVIEW.band.map((role) => (
                <li key={role}>{ROLE_LABELS[role]}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl text-ebc-burgundy">Fine-grained permissions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enforced on server actions and sensitive routes within modules.
        </p>
        <ul className="mt-4 space-y-3">
          {permissions.map((row) => (
            <li
              key={row.permission}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <p className="font-medium text-slate-900">{row.label}</p>
              <p className="text-sm text-slate-600">{row.description}</p>
              <p className="mt-1 font-mono text-xs text-slate-400">{row.permission}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        <p className="font-semibold">Ministry leaders</p>
        <p className="mt-1 text-amber-900/90">
          Accounts with the Ministry Leader role are scoped to one ministry via their assignment.
          They can manage personnel, events, and SOPs for that ministry only.
        </p>
      </section>
    </div>
  );
}
