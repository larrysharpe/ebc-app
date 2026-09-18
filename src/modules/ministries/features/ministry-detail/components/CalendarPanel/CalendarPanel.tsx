'use client';

import { useMemo, useState } from 'react';

import { ChurchEventForm, ChurchEventList } from '@/modules/events';
import type { ChurchEvent } from '@/modules/events';
import type { Ministry } from '@/modules/ministries/types';
import { formatEventDate, sortEventsUpcoming } from '@/modules/ministries/utils/ministry.utils';
import type { VoiceCoachPreference } from '@/modules/preferences';

export type CalendarPanelProps = {
  ministry: Ministry;
  churchEvents: ChurchEvent[];
  canManage?: boolean;
  canApproveEvents?: boolean;
  voiceCoachPreference?: VoiceCoachPreference;
};

export function CalendarPanel({
  ministry,
  churchEvents,
  canManage = false,
  canApproveEvents = false,
  voiceCoachPreference = 'ask',
}: CalendarPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [showChurchWide, setShowChurchWide] = useState(false);
  const legacyEvents = sortEventsUpcoming(ministry.events);
  const ministryEventDates = useMemo(
    () =>
      churchEvents
        .filter((event) => event.ministryId === ministry.id && event.eventDate)
        .map((event) => event.eventDate as string),
    [churchEvents, ministry.id],
  );
  const visibleEvents = useMemo(
    () =>
      showChurchWide
        ? churchEvents
        : churchEvents.filter((event) => event.ministryId === ministry.id),
    [churchEvents, ministry.id, showChurchWide],
  );
  const churchWideCount = useMemo(
    () => churchEvents.filter((event) => !event.ministryId).length,
    [churchEvents],
  );

  function openCreate() {
    setEditingEvent(null);
    setShowForm(true);
  }

  function openEdit(event: ChurchEvent) {
    if (event.ministryId !== ministry.id) return;
    setEditingEvent(event);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEvent(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ebc-burgundy">Ministry calendar</h3>
          <p className="mt-1 text-sm text-slate-600">
            {ministry.name} events
            {showChurchWide ? ' plus published church-wide dates' : ''}. You can edit
            this ministry&apos;s events only — church-wide dates are view-only here.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => (showForm && !editingEvent ? closeForm() : openCreate())}
            className="ebc-action-primary"
          >
            {showForm && !editingEvent ? 'Close form' : 'Add event'}
          </button>
        ) : null}
      </div>

      <label
        className={`ebc-choice ${showChurchWide ? 'ebc-choice-selected' : 'ebc-choice-idle'}`}
      >
        <input
          type="checkbox"
          checked={showChurchWide}
          onChange={(e) => setShowChurchWide(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-slate-300"
        />
        <span>
          <span className="block text-sm font-medium">Show church-wide events</span>
          <span className="mt-0.5 block text-xs font-normal text-slate-500">
            {churchWideCount === 0
              ? 'No church-wide dates in this list right now.'
              : `${churchWideCount} church-wide ${churchWideCount === 1 ? 'date' : 'dates'} (view only — edit under Events).`}
          </span>
        </span>
      </label>

      {showForm && canManage ? (
        <ChurchEventForm
          ministries={[{ id: ministry.id, name: ministry.name }]}
          lockedMinistryId={ministry.id}
          takenDates={ministryEventDates}
          initialEvent={editingEvent}
          defaultStatus="draft"
          requireApprovalToPublish
          voiceCoachPreference={voiceCoachPreference}
          onCancelEdit={editingEvent ? closeForm : undefined}
          onSaved={closeForm}
        />
      ) : null}

      <ChurchEventList
        events={visibleEvents}
        canManage={canManage}
        canApprove={canApproveEvents}
        manageMinistryId={ministry.id}
        hideMinistry
        showSourceBadge
        onEdit={canManage ? openEdit : undefined}
        emptyMessage={
          showChurchWide
            ? 'No upcoming ministry or church-wide events yet. Add a draft for this ministry, or create church-wide events under Events → Calendar.'
            : 'No upcoming events for this ministry yet. Turn on church-wide dates above, or add a draft.'
        }
      />

      {legacyEvents.length > 0 ? (
        <section className="space-y-3 border-t border-slate-200 pt-4">
          <h4 className="text-sm font-semibold text-slate-700">Earlier local notes</h4>
          <ul className="space-y-3">
            {legacyEvents.map((event) => (
              <li key={event.id} className="ebc-card">
                <p className="font-semibold text-slate-900">{event.title}</p>
                <p className="mt-1 text-sm text-ebc-burgundy">
                  {formatEventDate(event.startAt)}
                </p>
                {event.location ? (
                  <p className="text-sm text-slate-600">{event.location}</p>
                ) : null}
                {event.notes ? (
                  <p className="mt-2 text-sm text-slate-500">{event.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
