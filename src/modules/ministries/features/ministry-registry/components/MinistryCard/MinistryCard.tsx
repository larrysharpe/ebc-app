import Link from 'next/link';

import type { Ministry } from '@/modules/ministries/types';
import { MINISTRY_CATEGORIES } from '@/modules/ministries/types';
import { getPrimaryLeaderName } from '@/modules/ministries/utils/ministry.utils';

export type MinistryCardProps = {
  ministry: Ministry;
};

export function MinistryCard({ ministry }: MinistryCardProps) {
  const category = MINISTRY_CATEGORIES[ministry.category];
  const leader = getPrimaryLeaderName(ministry);

  return (
    <Link
      href={`/ministries/${ministry.slug}`}
      className="ebc-card block transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ebc-section-label">{category.label}</p>
          <h3 className="mt-1 text-lg font-bold text-ebc-burgundy">{ministry.name}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {ministry.personnel.length} people
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-600">{ministry.description}</p>
      {leader ? (
        <p className="mt-3 text-sm text-slate-500">
          Lead: <span className="font-medium text-slate-700">{leader}</span>
        </p>
      ) : null}
      {ministry.meetingSummary ? (
        <p className="mt-1 text-xs text-ebc-navy">{ministry.meetingSummary}</p>
      ) : null}
    </Link>
  );
}
