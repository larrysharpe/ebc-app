'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { MINISTRY_TABS } from '@/modules/ministries/constants/ministry.constants';
import type { MinistryTab } from '@/modules/ministries/types';

export type MinistryTabNavProps = {
  slug: string;
};

export function MinistryTabNav({ slug }: MinistryTabNavProps) {
  const searchParams = useSearchParams();
  const active = (searchParams.get('tab') as MinistryTab | null) ?? 'calendar';

  return (
    <nav
      className="ml-auto flex min-w-0 flex-wrap items-end justify-end gap-1"
      aria-label="Ministry sections"
    >
      {MINISTRY_TABS.map((tab) => {
        const isActive = active === tab.id;
        const href =
          tab.id === 'calendar'
            ? `/ministries/${slug}`
            : `/ministries/${slug}?tab=${tab.id}`;

        return (
          <Link
            key={tab.id}
            href={href}
            className={`rounded-t-lg px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 ${
              isActive
                ? 'border-b-2 border-ebc-burgundy bg-ebc-burgundy/5 text-ebc-burgundy'
                : 'border-b-2 border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
