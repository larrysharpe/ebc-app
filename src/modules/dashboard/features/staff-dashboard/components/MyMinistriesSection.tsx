import Link from 'next/link';

import type { HomeMinistryCard } from '@/modules/dashboard/types/dashboard.types';

import { CollapsibleHomeSection } from './CollapsibleHomeSection';

type MyMinistriesSectionProps = {
  ministries: HomeMinistryCard[];
};

export function MyMinistriesSection({ ministries }: MyMinistriesSectionProps) {
  return (
    <CollapsibleHomeSection
      id="my-ministries"
      label="Your teams"
      title="My ministries"
      count={ministries.length}
      defaultOpen
    >
      {ministries.length === 0 ? (
        <p className="text-base text-slate-600">
          No ministries are assigned to your account yet. Church life tools below are
          still available to everyone.
        </p>
      ) : (
        <ul className="space-y-3">
          {ministries.map((ministry) => (
            <li key={ministry.id}>
              <Link
                href={ministry.href}
                className="ebc-action-quiet !justify-start !text-left"
              >
                <span className="block w-full">
                  <span className="block font-semibold text-slate-900">
                    {ministry.name}
                  </span>
                  <span className="mt-1 block text-sm font-normal text-slate-600 line-clamp-2">
                    {ministry.description}
                  </span>
                  {ministry.meta ? (
                    <span className="mt-2 block text-sm font-medium text-ebc-burgundy">
                      {ministry.meta}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleHomeSection>
  );
}
