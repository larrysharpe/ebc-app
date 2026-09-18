'use client';

import {
  ACTIVITY_FLOOR_PLAN_FIELD_LABELS,
  ACTIVITY_FLOOR_PLAN_FIELD_UNITS,
  ACTIVITY_FLOOR_PLAN_FIELDS,
  ACTIVITY_FLOOR_PLAN_QTY_MAX,
  type ActivityFloorPlanField,
} from '@/modules/events/constants/activity-request.constants';
import type { ActivityRequest } from '@/modules/events/types/activity-request.types';

export type ActivityFloorPlanStepProps = {
  value: ActivityRequest;
  onChange: (next: ActivityRequest) => void;
};

function qtyOf(
  floorPlan: ActivityRequest['floorPlan'],
  field: ActivityFloorPlanField,
): number {
  const raw = floorPlan[field];
  if (typeof raw === 'number') return raw;
  return raw ? 1 : 0;
}

function hasAnyFloorPlanItem(
  floorPlan: ActivityRequest['floorPlan'],
): boolean {
  return ACTIVITY_FLOOR_PLAN_FIELDS.some((field) => qtyOf(floorPlan, field) > 0);
}

function clampQty(field: ActivityFloorPlanField, value: number): number {
  const max =
    ACTIVITY_FLOOR_PLAN_FIELD_UNITS[field] === null
      ? 1
      : ACTIVITY_FLOOR_PLAN_QTY_MAX;
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value)));
}

export function ActivityFloorPlanStep({
  value,
  onChange,
}: ActivityFloorPlanStepProps): React.JSX.Element {
  const floorPlan = value.floorPlan;
  const noneSelected = floorPlan.noneConfirmed && !floorPlan.needed;

  function setFloorPlan(
    partial: Partial<ActivityRequest['floorPlan']>,
  ): void {
    onChange({ ...value, floorPlan: { ...floorPlan, ...partial } });
  }

  function selectNoFloorPlanNeeded(): void {
    setFloorPlan({
      needed: false,
      noneConfirmed: true,
      theaterSeating: 0,
      roundTables: 0,
      classroomSeating: 0,
      podium: 0,
      registrationTable: 0,
      servingTables: 0,
      clearFloor: 0,
      accessibilitySeating: 0,
    });
  }

  function setFieldQty(field: ActivityFloorPlanField, qty: number): void {
    const nextQty = clampQty(field, qty);
    const next = {
      ...floorPlan,
      [field]: nextQty,
      noneConfirmed: false,
    };
    const anySelected = ACTIVITY_FLOOR_PLAN_FIELDS.some((key) =>
      key === field ? nextQty > 0 : qtyOf(next, key) > 0,
    );
    setFloorPlan({
      ...next,
      needed: anySelected,
      noneConfirmed: false,
    });
  }

  function toggleField(field: ActivityFloorPlanField, checked: boolean): void {
    if (!checked) {
      setFieldQty(field, 0);
      return;
    }
    const unit = ACTIVITY_FLOOR_PLAN_FIELD_UNITS[field];
    setFieldQty(field, unit === null ? 1 : Math.max(1, qtyOf(floorPlan, field)));
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ebc-burgundy">
          Floor plan / room setup
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          You do not need to draw a layout. Check what you need and set how
          many — or choose No floor plan needed.
        </p>
      </div>

      <div className="grid gap-3">
        {ACTIVITY_FLOOR_PLAN_FIELDS.map((field) => {
          const qty = noneSelected ? 0 : qtyOf(floorPlan, field);
          const selected = qty > 0;
          const unit = ACTIVITY_FLOOR_PLAN_FIELD_UNITS[field];

          return (
            <div
              key={field}
              className={`rounded-xl border px-3 py-3 ${
                selected
                  ? 'border-ebc-burgundy bg-ebc-burgundy/5'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <label className="ebc-choice border-0 bg-transparent p-0 shadow-none">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => toggleField(field, e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-900">
                  {ACTIVITY_FLOOR_PLAN_FIELD_LABELS[field]}
                </span>
              </label>

              {selected && unit ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 pl-7">
                  <span className="text-sm text-slate-600">How many?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Fewer ${unit}`}
                      disabled={qty <= 1}
                      onClick={() => setFieldQty(field, qty - 1)}
                      className="ebc-choice min-h-11 min-w-11 justify-center rounded-lg border border-slate-300 bg-white px-0 text-base font-semibold text-slate-800 disabled:opacity-40"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={ACTIVITY_FLOOR_PLAN_QTY_MAX}
                      value={qty}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') return;
                        setFieldQty(field, Number(raw));
                      }}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-2.5 text-center text-base"
                      aria-label={`${ACTIVITY_FLOOR_PLAN_FIELD_LABELS[field]} quantity`}
                    />
                    <button
                      type="button"
                      aria-label={`More ${unit}`}
                      disabled={qty >= ACTIVITY_FLOOR_PLAN_QTY_MAX}
                      onClick={() => setFieldQty(field, qty + 1)}
                      className="ebc-choice min-h-11 min-w-11 justify-center rounded-lg border border-slate-300 bg-white px-0 text-base font-semibold text-slate-800 disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="text-sm text-slate-600">{unit}</span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={selectNoFloorPlanNeeded}
        className={`ebc-choice min-h-11 w-full text-left ${
          noneSelected ? 'ebc-choice-selected' : 'ebc-choice-idle'
        }`}
      >
        <span className="block text-sm font-medium">No floor plan needed</span>
        <span className="mt-0.5 block text-xs font-normal text-slate-500">
          I looked through the list and we do not need a special room setup
        </span>
      </button>

      {floorPlan.needed && hasAnyFloorPlanItem(floorPlan) ? (
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Setup notes (optional)
          </span>
          <textarea
            value={floorPlan.notes ?? ''}
            onChange={(e) => setFloorPlan({ notes: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            placeholder="Anything else about how the room should be set up"
          />
        </label>
      ) : null}
    </div>
  );
}
