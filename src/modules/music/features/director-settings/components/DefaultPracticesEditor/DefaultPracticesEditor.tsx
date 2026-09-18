'use client';

import { ChurchSpaceSelect } from '@/modules/facilities';
import {
  PRACTICE_WEEKDAY_LABELS,
  type DefaultPracticeTemplate,
  type PracticeWeekday,
} from '@/modules/music/types/director-settings.types';
import {
  createEmptyPracticeTemplate,
  formatPracticeRelativeLabel,
} from '@/modules/music/utils/director-settings.utils';

export type DefaultPracticesEditorProps = {
  value: DefaultPracticeTemplate[];
  onChange: (practices: DefaultPracticeTemplate[]) => void;
  disabled?: boolean;
};

const WEEKS_BEFORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function DefaultPracticesEditor({
  value,
  onChange,
  disabled = false,
}: DefaultPracticesEditorProps) {
  const weekdays = Object.keys(PRACTICE_WEEKDAY_LABELS).map(Number) as PracticeWeekday[];

  function updateAt(id: string, patch: Partial<DefaultPracticeTemplate>) {
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeAt(id: string) {
    if (value.length <= 1) return;
    onChange(value.filter((item) => item.id !== id));
  }

  function addPractice() {
    const last = value[value.length - 1];
    onChange([
      ...value,
      createEmptyPracticeTemplate({
        weekday: last?.weekday ?? 6,
        weeksBefore: Math.min(8, (last?.weeksBefore ?? 1) + 1),
        startTime: last?.startTime ?? '09:00',
        endTime: last?.endTime ?? '11:00',
        location: last?.location,
      }),
    ]);
  }

  return (
    <fieldset className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <legend className="text-sm font-semibold text-slate-900">
            Default practices
          </legend>
          <p className="mt-1 text-sm text-slate-600">
            Relative to the service date — e.g. Saturday before they sing, and two
            Saturdays before. New plans start with these rehearsals.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={addPractice}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Add practice
        </button>
      </div>

      <ul className="space-y-3">
        {value.map((practice, index) => (
          <li
            key={practice.id}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Practice {index + 1}
                </p>
                <p className="text-xs text-slate-600">
                  {formatPracticeRelativeLabel(practice.weekday, practice.weeksBefore)}
                </p>
              </div>
              <button
                type="button"
                disabled={disabled || value.length <= 1}
                onClick={() => removeAt(practice.id)}
                className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-40"
              >
                Remove
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className="text-xs font-medium text-slate-700">Weekday</span>
                <select
                  value={practice.weekday}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(practice.id, {
                      weekday: Number(event.target.value) as PracticeWeekday,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {weekdays.map((day) => (
                    <option key={day} value={day}>
                      {PRACTICE_WEEKDAY_LABELS[day]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block min-w-0">
                <span className="text-xs font-medium text-slate-700">
                  Which week before
                </span>
                <select
                  value={practice.weeksBefore}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(practice.id, {
                      weeksBefore: Number(event.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {WEEKS_BEFORE_OPTIONS.map((weeks) => (
                    <option key={weeks} value={weeks}>
                      {weeks === 1
                        ? '1 week before (e.g. Saturday before)'
                        : `${weeks} weeks before`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block min-w-0">
                <span className="text-xs font-medium text-slate-700">Start</span>
                <input
                  type="time"
                  value={practice.startTime}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(practice.id, { startTime: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <label className="block min-w-0">
                <span className="text-xs font-medium text-slate-700">End</span>
                <input
                  type="time"
                  value={practice.endTime}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(practice.id, { endTime: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>

              <ChurchSpaceSelect
                className="block min-w-0 sm:col-span-2"
                label="Location"
                optional
                disabled={disabled}
                value={practice.location ?? ''}
                onChange={({ location }) =>
                  updateAt(practice.id, {
                    location: location || undefined,
                  })
                }
                selectClassName="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
