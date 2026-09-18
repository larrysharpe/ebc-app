'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import {
  approveChurchEventAction,
  cancelChurchEventAction,
  deleteChurchEventAction,
  publishChurchEventAction,
  returnChurchEventAction,
} from '@/modules/events/actions/church-event.actions';
import {
  CHURCH_EVENT_STATUS_LABELS,
  CHURCH_EVENT_TYPE_LABELS,
  formatChurchEventDisplayTitle,
  type ChurchEvent,
} from '@/modules/events/types/church-event.types';
import { canManageListedEvent } from '@/modules/events/utils/church-event-access.utils';

function formatDate(iso?: string): string {
  if (!iso) return 'Date TBD';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export type ChurchEventListProps = {
  events: ChurchEvent[];
  canManage: boolean;
  /** Office/trustee may approve pending activity requests. */
  canApprove?: boolean;
  /** Hide ministry name column (already on a ministry page). */
  hideMinistry?: boolean;
  /**
   * When set (ministry calendar), only that ministry’s events show actions.
   * Church-wide rows stay view-only here.
   */
  manageMinistryId?: string;
  /** @deprecated Ignored — church-wide is never editable on a ministry calendar. */
  canManageChurchWide?: boolean;
  /** Show Church-wide vs This ministry badges (ministry calendar). */
  showSourceBadge?: boolean;
  emptyMessage?: string;
  onEdit?: (event: ChurchEvent) => void;
};

export function ChurchEventList({
  events,
  canManage,
  canApprove = false,
  hideMinistry = false,
  manageMinistryId,
  showSourceBadge = false,
  emptyMessage,
  onEdit,
}: ChurchEventListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        {emptyMessage ??
          'No upcoming events yet. Add meetings, outreach, and special dates here — this calendar is the staff source of truth.'}
      </p>
    );
  }

  function cancelEvent(id: string) {
    startTransition(async () => {
      await cancelChurchEventAction(id);
      router.refresh();
    });
  }

  function removeEvent(id: string) {
    startTransition(async () => {
      await deleteChurchEventAction(id);
      router.refresh();
    });
  }

  function publishEvent(id: string) {
    startTransition(async () => {
      await publishChurchEventAction(id);
      router.refresh();
    });
  }

  function approveEvent(id: string) {
    startTransition(async () => {
      await approveChurchEventAction(id);
      router.refresh();
    });
  }

  function returnEvent(id: string) {
    startTransition(async () => {
      await returnChurchEventAction(id);
      router.refresh();
    });
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => {
        const showActions = canManageListedEvent(event, {
          canManage,
          manageMinistryId,
        });
        const isChurchWide = !event.ministryId;
        const isDraft = event.status === 'draft';
        const isPendingApproval = event.status === 'pending_approval';
        const showApprove = canApprove && isPendingApproval;

        return (
          <li
            key={event.id}
            className={`rounded-xl border bg-white px-4 py-4 ${
              event.status === 'cancelled'
                ? 'border-red-200 opacity-80'
                : isPendingApproval
                  ? 'border-ebc-burgundy/40'
                  : isDraft
                    ? 'border-dashed border-ebc-gold/60'
                    : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {formatDate(event.eventDate)}
                  {event.eventDate
                    ? event.startTime
                      ? ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ''}`
                      : ' · Time TBD'
                    : null}
                </p>
                <h3 className="mt-1 font-semibold text-slate-900">
                  {formatChurchEventDisplayTitle(event)}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {CHURCH_EVENT_TYPE_LABELS[event.eventType]}
                  {!hideMinistry
                    ? ` · ${event.ministryName ?? 'Church-wide'}`
                    : null}
                </p>
                <p className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      isPendingApproval
                        ? 'bg-ebc-burgundy/15 text-ebc-burgundy'
                        : isDraft
                          ? 'bg-ebc-gold/20 text-ebc-burgundy'
                          : event.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-ebc-green/10 text-ebc-green-dark'
                    }`}
                  >
                    {CHURCH_EVENT_STATUS_LABELS[event.status]}
                  </span>
                  {showSourceBadge ? (
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        isChurchWide
                          ? 'bg-ebc-navy/10 text-ebc-navy'
                          : 'bg-ebc-burgundy/10 text-ebc-burgundy'
                      }`}
                    >
                      {isChurchWide ? 'Church-wide' : 'This ministry'}
                    </span>
                  ) : null}
                </p>
                {event.location ? (
                  <p className="mt-1 text-sm text-slate-600">{event.location}</p>
                ) : null}
                {event.recurring ? (
                  <p className="mt-1 text-xs text-ebc-navy">
                    ↻ {event.recurring}
                    {event.seriesId ? ' · series' : ''}
                  </p>
                ) : null}
                {event.notes ? (
                  <p className="mt-2 text-sm text-slate-600">{event.notes}</p>
                ) : null}
                {event.activityRequest?.returnReason ? (
                  <p className="mt-2 text-sm text-amber-800">
                    Returned: {event.activityRequest.returnReason}
                  </p>
                ) : null}
              </div>
              {showActions || showApprove ? (
                <div className="flex flex-wrap gap-2">
                  {showApprove ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => approveEvent(event.id)}
                        className="min-h-11 rounded-lg border border-ebc-green/40 px-3 py-1.5 text-xs font-medium text-ebc-green-dark hover:bg-ebc-green/5 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => returnEvent(event.id)}
                        className="min-h-11 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50 disabled:opacity-50"
                      >
                        Return
                      </button>
                    </>
                  ) : null}
                  {showActions ? (
                    <>
                      {onEdit ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => onEdit(event)}
                          className="min-h-11 rounded-lg border border-ebc-burgundy/30 px-3 py-1.5 text-xs font-medium text-ebc-burgundy hover:bg-ebc-burgundy/5 disabled:opacity-50"
                        >
                          Edit
                        </button>
                      ) : null}
                      {isDraft ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => publishEvent(event.id)}
                          className="min-h-11 rounded-lg border border-ebc-green/40 px-3 py-1.5 text-xs font-medium text-ebc-green-dark hover:bg-ebc-green/5 disabled:opacity-50"
                        >
                          Publish
                        </button>
                      ) : !isPendingApproval ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => cancelEvent(event.id)}
                          className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => removeEvent(event.id)}
                        className="min-h-11 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
