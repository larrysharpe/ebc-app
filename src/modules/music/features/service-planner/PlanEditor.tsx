'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import {
  normalizeRichTextValue,
  RichTextContent,
  RichTextEditor,
} from '@/components/ui/RichTextEditor';
import { ChurchSpaceSelect } from '@/modules/facilities';
import { savePlanAction } from '@/modules/music/actions/music.actions';
import {
  PlanAttendanceSection,
  PlanCommentsSection,
  type PlanResponseViewProps,
} from '@/modules/music/features/plan-recipient';

import type { PlanPractice, ServiceMusicPlan, Song } from '../../types';
import { buildPlanEmailBody } from '../../utils/music.format';
import {
  createEmptyPractice,
  getPlanPractices,
  withSyncedPractices,
} from '../../utils/plan-practice.utils';
import { normalizePlanServiceRoleInput } from '../../utils/plan-service-role.utils';
import { PlanPreviewPanel } from './components/PlanPreviewPanel';
import { PlanServiceRoleField } from './components/PlanServiceRoleField';
import { PlanSetListEditor } from './components/PlanSetListEditor';

type PlanTab = 'setlist' | 'details' | 'preview' | 'attendance' | 'comments';

type PlanEditorProps = {
  plan: ServiceMusicPlan;
  songs: Song[];
  /** Present when the plan is shared with the choir (in progress). */
  responses?: PlanResponseViewProps | null;
};

function resolveInitialTab(hasResponses: boolean): PlanTab {
  if (typeof window === 'undefined' || !hasResponses) return 'setlist';
  const hash = window.location.hash.replace('#', '');
  if (hash === 'attendance' || hash === 'comments') return hash;
  return 'setlist';
}

type TabButtonProps = {
  id: PlanTab;
  label: string;
  badge?: string;
  active: boolean;
  onSelect: (id: PlanTab) => void;
};

function TabButton({ id, label, badge, active, onSelect }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      id={`plan-tab-${id}`}
      aria-controls={`plan-panel-${id}`}
      onClick={() => onSelect(id)}
      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition sm:text-base ${
        active
          ? 'bg-ebc-burgundy text-white'
          : 'border border-slate-200 bg-white text-slate-700 hover:border-ebc-burgundy/40'
      }`}
    >
      {label}
      {badge ? (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export function PlanEditor({ plan, songs, responses = null }: PlanEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(plan);
  const [practices, setPractices] = useState<PlanPractice[]>(() =>
    getPlanPractices(plan),
  );
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<PlanTab>('setlist');
  const [directorNotes, setDirectorNotes] = useState(plan.directorNotes ?? '');
  const [postServiceMessage, setPostServiceMessage] = useState(
    plan.postServiceMessage ?? '',
  );

  useEffect(() => {
    setTab(resolveInitialTab(Boolean(responses)));
    if (!responses) return;
    const onHashChange = (): void => setTab(resolveInitialTab(true));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [responses]);

  const plainText = buildPlanEmailBody(draft, songs);
  const slotBadge =
    draft.songs.length > 0
      ? `${draft.songs.length} slot${draft.songs.length === 1 ? '' : 's'}`
      : 'Empty';
  const attendanceBadge =
    responses && responses.summary.total > 0
      ? `${responses.summary.attending}/${responses.summary.total}`
      : undefined;
  const commentsBadge =
    responses && responses.comments.length > 0
      ? String(responses.comments.length)
      : undefined;

  function updatePractice(id: string, patch: Partial<PlanPractice>) {
    setPractices((current) =>
      current.map((practice) =>
        practice.id === id ? { ...practice, ...patch } : practice,
      ),
    );
  }

  function handleSaveDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    const updated = withSyncedPractices(
      {
        ...draft,
        title: String(formData.get('title') ?? draft.title),
        serviceDate: String(formData.get('serviceDate') ?? draft.serviceDate),
        serviceStartTime: String(formData.get('serviceStartTime') ?? '') || undefined,
        serviceEndTime: String(formData.get('serviceEndTime') ?? '') || undefined,
        arrivalTime: String(formData.get('arrivalTime') ?? '') || undefined,
        occasion: String(formData.get('occasion') ?? '') || undefined,
        attire: String(formData.get('attire') ?? '') || undefined,
        scriptureReader: normalizePlanServiceRoleInput(
          String(formData.get('scriptureReader') ?? ''),
        ),
        prayerLeader: normalizePlanServiceRoleInput(
          String(formData.get('prayerLeader') ?? ''),
        ),
        directorNotes: normalizeRichTextValue(
          String(formData.get('directorNotes') ?? directorNotes),
        ),
        postServiceMessage: normalizeRichTextValue(
          String(formData.get('postServiceMessage') ?? postServiceMessage),
        ),
      },
      practices,
    );

    startTransition(async () => {
      const result = await savePlanAction(updated);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDraft(result.plan);
      setDirectorNotes(result.plan.directorNotes ?? '');
      setPostServiceMessage(result.plan.postServiceMessage ?? '');
      setPractices(getPlanPractices(result.plan));
      router.refresh();
    });
  }

  const tabs: { id: PlanTab; label: string; badge?: string }[] = [
    { id: 'setlist', label: 'Set list', badge: slotBadge },
    { id: 'details', label: 'Plan details' },
    { id: 'preview', label: 'Preview' },
  ];
  if (responses) {
    tabs.push(
      {
        id: 'attendance',
        label: 'Can you make it?',
        badge: attendanceBadge,
      },
      {
        id: 'comments',
        label: 'Comments',
        badge: commentsBadge,
      },
    );
  }

  function selectTab(id: PlanTab): void {
    setTab(id);
    if (
      typeof window !== 'undefined' &&
      (id === 'attendance' || id === 'comments')
    ) {
      window.history.replaceState(null, '', `#${id}`);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div
        className="-mx-1 overflow-x-auto overscroll-x-contain border-b border-slate-200 px-1 pb-3"
        role="tablist"
        aria-label="Plan sections"
      >
        <div className="flex w-max flex-nowrap gap-2">
          {tabs.map((item) => (
            <TabButton
              key={item.id}
              id={item.id}
              label={item.label}
              badge={item.badge}
              active={tab === item.id}
              onSelect={selectTab}
            />
          ))}
        </div>
      </div>

      {tab === 'setlist' ? (
        <div
          role="tabpanel"
          id="plan-panel-setlist"
          aria-labelledby="plan-tab-setlist"
          className="rounded-xl border border-ebc-burgundy/25 bg-white p-3 sm:p-5"
        >
          <div className="mb-3 hidden sm:mb-4 sm:block">
            <h3 className="font-semibold text-ebc-burgundy">Set list</h3>
            <p className="mt-1 text-sm text-slate-600">
              Add service slots, then put a song in each one.
            </p>
          </div>
          <PlanSetListEditor
            plan={draft}
            songs={songs}
            onPlanChange={setDraft}
            onError={setError}
          />
        </div>
      ) : null}

      {tab === 'details' ? (
        <div
          role="tabpanel"
          id="plan-panel-details"
          aria-labelledby="plan-tab-details"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-amber-900">Plan details</h3>
            <p className="mt-1 text-sm text-amber-800/80">
              Title, practice times, and notes.
            </p>
          </div>
          <form onSubmit={handleSaveDetails} className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                name="title"
                defaultValue={draft.title}
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
              <label className="block min-w-0">
                <span className="text-sm font-medium text-slate-700">Service date</span>
                <input
                  name="serviceDate"
                  type="date"
                  defaultValue={draft.serviceDate}
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block min-w-0">
                <span className="text-sm font-medium text-slate-700">Service start</span>
                <input
                  name="serviceStartTime"
                  type="time"
                  defaultValue={draft.serviceStartTime ?? ''}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
              <label className="block min-w-0">
                <span className="text-sm font-medium text-slate-700">Service end</span>
                <input
                  name="serviceEndTime"
                  type="time"
                  defaultValue={draft.serviceEndTime ?? ''}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="block sm:col-span-2 sm:max-w-xs">
              <span className="text-sm font-medium text-slate-700">Arrival time</span>
              <input
                name="arrivalTime"
                type="time"
                defaultValue={draft.arrivalTime ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <span className="mt-1 block text-xs text-slate-500">
                When the choir should arrive for the service.
              </span>
            </label>

            <div className="space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Practices</p>
                  <p className="text-xs text-slate-500">Add one or more rehearsals.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPractices((current) => [...current, createEmptyPractice()])
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Add practice
                </button>
              </div>

              {practices.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white/70 px-3 py-3 text-sm text-slate-500">
                  No practices yet. Tap Add practice to schedule a rehearsal.
                </p>
              ) : (
                <ul className="space-y-3">
                  {practices.map((practice, index) => (
                    <li
                      key={practice.id}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Practice {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setPractices((current) =>
                              current.filter((item) => item.id !== practice.id),
                            )
                          }
                          className="text-xs font-medium text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block min-w-0 sm:col-span-2">
                          <span className="text-xs font-medium text-slate-700">Date</span>
                          <input
                            type="date"
                            value={practice.date}
                            onChange={(event) =>
                              updatePractice(practice.id, { date: event.target.value })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-xs font-medium text-slate-700">Start</span>
                          <input
                            type="time"
                            value={practice.startTime ?? ''}
                            onChange={(event) =>
                              updatePractice(practice.id, {
                                startTime: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-xs font-medium text-slate-700">End</span>
                          <input
                            type="time"
                            value={practice.endTime ?? ''}
                            onChange={(event) =>
                              updatePractice(practice.id, {
                                endTime: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          />
                        </label>
                        <ChurchSpaceSelect
                          className="block min-w-0 sm:col-span-2"
                          label="Location"
                          optional
                          value={practice.location ?? ''}
                          onChange={({ location }) =>
                            updatePractice(practice.id, { location })
                          }
                          selectClassName="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="block sm:col-span-2">
              <RichTextEditor
                name="directorNotes"
                label="Director notes"
                value={directorNotes}
                onChange={setDirectorNotes}
                placeholder="Notes for the choir about practice, call time, or this service…"
                disabled={isPending}
              />
            </div>
            <div className="block sm:col-span-2">
              <RichTextEditor
                name="postServiceMessage"
                label="Post-service thank you"
                value={postServiceMessage}
                onChange={setPostServiceMessage}
                placeholder="Thank the choir after the service — bold, lists, and links welcome…"
                disabled={isPending}
                minHeightClassName="min-h-[11rem]"
              />
            </div>
            <PlanServiceRoleField
              name="scriptureReader"
              label="Scripture reader"
              defaultValue={draft.scriptureReader}
            />
            <PlanServiceRoleField
              name="prayerLeader"
              label="Prayer leader"
              defaultValue={draft.prayerLeader}
            />
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-ebc-green px-4 py-2 text-sm font-medium text-white hover:bg-ebc-green-dark disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save plan details'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {tab === 'preview' ? (
        <div
          role="tabpanel"
          id="plan-panel-preview"
          aria-labelledby="plan-tab-preview"
        >
          <PlanPreviewPanel plan={draft} songs={songs} plainText={plainText} />
          {draft.postServiceMessage ? (
            <section className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 className="font-semibold text-green-900">Post-service thank you</h3>
              <div className="mt-3">
                <RichTextContent
                  value={draft.postServiceMessage}
                  className="text-sm leading-relaxed text-green-900/90 [&_a]:font-medium [&_a]:text-ebc-green [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5"
                />
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === 'attendance' && responses ? (
        <div
          role="tabpanel"
          id="plan-panel-attendance"
          aria-labelledby="plan-tab-attendance"
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <PlanAttendanceSection
            planId={responses.planId}
            myAttendance={responses.myAttendance}
            attendance={responses.attendance}
            summary={responses.summary}
            canViewRoster={responses.canViewRoster}
          />
        </div>
      ) : null}

      {tab === 'comments' && responses ? (
        <div
          role="tabpanel"
          id="plan-panel-comments"
          aria-labelledby="plan-tab-comments"
          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
        >
          <PlanCommentsSection
            planId={responses.planId}
            currentUser={responses.currentUser}
            comments={responses.comments}
          />
        </div>
      ) : null}
    </div>
  );
}
