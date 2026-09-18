'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
import { switchDevAccountAction } from '@/modules/auth/features/dev-account-switcher/dev-account-switcher.actions';
import type { DevAccountOption } from '@/modules/auth/types/dev-auth.types';
import { formatMinistryScopeLabels } from '@/modules/auth/utils/ministry-scope.utils';

export type DevAccountSwitcherProps = {
  accounts: DevAccountOption[];
  currentEmail?: string;
  returnPath?: string;
  variant?: 'floating' | 'panel';
};

function roleSummary(account: DevAccountOption): string {
  const labels = account.roles.map((role) => ROLE_LABELS[role]);
  const ministries = formatMinistryScopeLabels(account.ministryIds);
  if (ministries) {
    return `${labels.join(', ')} · ${ministries}`;
  }
  return labels.join(', ');
}

export function DevAccountSwitcher({
  accounts,
  currentEmail,
  returnPath,
  variant = 'floating',
}: DevAccountSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return accounts;
    return accounts.filter(
      (account) =>
        account.email.toLowerCase().includes(needle) ||
        account.name.toLowerCase().includes(needle) ||
        account.group.toLowerCase().includes(needle) ||
        account.roles.some((role) => ROLE_LABELS[role].toLowerCase().includes(needle)),
    );
  }, [accounts, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, DevAccountOption[]>();
    for (const account of filtered) {
      const list = map.get(account.group) ?? [];
      list.push(account);
      map.set(account.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

  function handleSwitch(email: string): void {
    setError(null);
    startTransition(async () => {
      const result = await switchDevAccountAction({
        email,
        returnPath,
        stayOnPage: variant === 'floating',
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  if (accounts.length === 0) return null;

  const shellClass =
    variant === 'panel'
      ? 'rounded-xl border border-amber-300 bg-amber-50'
      : 'fixed bottom-4 right-4 z-50 flex max-w-sm flex-col items-end';

  return (
    <div className={shellClass}>
      {variant === 'floating' ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-full border border-amber-400 bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-950 shadow-md hover:bg-amber-200"
          aria-expanded={open}
        >
          Dev · switch user
        </button>
      ) : (
        <div className="border-b border-amber-200 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">Dev accounts</p>
          <p className="mt-1 text-sm text-amber-950">
            Switch to any seed or database user without a password. Local
            development only.
          </p>
        </div>
      )}

      {(open || variant === 'panel') && (
        <div
          className={
            variant === 'panel'
              ? 'max-h-96 overflow-hidden'
              : 'mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-amber-300 bg-white shadow-xl'
          }
        >
          <div className="border-b border-slate-200 p-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, role…"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {grouped.map(([group, groupAccounts]) => (
              <div key={group} className="mb-3 last:mb-0">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group}
                </p>
                <ul className="space-y-1">
                  {groupAccounts.map((account) => {
                    const isCurrent = account.email === currentEmail;
                    return (
                      <li key={account.email}>
                        <button
                          type="button"
                          disabled={isPending || isCurrent}
                          onClick={() => handleSwitch(account.email)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                            isCurrent
                              ? 'bg-ebc-burgundy/10 text-ebc-burgundy'
                              : 'hover:bg-slate-50 disabled:opacity-60'
                          }`}
                        >
                          <p className="font-medium text-slate-900">{account.name}</p>
                          <p className="text-xs text-slate-500">{account.email}</p>
                          <p className="mt-1 text-xs text-slate-600">{roleSummary(account)}</p>
                          {isCurrent ? (
                            <p className="mt-1 text-xs font-semibold text-ebc-burgundy">Signed in</p>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {error ? (
            <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
