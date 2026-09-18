'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  CHURCH_EVENT_TYPE_LABELS,
  formatChurchEventDisplayTitle,
  type ChurchEvent,
  type ChurchEventType,
} from '@/modules/events/types/church-event.types';
import { effectiveEventType } from '@/modules/events/utils/church-event-relevance.utils';

import {
  filterChurchEventsForPicker,
  formatEventPickerDate,
  formatEventPickerTimeRange,
  type EventPickerPurpose,
  type EventQuickFilter,
} from './church-event-picker.utils';
import {
  existingPlanStatusLabel,
  isEventToday,
  type ExistingPlanForEvent,
} from './existing-plan-for-event.utils';

export type ChurchEventPickerProps = {
  events: ChurchEvent[];
  value: string;
  onChange: (eventId: string) => void;
  /** Defaults to music-plan: Sunday worship / special only. */
  purpose?: EventPickerPurpose;
  /** Event id → existing choir plan (opens edit instead of create). */
  existingPlansByEventId?: Record<string, ExistingPlanForEvent>;
};

const MUSIC_QUICK_FILTERS: { id: EventQuickFilter; label: string }[] = [
  { id: 'upcoming-week', label: 'This week' },
  { id: 'upcoming-2-weeks', label: 'Next 2 weeks' },
  { id: 'upcoming-month', label: 'Next 30 days' },
  { id: 'worship', label: 'Sunday worship' },
  { id: 'special', label: 'Special service' },
  { id: 'all', label: 'All services' },
];

const ALL_QUICK_FILTERS: { id: EventQuickFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'upcoming-week', label: 'This week' },
  { id: 'upcoming-2-weeks', label: 'Next 2 weeks' },
  { id: 'upcoming-month', label: 'Next 30 days' },
  { id: 'worship', label: 'Sunday worship' },
  { id: 'education', label: 'Class / study' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'special', label: 'Special' },
];

export function ChurchEventPicker({
  events,
  value,
  onChange,
  purpose = 'music-plan',
  existingPlansByEventId = {},
}: ChurchEventPickerProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<EventQuickFilter>('upcoming-month');
  /** Mobile only: filters vs search — desktop always shows both. */
  const [mobileFindMode, setMobileFindMode] = useState<'filters' | 'search'>('filters');

  const quickFilters = purpose === 'music-plan' ? MUSIC_QUICK_FILTERS : ALL_QUICK_FILTERS;
  const selected = events.find((event) => event.id === value) ?? null;
  const selectedNoteText = selected ? selectedNotes(selected.notes) : undefined;
  const selectedExisting = selected
    ? existingPlansByEventId[selected.id]
    : undefined;
  const filtered = filterChurchEventsForPicker(
    events,
    query,
    quickFilter,
    undefined,
    purpose,
  );

  function openMobileSearch() {
    setMobileFindMode('search');
  }

  function openMobileFilters() {
    setMobileFindMode('filters');
    setQuery('');
  }

  function handleSelect(eventId: string) {
    const existing = existingPlansByEventId[eventId];
    if (existing) {
      router.push(`/music/plans/${existing.planId}`);
      return;
    }
    onChange(eventId);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-700">Church service</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {purpose === 'music-plan'
              ? 'Sunday worship and special services only. If a plan already exists, tap it to edit.'
              : 'Filter or search by name — or skip and use choir rotation.'}
          </p>
        </div>
        {value && !selectedExisting ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
          >
            Clear selection
          </button>
        ) : null}
      </div>

      {selected ? (
        <div className="rounded-xl border border-ebc-burgundy/30 bg-ebc-burgundy/5 px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ebc-burgundy">
              Selected
            </p>
            {selected.eventDate && isEventToday(selected.eventDate) ? (
              <span className="rounded-full bg-ebc-gold/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ebc-burgundy">
                Today
              </span>
            ) : null}
            {selectedExisting ? (
              <span className="rounded-full bg-ebc-navy/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ebc-navy">
                Plan exists
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {formatChurchEventDisplayTitle(selected)}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ebc-burgundy/80">
            Event date &amp; time
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {selected.eventDate
              ? formatEventPickerDate(selected.eventDate)
              : 'Date TBD'}
          </p>
          <p className="mt-0.5 text-sm text-slate-700">
            {formatEventPickerTimeRange(selected.startTime, selected.endTime)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {CHURCH_EVENT_TYPE_LABELS[effectiveEventType(selected)]}
            {selected.ministryName
              ? ` · ${selected.ministryName}`
              : ' · Church-wide'}
          </p>
          {selectedNoteText ? (
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">
              {selectedNoteText}
            </p>
          ) : null}
          {selectedExisting ? (
            <div className="mt-3 space-y-2 border-t border-ebc-burgundy/15 pt-3">
              <p className="text-sm text-slate-700">
                A choir plan already exists for this service:{' '}
                <span className="font-semibold">{selectedExisting.title}</span>
                {' · '}
                {existingPlanStatusLabel(selectedExisting.status)}
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(`/music/plans/${selectedExisting.planId}`)
                }
                className="ebc-action-primary"
              >
                Edit existing plan
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange('')}
          className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-left text-sm text-slate-600"
        >
          No event selected — using choir rotation date
        </button>
      )}

      {/* Desktop: search always visible */}
      <label className="hidden sm:block">
        <span className="sr-only">Search events</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search events (e.g. worship, youth, pantry)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      {/* Mobile: search mode — search field + Filters toggle */}
      {mobileFindMode === 'search' ? (
        <div className="flex items-center gap-2 sm:hidden">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search events</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events…"
              autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={openMobileFilters}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700"
          >
            Filters
          </button>
        </div>
      ) : null}

      {/* Mobile filters mode + desktop filters — single scrollable row */}
      <div
        className={`-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-0.5 ${
          mobileFindMode === 'search' ? 'hidden sm:block' : 'block'
        }`}
      >
        <div className="flex w-max flex-nowrap items-center gap-1.5">
          <button
            type="button"
            onClick={openMobileSearch}
            aria-pressed={mobileFindMode === 'search'}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-ebc-burgundy/40 sm:hidden"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
              />
            </svg>
            Search
          </button>
          {quickFilters.map((filter) => {
            const active = quickFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setQuickFilter(filter.id)}
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? 'border-ebc-burgundy bg-ebc-burgundy text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-ebc-burgundy/40'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul
        className="max-h-40 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white sm:max-h-56"
        role="listbox"
        aria-label="Matching church events"
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-slate-500">
            No events match. Try another search or filter.
          </li>
        ) : (
          filtered.map((event) => {
            if (!event.eventDate) return null;
            const active = event.id === value;
            const existing = existingPlansByEventId[event.id];
            const today = isEventToday(event.eventDate);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => handleSelect(event.id)}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition ${
                    active
                      ? 'bg-ebc-burgundy/10'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">
                      {formatChurchEventDisplayTitle(event)}
                    </span>
                    {today ? (
                      <span className="rounded-full bg-ebc-gold/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ebc-burgundy">
                        Today
                      </span>
                    ) : null}
                    {existing ? (
                      <span className="rounded-full bg-ebc-navy/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ebc-navy">
                        {existing.status === 'sent' ? 'Has plan' : 'Draft plan'}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-xs text-slate-600">
                    {formatEventPickerDate(event.eventDate)}
                    {event.startTime ? ` · ${event.startTime}` : ''}
                    {' · '}
                    {typeLabel(effectiveEventType(event))}
                    {event.ministryName ? ` · ${event.ministryName}` : ''}
                    {existing
                      ? ` · Tap to edit “${existing.title}”`
                      : ''}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

      <p className="text-xs text-slate-500">
        Showing {filtered.length} matching{' '}
        {purpose === 'music-plan' ? 'services' : 'events'} from Events → Calendar.
      </p>
    </div>
  );
}

function typeLabel(type: ChurchEventType): string {
  return CHURCH_EVENT_TYPE_LABELS[type];
}

function selectedNotes(notes?: string): string | undefined {
  if (!notes?.trim()) return undefined;
  const cleaned = notes
    .split('\n')
    .filter(
      (line) =>
        !line.startsWith('Imported from ebenezerbc.org') &&
        !line.startsWith('https://ebenezerbc.org'),
    )
    .join('\n')
    .trim();
  return cleaned || undefined;
}
