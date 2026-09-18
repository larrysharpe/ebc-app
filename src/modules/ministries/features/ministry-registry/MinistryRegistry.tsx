import type { Ministry } from '@/modules/ministries/types';
import { MINISTRY_CATEGORIES, type MinistryCategory } from '@/modules/ministries/types';
import { groupMinistriesByCategory } from '@/modules/ministries/utils/ministry.utils';
import { MinistryCard } from './components/MinistryCard';

export type MinistryRegistryProps = {
  ministries: Ministry[];
  scopedToSingleMinistry?: boolean;
};

export function MinistryRegistry({ ministries, scopedToSingleMinistry = false }: MinistryRegistryProps) {
  const grouped = groupMinistriesByCategory(ministries);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-ebc-burgundy/20 bg-white p-5">
        <p className="text-sm text-slate-600">
          {scopedToSingleMinistry
            ? 'You can view and manage your assigned ministry — personnel, calendar, and SOPs.'
            : 'Manage ministry teams — personnel rosters, calendars, and standard operating procedures (SOPs). Add events, update rosters, and publish quality SOPs from each ministry page.'}
        </p>
      </section>

      {ministries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
          No ministries available for your account.
        </p>
      ) : null}

      {(Object.keys(MINISTRY_CATEGORIES) as MinistryCategory[]).map((category) => {
        const items = grouped[category];
        if (items.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="text-lg font-bold text-ebc-burgundy">
              {MINISTRY_CATEGORIES[category].label}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((ministry) => (
                <MinistryCard key={ministry.id} ministry={ministry} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
