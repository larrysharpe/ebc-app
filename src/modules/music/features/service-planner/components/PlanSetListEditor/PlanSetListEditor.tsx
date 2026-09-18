'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import {
  addPlanSlotAction,
  addStandardPlanSlotsAction,
  removePlanSlotAction,
  updatePlanSlotAction,
} from '@/modules/music/actions/music.actions';
import type {
  PlanSongSlot,
  PlanSongSlotType,
  ServiceMusicPlan,
  Song,
} from '@/modules/music/types';
import { SLOT_TYPE_LABELS } from '@/modules/music/types';
import { songMediaAvailability } from '@/modules/music/features/song-catalog/SongMediaResources';

import { PlanSongPicker } from '../PlanSongPicker';
import { PlanSetListSuggest } from '../PlanSetListSuggest';

/** Avoid double-seeding the same plan while an auto-seed request is in flight. */
const seedingPlanIds = new Set<string>();

export type PlanSetListEditorProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
  onPlanChange: (plan: ServiceMusicPlan) => void;
  onError: (message: string | null) => void;
};

export function PlanSetListEditor({
  plan,
  songs,
  onPlanChange,
  onError,
}: PlanSetListEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pickingSlotId, setPickingSlotId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [newSlotType, setNewSlotType] = useState<PlanSongSlotType>('worship');
  const [isSeedingDefaults, setIsSeedingDefaults] = useState(
    plan.songs.length === 0,
  );
  const hasAttemptedAutoSeed = useRef(false);

  const slots = [...plan.songs].sort((a, b) => a.sortOrder - b.sortOrder);
  const pickingSlot = slots.find((slot) => slot.id === pickingSlotId) ?? null;
  const emptyCount = slots.filter(
    (slot) => !slot.songId && !slot.customTitle?.trim(),
  ).length;

  useEffect(() => {
    if (plan.songs.length > 0) {
      setIsSeedingDefaults(false);
      return;
    }
    // Only auto-seed once when opening an empty plan — not after the user clears all slots.
    if (hasAttemptedAutoSeed.current || seedingPlanIds.has(plan.id)) return;

    let cancelled = false;
    hasAttemptedAutoSeed.current = true;
    seedingPlanIds.add(plan.id);
    setIsSeedingDefaults(true);
    onError(null);

    void addStandardPlanSlotsAction(plan.id).then((result) => {
      seedingPlanIds.delete(plan.id);
      if (cancelled) return;
      if (!result.ok) {
        onError(result.error);
        setIsSeedingDefaults(false);
        return;
      }
      onPlanChange(result.plan);
      setIsSeedingDefaults(false);
      router.refresh();
    });

    return () => {
      cancelled = true;
    };
  }, [plan.id, plan.songs.length, onError, onPlanChange, router]);

  useEffect(() => {
    if (!pickingSlotId) {
      setCustomTitle('');
      return;
    }
    const slot = plan.songs.find((item) => item.id === pickingSlotId);
    setCustomTitle(slot?.customTitle?.trim() ?? '');
  }, [pickingSlotId, plan.songs]);

  function run(
    action: () => Promise<
      { ok: true; plan: ServiceMusicPlan } | { ok: false; error: string }
    >,
  ) {
    onError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        onError(result.error);
        return;
      }
      onPlanChange(result.plan);
      router.refresh();
    });
  }

  function songLabel(slot: PlanSongSlot): string | null {
    if (slot.customTitle?.trim()) return slot.customTitle.trim();
    if (!slot.songId) return null;
    return songs.find((song) => song.id === slot.songId)?.title ?? 'Unknown song';
  }

  function closePicker() {
    setPickingSlotId(null);
    setCustomTitle('');
  }

  function applyCustomTitle() {
    if (!pickingSlot) return;
    const value = customTitle.trim();
    if (!value) return;
    run(() =>
      updatePlanSlotAction(plan.id, pickingSlot.id, {
        customTitle: value,
        songId: null,
      }),
    );
    closePicker();
  }

  // Focused pick step — one slot at a time (mirrors create-plan step flow on phone).
  if (pickingSlot) {
    const slotLabel = SLOT_TYPE_LABELS[pickingSlot.slotType];
    return (
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ebc-burgundy">
            Pick a song
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">
            {pickingSlot.sortOrder}. {slotLabel}
          </h3>
          <p className="mt-0.5 text-sm text-slate-600">
            Search the catalog, or enter a custom title below.
          </p>
        </div>

        <PlanSongPicker
          songs={songs}
          value={pickingSlot.songId ?? ''}
          disabled={isPending}
          compact
          onChange={(songId) => {
            run(() =>
              updatePlanSlotAction(plan.id, pickingSlot.id, {
                songId,
                customTitle: null,
              }),
            );
            closePicker();
          }}
        />

        <label className="block">
          <span className="text-xs font-medium text-slate-700">Or custom title</span>
          <input
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="e.g. Special guest solo"
            disabled={isPending}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm disabled:opacity-50"
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              applyCustomTitle();
            }}
          />
        </label>

        <div className="sticky bottom-0 -mx-1 mt-1 border-t border-slate-200 bg-white/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/90">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closePicker}
              disabled={isPending}
              className="inline-flex h-11 min-w-[5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCustomTitle}
              disabled={isPending || !customTitle.trim()}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-ebc-burgundy px-4 text-sm font-semibold text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
            >
              Use custom title
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="hidden text-sm text-slate-600 sm:block">
        Build the service with slots (Welcome, Worship, Offering…). Put a song in each
        slot, or leave it empty for now. Template comes from{' '}
        <Link
          href="/music/director-settings"
          className="font-medium text-ebc-burgundy hover:underline"
        >
          Director settings
        </Link>
        .
      </p>

      <div className="flex items-center justify-between gap-2 sm:hidden">
        <p className="text-sm text-slate-600">
          {slots.length} slot{slots.length === 1 ? '' : 's'}
          {emptyCount > 0 ? (
            <span className="text-slate-500"> · {emptyCount} open</span>
          ) : null}
        </p>
        <Link
          href="/music/director-settings"
          className="text-xs font-medium text-ebc-burgundy hover:underline"
        >
          Template
        </Link>
      </div>

      {slots.length > 0 ? (
        <PlanSetListSuggest
          plan={plan}
          songs={songs}
          onPlanChange={onPlanChange}
          onError={onError}
          compact
        />
      ) : null}

      {slots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm text-slate-600">
            {isSeedingDefaults
              ? 'Adding default service slots…'
              : 'No service slots yet.'}
          </p>
        </div>
      ) : (
        <ol className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {slots.map((slot) => {
            const title = songLabel(slot);
            const linked = slot.songId
              ? songs.find((song) => song.id === slot.songId)
              : undefined;
            const media = linked ? songMediaAvailability(linked) : null;
            const mediaSummary = media
              ? [
                  media.video ? 'V' : null,
                  media.music ? 'M' : null,
                  media.lyrics ? 'L' : null,
                ]
                  .filter(Boolean)
                  .join('')
              : null;

            return (
              <li key={slot.id} className="px-3 py-2.5 sm:px-4 sm:py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ebc-burgundy/10 text-xs font-bold text-ebc-burgundy">
                    {slot.sortOrder}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <select
                        value={slot.slotType}
                        disabled={isPending}
                        onChange={(event) =>
                          run(() =>
                            updatePlanSlotAction(plan.id, slot.id, {
                              slotType: event.target.value as PlanSongSlotType,
                            }),
                          )
                        }
                        className="max-w-[9.5rem] shrink-0 truncate rounded-md border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs font-semibold text-slate-800 sm:max-w-none sm:text-sm"
                        aria-label={`Slot ${slot.sortOrder} type`}
                      >
                        {(Object.keys(SLOT_TYPE_LABELS) as PlanSongSlotType[]).map(
                          (type) => (
                            <option key={type} value={type}>
                              {SLOT_TYPE_LABELS[type]}
                            </option>
                          ),
                        )}
                      </select>
                      {mediaSummary ? (
                        <span className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:inline">
                          {mediaSummary}
                        </span>
                      ) : null}
                    </div>
                    {title ? (
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                        {title}
                        {linked?.artist ? (
                          <span className="font-normal text-slate-500">
                            {' '}
                            · {linked.artist}
                          </span>
                        ) : null}
                      </p>
                    ) : (
                      <p className="mt-0.5 truncate text-sm text-slate-400">
                        No song yet
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setPickingSlotId(slot.id)}
                      className={
                        title
                          ? 'rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-ebc-burgundy hover:bg-slate-50 disabled:opacity-50'
                          : 'rounded-lg bg-ebc-burgundy px-2.5 py-1.5 text-xs font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50'
                      }
                    >
                      {title ? 'Change' : 'Pick'}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        run(() => removePlanSlotAction(plan.id, slot.id))
                      }
                      className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Remove ${SLOT_TYPE_LABELS[slot.slotType]} slot`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="sticky bottom-0 -mx-1 border-t border-slate-200 bg-white/95 px-1 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/90 sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <div className="flex items-end gap-2">
          <label className="block min-w-0 flex-1">
            <span className="text-xs font-medium text-slate-700">Add slot</span>
            <select
              value={newSlotType}
              onChange={(event) =>
                setNewSlotType(event.target.value as PlanSongSlotType)
              }
              disabled={isPending}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            >
              {(Object.keys(SLOT_TYPE_LABELS) as PlanSongSlotType[]).map((type) => (
                <option key={type} value={type}>
                  {SLOT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(() => addPlanSlotAction(plan.id, { slotType: newSlotType }))
            }
            className="inline-flex h-[42px] shrink-0 items-center rounded-lg bg-ebc-burgundy px-4 text-sm font-medium text-white hover:bg-ebc-burgundy/90 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
