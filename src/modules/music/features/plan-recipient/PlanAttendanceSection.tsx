'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type ReactElement } from 'react';

import { upsertPlanAttendanceAction } from '@/modules/music/actions/plan-response.actions';
import type {
  PlanAttendance,
  PlanAttendanceStatus,
  PlanAttendanceSummary,
} from '@/modules/music/types/plan-response.types';
import {
  PLAN_ATTENDANCE_STATUS_LABELS,
  PLAN_ATTENDANCE_STATUS_SHORT,
  PLAN_ATTENDANCE_STATUSES,
} from '@/modules/music/types/plan-response.types';

export type PlanAttendanceSectionProps = {
  planId: string;
  myAttendance: PlanAttendance | null;
  attendance: PlanAttendance[];
  summary: PlanAttendanceSummary;
  canViewRoster: boolean;
};

export function PlanAttendanceSection({
  planId,
  myAttendance,
  attendance,
  summary,
  canViewRoster,
}: PlanAttendanceSectionProps): ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PlanAttendanceStatus | ''>(
    myAttendance?.status ?? '',
  );
  const [note, setNote] = useState(myAttendance?.note ?? '');

  function saveAttendance(): void {
    if (!status) {
      setError('Choose whether you can attend.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await upsertPlanAttendanceAction({
        planId,
        status,
        note,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ebc-burgundy">Can you make Sunday?</h2>
        <p className="mt-1 text-base text-slate-600">
          Tell the director if you can be there.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-base text-red-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          {PLAN_ATTENDANCE_STATUSES.map((option) => (
            <label
              key={option}
              className={`ebc-choice ${
                status === option ? 'ebc-choice-selected' : 'ebc-choice-idle'
              }`}
            >
              <input
                type="radio"
                name="attendance"
                className="h-5 w-5 accent-ebc-burgundy"
                checked={status === option}
                onChange={() => setStatus(option)}
              />
              {PLAN_ATTENDANCE_STATUS_LABELS[option]}
            </label>
          ))}
        </div>
        <label className="block">
          <span className="text-base font-medium text-slate-700">
            Note (optional)
          </span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Arriving late from work"
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base"
          />
        </label>
        <button
          type="button"
          disabled={isPending || !status}
          onClick={saveAttendance}
          className="ebc-action-primary"
        >
          {isPending ? 'Saving…' : myAttendance ? 'Update answer' : 'Save answer'}
        </button>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="font-semibold text-slate-900">Attendance so far</h3>
        <p className="mt-1 text-sm text-slate-600">
          {summary.total === 0
            ? 'No responses yet.'
            : `${summary.attending} yes · ${summary.maybe} maybe · ${summary.not_attending} no`}
        </p>
        {canViewRoster && attendance.length > 0 ? (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {attendance.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-900">{row.displayName}</span>
                <span className="text-slate-600">
                  {PLAN_ATTENDANCE_STATUS_SHORT[row.status]}
                  {row.note ? ` · ${row.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
