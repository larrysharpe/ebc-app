'use client';

import {
  ACTIVITY_KITCHEN_FIELD_LABELS,
  ACTIVITY_KITCHEN_FIELDS,
  type ActivityKitchenField,
} from '@/modules/events/constants/activity-request.constants';
import type { ActivityRequest } from '@/modules/events/types/activity-request.types';

export type ActivityKitchenStepProps = {
  value: ActivityRequest;
  onChange: (next: ActivityRequest) => void;
};

function hasAnyKitchenItem(
  kitchen: ActivityRequest['kitchen'],
): boolean {
  return ACTIVITY_KITCHEN_FIELDS.some((field) => kitchen[field]);
}

export function ActivityKitchenStep({
  value,
  onChange,
}: ActivityKitchenStepProps): React.JSX.Element {
  const kitchen = value.kitchen;
  const noneSelected = kitchen.noneConfirmed && !kitchen.needed;

  function setKitchen(
    partial: Partial<ActivityRequest['kitchen']>,
  ): void {
    onChange({ ...value, kitchen: { ...kitchen, ...partial } });
  }

  function selectNoKitchenNeeded(): void {
    setKitchen({
      needed: false,
      noneConfirmed: true,
      heatingCooking: false,
      utensils: false,
      plates: false,
      cupsGlasses: false,
      napkinsTableCloths: false,
      coffee: false,
      refrigeration: false,
      freezer: false,
    });
  }

  function toggleField(field: ActivityKitchenField, checked: boolean): void {
    const next = {
      ...kitchen,
      [field]: checked,
      noneConfirmed: false,
    };
    const anySelected = ACTIVITY_KITCHEN_FIELDS.some((key) =>
      key === field ? checked : next[key],
    );
    setKitchen({
      ...next,
      needed: anySelected,
      noneConfirmed: false,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ebc-burgundy">
          Kitchen &amp; food checklist
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Look through the list carefully so nothing is overlooked. Check what
          you need, or choose No kitchen / food needed. Quantities can be
          finalized with the office later.
        </p>
      </div>

      <div className="grid gap-3">
        {ACTIVITY_KITCHEN_FIELDS.map((field) => {
          const selected = kitchen[field] && !noneSelected;
          return (
            <label
              key={field}
              className={`ebc-choice min-h-11 ${
                selected ? 'ebc-choice-selected' : 'ebc-choice-idle'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => toggleField(field, e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-slate-300"
              />
              <span className="text-sm font-medium">
                {ACTIVITY_KITCHEN_FIELD_LABELS[field]}
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={selectNoKitchenNeeded}
        className={`ebc-choice min-h-11 w-full text-left ${
          noneSelected ? 'ebc-choice-selected' : 'ebc-choice-idle'
        }`}
      >
        <span className="block text-sm font-medium">
          No kitchen / food needed
        </span>
        <span className="mt-0.5 block text-xs font-normal text-slate-500">
          I looked through the list and we do not need kitchen or food setup
        </span>
      </button>

      {kitchen.needed && hasAnyKitchenItem(kitchen) ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Specialty items / notes (optional)
          </span>
          <textarea
            value={kitchen.notes ?? ''}
            onChange={(e) => setKitchen({ notes: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            placeholder="Anything else the kitchen or office should know"
          />
        </label>
      ) : null}
    </div>
  );
}
