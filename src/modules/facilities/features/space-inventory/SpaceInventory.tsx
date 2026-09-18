'use client';

import { useMemo, useState, useTransition, type ReactElement } from 'react';

import { updateChurchSpaceAction } from '@/modules/facilities/actions/church-space.actions';
import {
  CHURCH_FLOOR_LABELS,
  CHURCH_FLOORS,
} from '@/modules/facilities/constants/church-space.constants';
import type { ChurchSpace } from '@/modules/facilities/types/church-space.types';
import { groupSpacesByFloor } from '@/modules/facilities/utils/church-space.utils';

export type SpaceInventoryProps = {
  spaces: ChurchSpace[];
};

export function SpaceInventory({ spaces: initialSpaces }: SpaceInventoryProps): ReactElement {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const grouped = useMemo(() => groupSpacesByFloor(spaces), [spaces]);

  function patchSpace(id: string, patch: Partial<ChurchSpace>): void {
    setSpaces((current) =>
      current.map((space) => (space.id === id ? { ...space, ...patch } : space)),
    );
  }

  function saveSpace(
    id: string,
    input: { capacity?: number | null; notes?: string | null; active?: boolean },
  ): void {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const result = await updateChurchSpaceAction(id, input);
      setPendingId(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      patchSpace(id, result.space);
    });
  }

  if (spaces.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        No church spaces yet. Run database seed to load the campus catalog.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {CHURCH_FLOORS.map((floor) => {
        const floorSpaces = grouped[floor];
        if (floorSpaces.length === 0) return null;

        return (
          <section key={floor} className="space-y-3">
            <h2 className="text-lg font-bold text-ebc-burgundy">
              {CHURCH_FLOOR_LABELS[floor]}
            </h2>
            <ul className="space-y-3">
              {floorSpaces.map((space) => {
                const busy = isPending && pendingId === space.id;
                return (
                  <li
                    key={space.id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{space.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {space.active ? 'Available for booking forms' : 'Hidden from forms'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => saveSpace(space.id, { active: !space.active })}
                        className="ebc-choice min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
                      >
                        {space.active ? 'Hide from forms' : 'Show on forms'}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-medium text-slate-700">Capacity</span>
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          defaultValue={space.capacity ?? ''}
                          disabled={busy}
                          onBlur={(event) => {
                            const raw = event.target.value.trim();
                            const next = raw === '' ? null : Number(raw);
                            if (next !== null && Number.isNaN(next)) return;
                            if ((space.capacity ?? null) === next) return;
                            saveSpace(space.id, { capacity: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          placeholder="Optional"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-slate-700">Setup notes</span>
                        <textarea
                          rows={2}
                          defaultValue={space.notes ?? ''}
                          disabled={busy}
                          onBlur={(event) => {
                            const next = event.target.value.trim() || null;
                            if ((space.notes ?? null) === next) return;
                            saveSpace(space.id, { notes: next });
                          }}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          placeholder="AV, tables, key access…"
                        />
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
