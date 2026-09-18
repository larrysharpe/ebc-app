'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  applyPlanSetListSuggestionsAction,
  suggestPlanSetListAction,
} from '@/modules/music/actions/music.actions';
import type { ServiceMusicPlan, Song } from '@/modules/music/types';
import { SLOT_TYPE_LABELS } from '@/modules/music/types';
import type { SetListSuggestion } from '@/modules/music/utils/set-list-suggest.utils';

export type PlanSetListSuggestProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
  onPlanChange: (plan: ServiceMusicPlan) => void;
  onError: (message: string | null) => void;
  /** Tighter header for mobile set-list flow. */
  compact?: boolean;
};

export function PlanSetListSuggest({
  plan,
  songs,
  onPlanChange,
  onError,
  compact = false,
}: PlanSetListSuggestProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<SetListSuggestion | null>(null);
  const [onlyEmpty, setOnlyEmpty] = useState(true);

  const songById = new Map(songs.map((song) => [song.id, song]));
  const slotById = new Map(plan.songs.map((slot) => [slot.id, slot]));
  const occasion =
    plan.occasion?.trim() || plan.title.trim() || 'this service';

  function handleSuggest() {
    onError(null);
    startTransition(async () => {
      const result = await suggestPlanSetListAction(plan.id);
      if (!result.ok) {
        onError(result.error);
        setSuggestion(null);
        return;
      }
      setSuggestion(result.suggestion);
    });
  }

  function handleApply() {
    if (!suggestion) return;
    const slots = suggestion.slots
      .filter((item): item is { slotId: string; songId: string; reason: string } =>
        Boolean(item.songId),
      )
      .map((item) => ({ slotId: item.slotId, songId: item.songId }));

    if (slots.length === 0) {
      onError('No songs to apply from this suggestion.');
      return;
    }

    onError(null);
    startTransition(async () => {
      const result = await applyPlanSetListSuggestionsAction({
        planId: plan.id,
        slots,
        onlyEmpty,
      });
      if (!result.ok) {
        onError(result.error);
        return;
      }
      onPlanChange(result.plan);
      setSuggestion(null);
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50/80 ${
        compact ? 'px-3 py-2.5' : 'px-4 py-3'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            {compact ? 'AI suggest' : 'AI song suggestions'}
          </p>
          {compact ? null : (
            <p className="mt-0.5 text-xs text-slate-600">
              Based on <span className="font-medium">{occasion}</span> and recent song
              usage from sent plans.
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={isPending || plan.songs.length === 0}
          onClick={handleSuggest}
          className="shrink-0 rounded-lg bg-ebc-burgundy px-3 py-1.5 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
        >
          {isPending && !suggestion
            ? 'Suggesting…'
            : suggestion
              ? 'Again'
              : compact
                ? 'Suggest'
                : 'Suggest songs'}
        </button>
      </div>

      {suggestion ? (
        <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Why this set
            </p>
            <p className="mt-1 text-sm text-slate-800">{suggestion.summary}</p>
          </div>

          <ul className={`space-y-2 ${compact ? 'max-h-48 overflow-y-auto' : ''}`}>
            {suggestion.slots.map((item) => {
              const slot = slotById.get(item.slotId);
              const song = item.songId ? songById.get(item.songId) : undefined;
              return (
                <li
                  key={item.slotId}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {slot
                      ? SLOT_TYPE_LABELS[slot.slotType]
                      : 'Slot'}
                  </p>
                  <p className="mt-0.5 font-medium text-slate-900">
                    {song?.title ?? (item.songId ? 'Unknown song' : 'Leave empty')}
                    {song?.artist ? (
                      <span className="font-normal text-slate-600">
                        {' '}
                        · {song.artist}
                      </span>
                    ) : null}
                  </p>
                  {compact ? null : (
                    <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={onlyEmpty}
                disabled={isPending}
                onChange={(event) => setOnlyEmpty(event.target.checked)}
                className="rounded border-slate-300"
              />
              Only fill empty slots
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setSuggestion(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Dismiss
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleApply}
                className="rounded-lg bg-ebc-green px-3 py-1.5 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
              >
                {isPending ? 'Applying…' : 'Apply suggestions'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
