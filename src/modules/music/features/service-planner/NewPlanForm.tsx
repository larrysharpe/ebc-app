'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import {
  normalizeRichTextValue,
  RichTextContent,
  RichTextEditor,
} from '@/components/ui/RichTextEditor';
import {
  formatChurchEventDisplayTitle,
  type ChurchEvent,
} from '@/modules/events/types/church-event.types';
import { ChurchSpaceSelect } from '@/modules/facilities';
import {
  createPlanAction,
  savePlanAction,
} from '@/modules/music/actions/music.actions';
import type {
  ChoirGroup,
  PlanPractice,
  ServiceMusicPlan,
  Song,
} from '@/modules/music/types';
import type { Choir } from '@/modules/music/types/choir.types';
import { isCombinedChoir } from '@/modules/music/types/choir.types';
import type { ChoirDirectorSettings } from '@/modules/music/types/director-settings.types';
import { getActiveChoirs, getChoirName } from '@/modules/music/utils/choir.utils';
import {
  formatSundayLabel,
  getDefaultSundayForChoir,
  getNextServiceDateForChoir,
} from '@/modules/music/utils/choir-schedule.utils';
import { buildPlanDefaultsFromSettings } from '@/modules/music/utils/director-settings.utils';
import { buildPlanEmailBody } from '@/modules/music/utils/music.format';
import { createEmptyPractice, withSyncedPractices } from '@/modules/music/utils/plan-practice.utils';
import { normalizePlanServiceRoleInput } from '@/modules/music/utils/plan-service-role.utils';

import {
  buildExistingPlansByEventId,
  ChurchEventPicker,
  formatEventPickerDate,
} from './components/ChurchEventPicker';
import { PlanPreviewPanel } from './components/PlanPreviewPanel';
import { PlanServiceRoleField } from './components/PlanServiceRoleField';
import { PlanSetListEditor } from './components/PlanSetListEditor';
import { SendPlanButton } from './components/SendPlanButton';
import {
  NEW_PLAN_STEP_COUNT,
  NEW_PLAN_STEPS,
  type NewPlanStepId,
} from './new-plan-form.constants';

export type NewPlanFormProps = {
  settings: ChoirDirectorSettings;
  churchEvents: ChurchEvent[];
  choirs: Choir[];
  songs: Song[];
  existingPlans?: ServiceMusicPlan[];
  canSendPlans?: boolean;
  /** Prefill when opened with a known upcoming Sunday. */
  initialServiceDate?: string;
};

const NONE_EVENT = '';

function formatServiceTimeRange(start?: string, end?: string): string {
  if (start && end) return `${start}–${end}`;
  if (start) return start;
  if (end) return `until ${end}`;
  return 'Time TBD';
}

function stepIndex(step: NewPlanStepId): number {
  return NEW_PLAN_STEPS.findIndex((item) => item.id === step);
}

export function NewPlanForm({
  settings,
  churchEvents,
  choirs,
  songs,
  existingPlans = [],
  canSendPlans = false,
  initialServiceDate = '',
}: NewPlanFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<NewPlanStepId>('event');
  const [stepError, setStepError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ServiceMusicPlan | null>(null);
  const existingPlansByEventId = useMemo(
    () => buildExistingPlansByEventId(churchEvents, existingPlans),
    [churchEvents, existingPlans],
  );

  const choirOptions = getActiveChoirs(choirs);
  const initialChoir =
    choirOptions.find((choir) => choir.id === settings.defaultChoirGroup)?.id ??
    choirOptions[0]?.id ??
    settings.defaultChoirGroup;
  const initialDate =
    initialServiceDate || getNextServiceDateForChoir(initialChoir);
  const initialDefaults = buildPlanDefaultsFromSettings(initialDate, settings);

  const [churchEventId, setChurchEventId] = useState(NONE_EVENT);
  const [choirGroup, setChoirGroup] = useState<ChoirGroup>(
    initialServiceDate ? initialDefaults.choirGroup : initialChoir,
  );
  const [serviceDate, setServiceDate] = useState(initialDate);
  const [serviceStartTime, setServiceStartTime] = useState(
    initialDefaults.serviceStartTime,
  );
  const [serviceEndTime, setServiceEndTime] = useState(initialDefaults.serviceEndTime);
  const [practices, setPractices] = useState<PlanPractice[]>(initialDefaults.practices);
  const [occasion, setOccasion] = useState('');
  const [title, setTitle] = useState('');
  const [attire, setAttire] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [directorNotes, setDirectorNotes] = useState('');
  const [postServiceMessage, setPostServiceMessage] = useState('');
  const [scriptureReader, setScriptureReader] = useState('');
  const [prayerLeader, setPrayerLeader] = useState('');

  const currentIndex = stepIndex(step);
  const rotationSunday = getDefaultSundayForChoir(choirGroup);
  const plainText = plan ? buildPlanEmailBody(plan, songs) : '';

  function applyDateDefaults(nextServiceDate: string, keepChoir?: ChoirGroup) {
    const next = buildPlanDefaultsFromSettings(nextServiceDate, settings);
    setChoirGroup(keepChoir ?? next.choirGroup);
    setServiceStartTime(next.serviceStartTime);
    setServiceEndTime(next.serviceEndTime);
    setPractices(next.practices);
  }

  function updatePractice(id: string, patch: Partial<PlanPractice>) {
    setPractices((current) =>
      current.map((practice) =>
        practice.id === id ? { ...practice, ...patch } : practice,
      ),
    );
  }

  function cleanedPractices(): PlanPractice[] {
    return practices.filter(
      (practice) =>
        practice.date ||
        practice.startTime ||
        practice.endTime ||
        practice.location,
    );
  }

  function handleChurchEventChange(id: string) {
    if (plan) return;
    setChurchEventId(id);
    if (!id) {
      const nextDate = getNextServiceDateForChoir(choirGroup);
      setServiceDate(nextDate);
      applyDateDefaults(nextDate, choirGroup);
      return;
    }

    const event = churchEvents.find((item) => item.id === id);
    if (!event?.eventDate) return;

    setServiceDate(event.eventDate);
    const next = buildPlanDefaultsFromSettings(event.eventDate, settings);
    setChoirGroup(next.choirGroup);
    setServiceStartTime(event.startTime || next.serviceStartTime);
    setServiceEndTime(event.endTime || next.serviceEndTime);
    setPractices(next.practices);
    const displayTitle = formatChurchEventDisplayTitle(event);
    setOccasion(event.title.trim() || displayTitle);
    if (!title.trim()) {
      setTitle(`${displayTitle} · ${getChoirName(next.choirGroup, choirs)}`);
    }
  }

  function handleChoirChange(group: ChoirGroup) {
    setChoirGroup(group);
    if (plan) return;
    if (churchEventId) {
      applyDateDefaults(serviceDate, group);
      return;
    }
    const nextDate = getNextServiceDateForChoir(group);
    setServiceDate(nextDate);
    applyDateDefaults(nextDate, group);
  }

  async function persistDraft(): Promise<
    { ok: true; plan: ServiceMusicPlan } | { ok: false; error: string }
  > {
    if (!title.trim()) {
      return { ok: false, error: 'Add a plan title to continue.' };
    }

    const practiceRows = cleanedPractices();

    if (!plan) {
      return createPlanAction({
        title: title.trim(),
        serviceDate,
        churchEventId: churchEventId || undefined,
        choirGroup,
        serviceStartTime: serviceStartTime || undefined,
        serviceEndTime: serviceEndTime || undefined,
        practices: practiceRows,
        occasion: occasion.trim() || undefined,
        attire: attire.trim() || undefined,
        arrivalTime: arrivalTime || undefined,
        scriptureReader: normalizePlanServiceRoleInput(scriptureReader),
        prayerLeader: normalizePlanServiceRoleInput(prayerLeader),
        directorNotes: normalizeRichTextValue(directorNotes),
        postServiceMessage: normalizeRichTextValue(postServiceMessage),
      });
    }

    const updated = withSyncedPractices(
      {
        ...plan,
        title: title.trim(),
        serviceDate,
        choirGroup,
        serviceStartTime: serviceStartTime || undefined,
        serviceEndTime: serviceEndTime || undefined,
        occasion: occasion.trim() || undefined,
        attire: attire.trim() || undefined,
        arrivalTime: arrivalTime || undefined,
        scriptureReader: normalizePlanServiceRoleInput(scriptureReader),
        prayerLeader: normalizePlanServiceRoleInput(prayerLeader),
        directorNotes: normalizeRichTextValue(directorNotes),
        postServiceMessage: normalizeRichTextValue(postServiceMessage),
      },
      practiceRows,
    );
    return savePlanAction(updated);
  }

  function goNext() {
    setStepError(null);
    setError(null);

    if (step === 'choir' && !title.trim()) {
      setStepError('Add a plan title to continue.');
      return;
    }

    if (step === 'details') {
      startTransition(async () => {
        const result = await persistDraft();
        if (!result.ok) {
          if (result.error.toLowerCase().includes('title')) {
            setStep('choir');
            setStepError(result.error);
            return;
          }
          setError(result.error);
          return;
        }
        setPlan(result.plan);
        setStep('setlist');
      });
      return;
    }

    const next = NEW_PLAN_STEPS[currentIndex + 1];
    if (next) setStep(next.id);
  }

  function goBack() {
    setStepError(null);
    setError(null);
    const prev = NEW_PLAN_STEPS[currentIndex - 1];
    if (prev) setStep(prev.id);
  }

  function handleFinish() {
    if (!plan) return;
    router.push(`/music/plans/${plan.id}`);
    router.refresh();
  }

  const eventLocked = Boolean(plan);

  return (
    <div className="ebc-card flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ebc-burgundy">
            Step {currentIndex + 1} of {NEW_PLAN_STEP_COUNT}
          </p>
          <p className="text-xs text-slate-500">{NEW_PLAN_STEPS[currentIndex]?.label}</p>
        </div>
        <ol className="mt-3 flex gap-1.5" aria-label="Plan creation progress">
          {NEW_PLAN_STEPS.map((item, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <li key={item.id} className="min-w-0 flex-1">
                <div
                  className={`h-1.5 rounded-full ${
                    done || active ? 'bg-ebc-burgundy' : 'bg-slate-200'
                  }`}
                  aria-current={active ? 'step' : undefined}
                />
                <p
                  className={`mt-1 truncate text-[10px] font-medium sm:text-xs ${
                    active ? 'text-ebc-burgundy' : 'text-slate-400'
                  }`}
                >
                  {item.shortLabel}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {stepError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {stepError}
        </p>
      ) : null}
      {plan && step !== 'preview' ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 sm:text-sm">
          Draft saved — you can leave and finish later from Choir plans.
        </p>
      ) : null}

      <div className="min-h-0">
        {step === 'event' ? (
          <div className="space-y-3">
            {eventLocked ? (
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Event is locked after the draft is saved. Change it later on the
                plan page if needed.
              </p>
            ) : null}
            <ChurchEventPicker
              events={churchEvents}
              value={churchEventId}
              onChange={handleChurchEventChange}
              existingPlansByEventId={existingPlansByEventId}
            />
          </div>
        ) : null}

        {step === 'choir' ? (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Plan title *</span>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. 2nd Sunday Youth Chapel Choir"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Choir group</span>
              <select
                value={choirGroup}
                onChange={(event) => handleChoirChange(event.target.value as ChoirGroup)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                {choirOptions.map((choir) => (
                  <option key={choir.id} value={choir.id}>
                    {choir.name}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-slate-500">
                {isCombinedChoir(choirGroup)
                  ? 'Combined Choir — name which groups in Occasion (e.g. Youth + Senior).'
                  : churchEventId
                    ? 'Choir for this event.'
                    : `Sets the next ${formatSundayLabel(rotationSunday)} from rotation.`}
              </span>
            </label>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Service: </span>
              {formatEventPickerDate(serviceDate)}
              {serviceStartTime
                ? ` · ${formatServiceTimeRange(serviceStartTime, serviceEndTime)}`
                : ''}
            </div>
          </div>
        ) : null}

        {step === 'practice' ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-600">
                When should this choir rehearse before the engagement? Defaults come
                from director settings (relative weeks before the service).
              </p>
              <button
                type="button"
                onClick={() =>
                  setPractices((current) => [
                    ...current,
                    createEmptyPractice({
                      date: current[current.length - 1]?.date ?? '',
                      startTime: current[current.length - 1]?.startTime ?? '09:00',
                      endTime: current[current.length - 1]?.endTime ?? '11:00',
                    }),
                  ])
                }
                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Add practice
              </button>
            </div>

            {practices.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                No practices yet. Tap Add practice to schedule a rehearsal.
              </p>
            ) : (
              <ul className="space-y-3">
                {practices.map((practice, index) => (
                  <li
                    key={practice.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
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
                        <span className="text-sm font-medium text-slate-700">Date</span>
                        <input
                          type="date"
                          value={practice.date}
                          onChange={(event) =>
                            updatePractice(practice.id, { date: event.target.value })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="text-sm font-medium text-slate-700">Start</span>
                        <input
                          type="time"
                          value={practice.startTime ?? ''}
                          onChange={(event) =>
                            updatePractice(practice.id, {
                              startTime: event.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block min-w-0">
                        <span className="text-sm font-medium text-slate-700">End</span>
                        <input
                          type="time"
                          value={practice.endTime ?? ''}
                          onChange={(event) =>
                            updatePractice(practice.id, {
                              endTime: event.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
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
                        selectClassName="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {step === 'details' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Optional details for the choir — you can still edit these later.
            </p>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Occasion</span>
              <input
                value={occasion}
                onChange={(event) => setOccasion(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Attire</span>
              <input
                value={attire}
                onChange={(event) => setAttire(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Arrival time</span>
              <input
                type="time"
                value={arrivalTime}
                onChange={(event) => setArrivalTime(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
              <span className="mt-1 block text-xs text-slate-500">
                When the choir should arrive for the service.
              </span>
            </label>
            <PlanServiceRoleField
              name="scriptureReader"
              label="Scripture reader"
              value={scriptureReader}
              onChange={setScriptureReader}
            />
            <PlanServiceRoleField
              name="prayerLeader"
              label="Prayer leader"
              value={prayerLeader}
              onChange={setPrayerLeader}
            />
            <RichTextEditor
              label="Director notes"
              value={directorNotes}
              onChange={setDirectorNotes}
              placeholder="Notes for the choir about practice, call time, or this service…"
              disabled={isPending}
            />
            <RichTextEditor
              label="Post-service thank you"
              value={postServiceMessage}
              onChange={setPostServiceMessage}
              placeholder="Thank the choir after the service — bold, lists, and links welcome…"
              disabled={isPending}
              minHeightClassName="min-h-[11rem]"
            />
          </div>
        ) : null}

        {step === 'setlist' && plan ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Add service slots and put a song in each one. Changes save as you go.
            </p>
            <PlanSetListEditor
              plan={plan}
              songs={songs}
              onPlanChange={setPlan}
              onError={setError}
            />
          </div>
        ) : null}

        {step === 'preview' && plan ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Review what the choir will see. Share now, or finish and share later.
            </p>
            <PlanPreviewPanel plan={plan} songs={songs} plainText={plainText} />
            {plan.postServiceMessage ? (
              <section className="rounded-xl border border-green-200 bg-green-50 p-5">
                <h3 className="font-semibold text-green-900">Post-service thank you</h3>
                <div className="mt-3">
                  <RichTextContent
                    value={plan.postServiceMessage}
                    className="text-sm leading-relaxed text-green-900/90 [&_a]:font-medium [&_a]:text-ebc-green [&_a]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5"
                  />
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-1 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 supports-[backdrop-filter]:bg-white/90">
        <div className="flex flex-wrap items-center gap-2">
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={isPending}
              className="inline-flex h-11 min-w-[5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:min-w-[5.5rem] sm:px-4"
            >
              Back
            </button>
          ) : null}

          <button
            type="button"
            onClick={() =>
              plan
                ? router.push(`/music/plans/${plan.id}`)
                : router.push('/music/plans')
            }
            disabled={isPending}
            className="inline-flex h-11 min-w-[5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:min-w-[5.5rem] sm:px-4"
          >
            {plan ? 'Save & exit' : 'Cancel'}
          </button>

          {step === 'preview' && plan && canSendPlans ? (
            <div className="shrink-0">
              <SendPlanButton planId={plan.id} disabled={isPending} />
            </div>
          ) : null}

          {step !== 'preview' ? (
            <button
              type="button"
              onClick={goNext}
              disabled={isPending || (step === 'setlist' && !plan)}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-ebc-burgundy px-4 text-sm font-semibold text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
            >
              {isPending && step === 'details' ? 'Saving draft…' : 'Continue'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!plan}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-ebc-burgundy px-4 text-sm font-semibold text-white hover:bg-ebc-burgundy-dark disabled:opacity-50"
            >
              Open plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
