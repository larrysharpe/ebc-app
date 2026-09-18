'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import { formatMinistryScopeLabels } from '@/modules/auth/utils/ministry-scope.utils';
import { AddRoleButton } from '@/modules/members/features/member-directory';
import {
  MEMBERSHIP_STATUSES,
  type DirectoryPerson,
} from '@/modules/members/types';
import type { PersonMinistryAffiliation } from '@/modules/members/utils/person-ministry.utils';
import { canHaveAppAccess } from '@/modules/members/utils/person-minor.utils';
import { PERSON_ROLE_LABELS } from '@/modules/ministries';

export type PersonAccessPanelProps = {
  person: DirectoryPerson;
  affiliations: PersonMinistryAffiliation[];
  canManage?: boolean;
};

export function PersonAccessPanel({
  person,
  affiliations,
  canManage = false,
}: PersonAccessPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const appRoleLabels = person.roles
    .map((role) => ROLE_LABELS[role])
    .filter(Boolean);
  const scopeLabel = formatMinistryScopeLabels(person.ministryIds);
  const canAddRoles = canManage && canHaveAppAccess(person);

  return (
    <section className="ebc-card space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Roles &amp; ministries
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          App login roles and ministry team placements for this person.
        </p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Membership
          </h4>
          <p className="mt-2 text-sm text-slate-900">
            {MEMBERSHIP_STATUSES[person.membershipStatus]}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              App roles
            </h4>
            {canAddRoles ? (
              <AddRoleButton
                person={person}
                onError={setError}
                onSuccess={setOkMessage}
              />
            ) : null}
          </div>
          {appRoleLabels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {appRoleLabels.map((label) => (
                <span
                  key={label}
                  className="rounded bg-ebc-burgundy/10 px-2 py-0.5 text-xs text-ebc-burgundy"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              {person.email
                ? 'No app roles yet.'
                : 'Add an email before assigning app roles.'}
            </p>
          )}
          {scopeLabel ? (
            <p className="mt-2 text-xs text-slate-500">
              Ministry leader scope: {scopeLabel}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Ministry teams
        </h4>
        {affiliations.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            Not listed on any ministry roster yet. Add them from a ministry&apos;s Roster
            tab.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {affiliations.map((row) => (
              <li
                key={`${row.ministryId}-${row.personnelId}`}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
              >
                <div>
                  <Link
                    href={`/ministries/${row.slug}?tab=personnel`}
                    className="font-medium text-ebc-burgundy hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {PERSON_ROLE_LABELS[row.rosterRole]}
                    {row.title ? ` · ${row.title}` : ''}
                  </p>
                </div>
                <Link
                  href={`/ministries/${row.slug}`}
                  className="text-xs font-medium text-slate-600 hover:underline"
                >
                  Open ministry
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
