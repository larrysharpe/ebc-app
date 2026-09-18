'use client';

import { useEffect, useState, type ReactElement } from 'react';

import { PlanAttendanceSection } from './PlanAttendanceSection';
import { PlanCommentsSection } from './PlanCommentsSection';
import type {
  PlanResponseTabId,
  PlanResponseViewProps,
} from './plan-response.types';

export type PlanResponsePanelProps = PlanResponseViewProps & {
  /** When embedding under another tab strip, hide this panel’s own tabs. */
  activeTab?: PlanResponseTabId;
  showTabList?: boolean;
};

function resolveHashTab(): PlanResponseTabId {
  if (typeof window === 'undefined') return 'attendance';
  const hash = window.location.hash.replace('#', '');
  if (hash === 'comments') return 'comments';
  return 'attendance';
}

type ResponseTabButtonProps = {
  id: PlanResponseTabId;
  label: string;
  badge?: string;
  active: boolean;
  onSelect: (id: PlanResponseTabId) => void;
};

function ResponseTabButton({
  id,
  label,
  badge,
  active,
  onSelect,
}: ResponseTabButtonProps): ReactElement {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={`plan-response-tab-${id}`}
      aria-controls={`plan-response-panel-${id}`}
      onClick={() => {
        onSelect(id);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `#${id}`);
        }
      }}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-base font-medium transition ${
        active
          ? 'bg-ebc-burgundy text-white'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-ebc-burgundy/40'
      }`}
    >
      {label}
      {badge ? (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function PlanResponsePanel({
  planId,
  currentUser,
  myAttendance,
  attendance,
  summary,
  comments,
  canViewRoster,
  activeTab: controlledTab,
  showTabList = true,
}: PlanResponsePanelProps): ReactElement {
  const [tab, setTab] = useState<PlanResponseTabId>('attendance');
  const activeTab = controlledTab ?? tab;

  useEffect(() => {
    if (controlledTab) return;
    setTab(resolveHashTab());
    const onHashChange = (): void => setTab(resolveHashTab());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [controlledTab]);

  const attendanceBadge =
    summary.total > 0
      ? `${summary.attending}/${summary.total}`
      : myAttendance
        ? 'Answered'
        : undefined;
  const commentsBadge =
    comments.length > 0 ? String(comments.length) : undefined;

  return (
    <section
      id="attendance"
      className="scroll-mt-24 space-y-4 rounded-xl border border-slate-200 bg-white px-4 py-5 sm:px-5"
    >
      {showTabList ? (
        <div
          className="-mx-1 overflow-x-auto overscroll-x-contain px-1"
          role="tablist"
          aria-label="Attendance and comments"
        >
          <div className="flex w-max flex-nowrap gap-2">
            <ResponseTabButton
              id="attendance"
              label="Can you make it?"
              badge={attendanceBadge}
              active={activeTab === 'attendance'}
              onSelect={setTab}
            />
            <ResponseTabButton
              id="comments"
              label="Comments"
              badge={commentsBadge}
              active={activeTab === 'comments'}
              onSelect={setTab}
            />
          </div>
        </div>
      ) : null}

      {activeTab === 'attendance' ? (
        <div
          role="tabpanel"
          id="plan-response-panel-attendance"
          aria-labelledby="plan-response-tab-attendance"
        >
          <PlanAttendanceSection
            planId={planId}
            myAttendance={myAttendance}
            attendance={attendance}
            summary={summary}
            canViewRoster={canViewRoster}
          />
        </div>
      ) : null}

      {activeTab === 'comments' ? (
        <div
          role="tabpanel"
          id="plan-response-panel-comments"
          aria-labelledby="plan-response-tab-comments"
        >
          <PlanCommentsSection
            planId={planId}
            currentUser={currentUser}
            comments={comments}
          />
        </div>
      ) : null}
    </section>
  );
}
