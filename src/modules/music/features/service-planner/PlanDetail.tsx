import Link from 'next/link';

import type { SessionUser } from '@/modules/auth/types/auth.types';
import type { MusicAccess } from '@/modules/auth/types/permissions.types';
import {
  CHURCH_EVENT_TYPE_LABELS,
  formatChurchEventDisplayTitle,
  formatServiceCharacteristics,
  formatServiceDisplayTitle,
  isSpecialSundayService,
  type ChurchEvent,
  type SundayService,
} from '@/modules/events';
import type { ServiceMusicPlan, Song } from '../../types';
import type { PlanResponseBoard } from '../../types/plan-response.types';
import { buildPlanEmailBody, formatServiceDate } from '../../utils/music.format';
import { ScheduleBadge } from '../ChoirSchedulePanel';
import { PlanResponsePanel } from '../plan-recipient';
import { DeletePlanButton } from './components/DeletePlanButton';
import { PlanPreviewPanel } from './components/PlanPreviewPanel';
import { SendPlanButton } from './components/SendPlanButton';
import { PlanEditor } from './PlanEditor';

type PlanDetailProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
  access: MusicAccess;
  churchEvent?: ChurchEvent | null;
  sundayService?: SundayService | null;
  currentUser?: SessionUser | null;
  responseBoard?: PlanResponseBoard | null;
};

function directorFacingNotes(notes?: string): string | undefined {
  if (!notes) return undefined;
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

function formatEventTimeRange(start?: string, end?: string): string {
  if (start && end) return `${start}–${end}`;
  if (start) return start;
  if (end) return `until ${end}`;
  return 'Time TBD';
}

export function PlanDetail({
  plan,
  songs,
  access,
  churchEvent,
  sundayService,
  currentUser = null,
  responseBoard = null,
}: PlanDetailProps) {
  const canEdit = access.canEditPlans;
  const eventNotes = directorFacingNotes(churchEvent?.notes);
  const plainText = buildPlanEmailBody(plan, songs);
  const rehearseHref = `/music/plans/${plan.id}/rehearse`;
  const showResponses =
    plan.status === 'sent' && currentUser && responseBoard;
  const responseProps =
    showResponses && currentUser && responseBoard
      ? {
          planId: plan.id,
          currentUser,
          myAttendance: responseBoard.myAttendance,
          attendance: responseBoard.attendance,
          summary: responseBoard.summary,
          comments: responseBoard.comments,
          canViewRoster: access.canEditPlans || access.canSendPlans,
        }
      : null;

  const linkedEventMeta = churchEvent
    ? [
        churchEvent.eventDate
          ? formatServiceDate(churchEvent.eventDate)
          : 'Date TBD',
        formatEventTimeRange(churchEvent.startTime, churchEvent.endTime),
        CHURCH_EVENT_TYPE_LABELS[churchEvent.eventType],
        churchEvent.ministryName ?? 'Church-wide',
        churchEvent.location,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-ebc-burgundy">{plan.title}</h2>
        <p className="text-sm text-slate-600">{formatServiceDate(plan.serviceDate)}</p>

        {churchEvent ? (
          <div className="mt-2">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Church event · </span>
              {formatChurchEventDisplayTitle(churchEvent)}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">{linkedEventMeta}</p>
            {eventNotes ? (
              <p className="mt-1 text-sm text-slate-600">{eventNotes}</p>
            ) : null}
          </div>
        ) : sundayService && isSpecialSundayService(sundayService) ? (
          <div className="mt-2">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Special service · </span>
              {formatServiceDisplayTitle(sundayService)}
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              {formatServiceCharacteristics(sundayService.characteristics)}
            </p>
            {sundayService.notes ? (
              <p className="mt-1 text-sm text-slate-600">{sundayService.notes}</p>
            ) : null}
          </div>
        ) : null}

        <div className="-mx-1 mt-3 overflow-x-auto overscroll-x-contain px-1">
          <div className="flex w-max flex-nowrap items-center gap-2">
            {plan.status === 'sent' ? (
              <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Shared with choir
              </span>
            ) : null}
            <Link
              href={rehearseHref}
              className="shrink-0 rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ebc-burgundy/90"
            >
              Rehearse set list
            </Link>
            {plan.status === 'draft' && access.canSendPlans ? (
              <div className="shrink-0">
                <SendPlanButton planId={plan.id} />
              </div>
            ) : null}
            {access.canEditPlans ? (
              <div className="shrink-0">
                <DeletePlanButton planId={plan.id} planTitle={plan.title} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ScheduleBadge
        serviceDate={plan.serviceDate}
        choirGroup={plan.choirGroup}
        sundayOfMonth={plan.sundayOfMonth}
        scheduleOverride={plan.scheduleOverride}
        scheduleNote={plan.scheduleNote}
      />

      {canEdit ? (
        <div className="space-y-6">
          {plan.status === 'sent' ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              This plan is live with the choir. Members get email and app alerts
              when those channels are set up and they’ve opted in (manage under
              Account → Notifications). You can still edit the plan. Use the
              Attendance and Comments tabs for responses.
            </p>
          ) : null}
          <PlanEditor plan={plan} songs={songs} responses={responseProps} />
        </div>
      ) : (
        <div className="space-y-6">
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            View only — choir directors and above can edit set lists and service
            details. Use Rehearse to practice the songs.
          </p>

          <div className="rounded-xl border border-ebc-burgundy/20 bg-ebc-burgundy/5 px-5 py-5">
            <h3 className="font-semibold text-ebc-burgundy">Ready to practice?</h3>
            <p className="mt-1 text-sm text-slate-600">
              Open the rehearsal view for video, music, and lyrics on each song.
            </p>
            <Link
              href={rehearseHref}
              className="mt-3 inline-flex rounded-lg bg-ebc-burgundy px-4 py-2 text-sm font-semibold text-white hover:bg-ebc-burgundy/90"
            >
              Open rehearsal
            </Link>
          </div>

          {responseProps ? (
            <PlanResponsePanel
              key={responseProps.myAttendance?.updatedAt ?? 'attendance'}
              {...responseProps}
            />
          ) : null}

          <PlanPreviewPanel plan={plan} songs={songs} plainText={plainText} />
        </div>
      )}

      {plan.sentAt ? (
        <p className="text-xs text-slate-500">
          Sent {new Date(plan.sentAt).toLocaleString('en-US')}
        </p>
      ) : null}
    </div>
  );
}
