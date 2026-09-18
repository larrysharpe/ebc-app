'use client';

import type { PlanSongSlotType } from '@/modules/music/types';
import { SLOT_TYPE_LABELS, STANDARD_SERVICE_SLOT_TYPES } from '@/modules/music/types';

export type DefaultServiceSlotsEditorProps = {
  value: PlanSongSlotType[];
  onChange: (slots: PlanSongSlotType[]) => void;
  disabled?: boolean;
};

export function DefaultServiceSlotsEditor({
  value,
  onChange,
  disabled = false,
}: DefaultServiceSlotsEditorProps) {
  function updateAt(index: number, slotType: PlanSongSlotType) {
    onChange(value.map((slot, i) => (i === index ? slotType : slot)));
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function move(index: number, delta: -1 | 1) {
    const next = index + delta;
    if (next < 0 || next >= value.length) return;
    const copy = [...value];
    const [item] = copy.splice(index, 1);
    if (!item) return;
    copy.splice(next, 0, item);
    onChange(copy);
  }

  function addSlot() {
    onChange([...value, 'worship']);
  }

  function resetTemplate() {
    onChange([...STANDARD_SERVICE_SLOT_TYPES]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-900">
        Default service slots
      </legend>
      <p className="text-sm text-slate-600">
        Used when a plan set list is empty and you choose “Add default service slots.”
        You can still add or remove slots on each plan.
      </p>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-sm text-slate-500">
          No slots in the template. Add one, or restore the chapel defaults.
        </p>
      ) : (
        <ol className="space-y-2">
          {value.map((slotType, index) => (
            <li
              key={`${slotType}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ebc-burgundy/10 text-xs font-bold text-ebc-burgundy">
                {index + 1}
              </span>
              <select
                value={slotType}
                disabled={disabled}
                onChange={(event) =>
                  updateAt(index, event.target.value as PlanSongSlotType)
                }
                className="min-w-[10rem] flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
              >
                {(Object.keys(SLOT_TYPE_LABELS) as PlanSongSlotType[]).map((type) => (
                  <option key={type} value={type}>
                    {SLOT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-white disabled:opacity-40"
                  aria-label={`Move slot ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={disabled || index === value.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-white disabled:opacity-40"
                  aria-label={`Move slot ${index + 1} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={disabled || value.length <= 1}
                  onClick={() => removeAt(index)}
                  className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={addSlot}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Add slot
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={resetTemplate}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Restore chapel defaults
        </button>
      </div>
    </fieldset>
  );
}
