import Link from 'next/link';

import type { AttentionItem } from '@/modules/dashboard/types/dashboard.types';

import { CollapsibleHomeSection } from './CollapsibleHomeSection';

type NeedsAttentionSectionProps = {
  items: AttentionItem[];
};

export function NeedsAttentionSection({ items }: NeedsAttentionSectionProps) {
  return (
    <CollapsibleHomeSection
      id="needs-attention"
      label="Priorities"
      title="Needs my attention"
      count={items.length}
      defaultOpen={items.length > 0}
    >
      {items.length === 0 ? (
        <p className="text-base text-slate-600">
          You&apos;re all caught up — nothing urgent for your roles right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`ebc-action-quiet !justify-start !text-left ${
                  item.tone === 'urgent'
                    ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
                    : ''
                }`}
              >
                <span className="block w-full">
                  <span className="block font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-1 block text-sm font-normal text-slate-600">
                    {item.detail}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleHomeSection>
  );
}
