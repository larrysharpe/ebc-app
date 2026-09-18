'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import {
  checkChurchSpaceConflictAction,
  createChurchEventAction,
  reviewActivityRequestAction,
  suggestEventTimeAction,
  updateChurchEventAction,
} from '@/modules/events/actions/church-event.actions';
import {
  ACTIVITY_FLOOR_PLAN_FIELD_UNITS,
  ACTIVITY_FLOOR_PLAN_FIELDS,
  ACTIVITY_FLOOR_PLAN_QTY_MAX,
  ACTIVITY_KITCHEN_FIELDS,
  ACTIVITY_MEDIA_FIELDS,
} from '@/modules/events/constants/activity-request.constants';
import {
  CUSTOM_INTERVAL_WEEKS_OPTIONS,
  EVENT_RECURRENCE_HORIZON_DAYS,
  EVENT_RECURRENCE_PATTERN_LABELS,
  EVENT_RECURRENCE_PATTERNS,
  WEEKDAY_SHORT_LABELS,
  type EventRecurrencePattern,
} from '@/modules/events/constants/event-recurrence.constants';
import type { EventTimeSuggestResponse } from '@/modules/events/schemas/event-time-suggest.schemas';
import type { ActivityRequestReviewResponse } from '@/modules/events/schemas/activity-request-review.schemas';
import type { ActivityRequest } from '@/modules/events/types/activity-request.types';
import {
  CHURCH_EVENT_TYPE_LABELS,
  CHURCH_EVENT_TYPES,
  type ChurchEvent,
  type ChurchEventType,
} from '@/modules/events/types/church-event.types';
import {
  buildActivityRequestDefaults,
  mergeActivityRequestWithDefaults,
  needsSaturdayTrusteeNote,
} from '@/modules/events/utils/activity-request-defaults.utils';
import {
  expandRecurrenceDates,
  formatRecurrenceLabel,
  isEventRecurrencePattern,
} from '@/modules/events/utils/event-recurrence.utils';
import {
  getLeadTimeBanner,
  getLeadTimeTierForDate,
} from '@/modules/events/utils/event-lead-time.utils';
import { formatOrdinalWeekday } from '@/modules/events/utils/ordinal-weekday.utils';
import { ChurchSpaceSelect } from '@/modules/facilities';
import {
  updateVoiceCoachPreferenceAction,
  type VoiceCoachPreference,
} from '@/modules/preferences';

import {
  EVENT_FORM_STEPS,
  eventFormStepIndex,
  type EventFormStepId,
} from './church-event-form.constants';
import { ActivityCoordinationStep } from './components/ActivityCoordinationStep';
import { ActivityFloorPlanStep } from './components/ActivityFloorPlanStep';
import { ActivityKitchenStep } from './components/ActivityKitchenStep';
import { ActivityMediaStep } from './components/ActivityMediaStep';
import { ActivityPeopleStep } from './components/ActivityPeopleStep';
import {
  EventFormVoiceCoach,
  unlockHtmlAudio,
  type EventFormIntakePatch,
  type EventFormVoiceCoachStatus,
  type EventFormVoiceCommand,
} from './components/EventFormVoiceCoach';
import { EventFormVoiceStoryPage } from './components/EventFormVoiceStoryPage';
import { EventPlaceSearch } from './components/EventPlaceSearch';

export type MinistryOption = {
  id: string;
  name: string;
};

type FormStatus = 'draft' | 'pending_approval' | 'scheduled';

export type ChurchEventFormProps = {
  ministries: MinistryOption[];
  /** Prefill and lock ministry (ministry calendar). */
  lockedMinistryId?: string;
  takenDates?: string[];
  /** When set, form updates this event instead of creating. */
  initialEvent?: ChurchEvent | null;
  /** Ministry calendars save as draft by default. */
  defaultStatus?: 'draft' | 'scheduled';
  /**
   * Ministry leaders must submit for approval instead of scheduling directly.
   * Staff Events page leaves this false.
   */
  requireApprovalToPublish?: boolean;
  /** Personal preference for the create-time voice coach offer. */
  voiceCoachPreference?: VoiceCoachPreference;
  onCancelEdit?: () => void;
  onSaved?: () => void;
};

type LocationMode = 'church' | 'offsite' | 'unset';

function formatSuggestionDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function resolveLocationMode(event: ChurchEvent | null | undefined): LocationMode {
  if (!event) return 'unset';
  if (event.spaceId) return 'church';
  if (event.location?.trim()) return 'offsite';
  return 'unset';
}

function spokenTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function clampFloorPlanQty(
  field: (typeof ACTIVITY_FLOOR_PLAN_FIELDS)[number],
  value: number,
): number {
  const max =
    ACTIVITY_FLOOR_PLAN_FIELD_UNITS[field] === null
      ? 1
      : ACTIVITY_FLOOR_PLAN_QTY_MAX;
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value)));
}

export function ChurchEventForm({
  ministries,
  lockedMinistryId,
  initialEvent = null,
  defaultStatus = 'scheduled',
  requireApprovalToPublish = false,
  voiceCoachPreference = 'ask',
  onCancelEdit,
  onSaved,
}: ChurchEventFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialEvent?.id);
  const [step, setStep] = useState<EventFormStepId>('basics');
  const [stepError, setStepError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSuggesting, startSuggestTransition] = useTransition();
  const [isSavingVoicePref, startVoicePrefTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [locationMode, setLocationMode] = useState<LocationMode>('unset');
  const [notes, setNotes] = useState('');
  const [recurrencePattern, setRecurrencePattern] =
    useState<EventRecurrencePattern>('none');
  const [recurrenceUntil, setRecurrenceUntil] = useState('');
  const [customWeekdays, setCustomWeekdays] = useState<number[]>([]);
  const [customIntervalWeeks, setCustomIntervalWeeks] = useState(1);
  const [preference, setPreference] = useState('');
  const [ministryId, setMinistryId] = useState(lockedMinistryId ?? '');
  const [eventType, setEventType] = useState<ChurchEventType>('other');
  const [status, setStatus] = useState<FormStatus>(
    requireApprovalToPublish && defaultStatus === 'scheduled'
      ? 'draft'
      : defaultStatus,
  );
  const [activityRequest, setActivityRequest] = useState<ActivityRequest>(() =>
    buildActivityRequestDefaults('other'),
  );
  const [suggestion, setSuggestion] = useState<EventTimeSuggestResponse | null>(
    null,
  );
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [review, setReview] = useState<ActivityRequestReviewResponse | null>(
    null,
  );
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewUsedAi, setReviewUsedAi] = useState(false);
  const [isReviewing, startReviewTransition] = useTransition();
  const [voicePreference, setVoicePreference] =
    useState<VoiceCoachPreference>(voiceCoachPreference);
  const [showVoiceOffer, setShowVoiceOffer] = useState(
    () => !isEditing && voiceCoachPreference === 'ask',
  );
  const [rememberVoiceChoice, setRememberVoiceChoice] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(
    () => !isEditing && voiceCoachPreference === 'on',
  );
  const [voiceSessionNonce, setVoiceSessionNonce] = useState(
    () => (!isEditing && voiceCoachPreference === 'on' ? 1 : 0),
  );
  const [showVoiceStory, setShowVoiceStory] = useState(
    () => !isEditing && voiceCoachPreference === 'on',
  );
  const [voiceStatus, setVoiceStatus] = useState<EventFormVoiceCoachStatus>({
    intakePhase: 'opening',
    isListening: false,
    lastHeard: null,
    lastReply: null,
  });
  const [voiceAnnounce, setVoiceAnnounce] = useState<string | null>(null);
  const ordinalWeekday = formatOrdinalWeekday(eventDate);
  const currentIndex = eventFormStepIndex(step);
  const leadTimeBanner = useMemo(
    () => getLeadTimeBanner(eventDate || undefined),
    [eventDate],
  );
  const saturdayTrusteeNote = needsSaturdayTrusteeNote(
    eventDate || undefined,
    startTime || undefined,
  );

  useEffect(() => {
    setVoicePreference(voiceCoachPreference);
    if (isEditing) {
      setShowVoiceOffer(false);
      return;
    }
    setShowVoiceOffer(voiceCoachPreference === 'ask');
    setVoiceEnabled(voiceCoachPreference === 'on');
    setShowVoiceStory(voiceCoachPreference === 'on');
    if (voiceCoachPreference === 'on') {
      setVoiceSessionNonce((current) => (current > 0 ? current : 1));
    }
    setVoiceStatus({
      intakePhase: 'opening',
      isListening: false,
      lastHeard: null,
      lastReply: null,
    });
  }, [voiceCoachPreference, isEditing]);

  useEffect(() => {
    if (!initialEvent) {
      setStep('basics');
      setStepError(null);
      setEventDate('');
      setStartTime('');
      setEndTime('');
      setTitle('');
      setLocation('');
      setSpaceId('');
      setLocationMode('unset');
      setNotes('');
      setRecurrencePattern('none');
      setRecurrenceUntil('');
      setCustomWeekdays([]);
      setCustomIntervalWeeks(1);
      setPreference('');
      setEventType('other');
      setStatus(
        requireApprovalToPublish && defaultStatus === 'scheduled'
          ? 'draft'
          : defaultStatus,
      );
      setActivityRequest(buildActivityRequestDefaults('other'));
      setMinistryId(lockedMinistryId ?? '');
      setSuggestion(null);
      setSuggestError(null);
      setConflictWarning(null);
      setReview(null);
      setReviewError(null);
      setReviewUsedAi(false);
      setError(null);
      setSuccess(null);
      setShowVoiceOffer(voicePreference === 'ask');
      setRememberVoiceChoice(false);
      setVoiceEnabled(voicePreference === 'on');
      setShowVoiceStory(voicePreference === 'on');
      setVoiceSessionNonce(voicePreference === 'on' ? 1 : 0);
      setVoiceStatus({
        intakePhase: 'opening',
        isListening: false,
        lastHeard: null,
        lastReply: null,
      });
      setVoiceAnnounce(null);
      return;
    }

    setStep('basics');
    setStepError(null);
    setEventDate(initialEvent.eventDate ?? '');
    setStartTime(initialEvent.startTime ?? '');
    setEndTime(initialEvent.endTime ?? '');
    setTitle(initialEvent.title);
    setLocation(initialEvent.location ?? '');
    setSpaceId(initialEvent.spaceId ?? '');
    setLocationMode(resolveLocationMode(initialEvent));
    setNotes(initialEvent.notes ?? '');
    setRecurrencePattern(
      initialEvent.recurrencePattern &&
        isEventRecurrencePattern(initialEvent.recurrencePattern)
        ? initialEvent.recurrencePattern
        : 'none',
    );
    setRecurrenceUntil('');
    setCustomWeekdays([]);
    setCustomIntervalWeeks(1);
    setEventType(initialEvent.eventType);
    setStatus(
      initialEvent.status === 'pending_approval'
        ? 'pending_approval'
        : initialEvent.status === 'draft'
          ? 'draft'
          : 'scheduled',
    );
    setActivityRequest(
      mergeActivityRequestWithDefaults(
        initialEvent.eventType,
        initialEvent.activityRequest,
      ),
    );
    setMinistryId(initialEvent.ministryId ?? lockedMinistryId ?? '');
    setSuggestion(null);
    setSuggestError(null);
    setConflictWarning(null);
    setReview(null);
    setReviewError(null);
    setReviewUsedAi(false);
    setError(null);
    setSuccess(null);
    setVoiceEnabled(false);
    setVoiceSessionNonce(0);
    setVoiceAnnounce(null);
    setShowVoiceOffer(false);
    setShowVoiceStory(false);
    setRememberVoiceChoice(false);
  }, [
    initialEvent,
    lockedMinistryId,
    defaultStatus,
    requireApprovalToPublish,
    voicePreference,
  ]);

  useEffect(() => {
    if (!spaceId || !eventDate || locationMode !== 'church') {
      setConflictWarning(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void checkChurchSpaceConflictAction({
        spaceId,
        eventDate,
        startTime,
        endTime,
        excludeEventId: initialEvent?.id,
        recurrencePattern: isEditing ? 'none' : recurrencePattern,
        recurrenceUntil: isEditing ? undefined : recurrenceUntil,
        recurrenceWeekdays:
          !isEditing && recurrencePattern === 'custom'
            ? customWeekdays
            : undefined,
        recurrenceIntervalWeeks:
          !isEditing && recurrencePattern === 'custom'
            ? customIntervalWeeks
            : undefined,
      }).then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setConflictWarning(null);
          return;
        }
        setConflictWarning(result.message);
      });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    spaceId,
    eventDate,
    startTime,
    endTime,
    recurrencePattern,
    recurrenceUntil,
    customWeekdays,
    customIntervalWeeks,
    isEditing,
    initialEvent?.id,
    locationMode,
  ]);

  useEffect(() => {
    setReview(null);
    setReviewError(null);
    setReviewUsedAi(false);
  }, [title, eventType, eventDate, startTime, endTime, location, spaceId, locationMode, notes, status, activityRequest]);

  const recurrencePreview = useMemo(() => {
    if (isEditing || recurrencePattern === 'none' || !eventDate) return null;
    if (recurrencePattern === 'custom' && customWeekdays.length === 0) {
      return null;
    }
    const dates = expandRecurrenceDates({
      startDate: eventDate,
      pattern: recurrencePattern,
      untilDate: recurrenceUntil || undefined,
      weekdays: customWeekdays,
      intervalWeeks: customIntervalWeeks,
    });
    const label = formatRecurrenceLabel(recurrencePattern, eventDate, {
      weekdays: customWeekdays,
      intervalWeeks: customIntervalWeeks,
    });
    return { dates, label };
  }, [
    eventDate,
    isEditing,
    recurrencePattern,
    recurrenceUntil,
    customWeekdays,
    customIntervalWeeks,
  ]);

  function resetCreateForm() {
    setStep('basics');
    setStepError(null);
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setTitle('');
    setLocation('');
    setSpaceId('');
    setLocationMode('unset');
    setNotes('');
    setRecurrencePattern('none');
    setRecurrenceUntil('');
    setCustomWeekdays([]);
    setCustomIntervalWeeks(1);
    setPreference('');
    setEventType('other');
    setStatus(
      requireApprovalToPublish && defaultStatus === 'scheduled'
        ? 'draft'
        : defaultStatus,
    );
    setActivityRequest(buildActivityRequestDefaults('other'));
    setSuggestion(null);
    setSuggestError(null);
    setConflictWarning(null);
    setReview(null);
    setReviewError(null);
    setReviewUsedAi(false);
    setShowVoiceOffer(voicePreference === 'ask');
    setRememberVoiceChoice(false);
    setVoiceEnabled(voicePreference === 'on');
    setShowVoiceStory(voicePreference === 'on');
    setVoiceSessionNonce(voicePreference === 'on' ? 1 : 0);
    setVoiceStatus({
      intakePhase: 'opening',
      isListening: false,
      lastHeard: null,
      lastReply: null,
    });
    setVoiceAnnounce(null);
    if (!lockedMinistryId) setMinistryId('');
  }

  function changeEventType(nextType: ChurchEventType) {
    setEventType(nextType);
    setActivityRequest((current) =>
      mergeActivityRequestWithDefaults(nextType, {
        ...current,
        media: buildActivityRequestDefaults(nextType).media,
        coordination: buildActivityRequestDefaults(nextType).coordination,
      }),
    );
  }

  function handleReviewCheck() {
    setReviewError(null);
    startReviewTransition(async () => {
      const result = await reviewActivityRequestAction({
        title,
        eventType,
        eventDate,
        startTime,
        endTime,
        location,
        spaceId: locationMode === 'church' ? spaceId : '',
        locationMode,
        notes,
        ministryId: lockedMinistryId ?? ministryId,
        ministryName: ministryLabel,
        status: requireApprovalToPublish ? 'pending_approval' : status,
        activityRequest,
        excludeEventId: initialEvent?.id,
        spaceConflictMessage: conflictWarning,
      });
      if (!result.ok) {
        setReview(null);
        setReviewError(result.error);
        return;
      }
      setReview(result.review);
      setReviewUsedAi(result.usedAi);
    });
  }

  function buildActivityPayload(nextStatus: FormStatus): ActivityRequest {
    const tier = getLeadTimeTierForDate(eventDate || undefined) ?? undefined;
    return {
      ...activityRequest,
      leadTimeTier: tier,
      acknowledgements: activityRequest.acknowledgements,
      submittedAt:
        nextStatus === 'pending_approval'
          ? new Date().toISOString()
          : activityRequest.submittedAt,
    };
  }

  function applySuggestion(item: EventTimeSuggestResponse['suggestions'][number]) {
    setEventDate(item.eventDate);
    setStartTime(item.startTime ?? '');
    setEndTime(item.endTime ?? '');
  }

  function handleSuggest(preferenceOverride?: string) {
    setSuggestError(null);
    if (preferenceOverride?.trim()) {
      setPreference(preferenceOverride.trim());
    }
    const preferenceValue = preferenceOverride?.trim() || preference;
    const recurringHint =
      recurrencePattern !== 'none' && eventDate
        ? formatRecurrenceLabel(recurrencePattern, eventDate, {
            weekdays: customWeekdays,
            intervalWeeks: customIntervalWeeks,
          })
        : undefined;
    startSuggestTransition(async () => {
      const result = await suggestEventTimeAction({
        title,
        eventType,
        location,
        notes,
        recurring: recurringHint,
        preference: preferenceValue,
        ministryId: lockedMinistryId ?? ministryId,
        ministryName: lockedMinistryId
          ? ministries.find((m) => m.id === lockedMinistryId)?.name
          : ministries.find((m) => m.id === ministryId)?.name,
      });
      if (!result.ok) {
        setSuggestion(null);
        setSuggestError(result.error);
        if (voiceEnabled) {
          setVoiceAnnounce(
            `Sorry, I could not suggest a time. ${result.error}`,
          );
        }
        return;
      }
      setSuggestion(result.suggestion);
      if (voiceEnabled) {
        const first = result.suggestion.suggestions[0];
        const firstHint = first
          ? ` The first option is ${formatSuggestionDate(first.eventDate)}${
              first.startTime ? ` at ${first.startTime}` : ''
            }. Say use the first one to pick it.`
          : '';
        setVoiceAnnounce(
          `${result.suggestion.summary}${firstHint}`,
        );
      }
    });
  }

  function validateStep(current: EventFormStepId): string | null {
    if (current === 'when') {
      if (recurrencePattern !== 'none' && !isEditing && !eventDate.trim()) {
        return 'Pick a start date before setting a repeat pattern.';
      }
      if (
        recurrencePattern === 'custom' &&
        !isEditing &&
        customWeekdays.length === 0
      ) {
        return 'Pick at least one weekday for a custom repeat.';
      }
      if (startTime && endTime && endTime <= startTime) {
        return 'End time must be after start time.';
      }
    }
    if (current === 'where') {
      if (locationMode === 'unset') {
        return 'Choose at the church or somewhere else.';
      }
      if (locationMode === 'church' && !spaceId) {
        return 'Pick a church room, or choose somewhere else.';
      }
      if (locationMode === 'church' && conflictWarning) {
        return conflictWarning;
      }
      if (locationMode === 'offsite' && !location.trim()) {
        return 'Search for a place or type the address.';
      }
    }
    if (current === 'kitchen') {
      const kitchen = activityRequest.kitchen;
      const anyItem = [
        kitchen.heatingCooking,
        kitchen.utensils,
        kitchen.plates,
        kitchen.cupsGlasses,
        kitchen.napkinsTableCloths,
        kitchen.coffee,
        kitchen.refrigeration,
        kitchen.freezer,
      ].some(Boolean);
      if (kitchen.noneConfirmed && !anyItem) return null;
      if (kitchen.needed && anyItem) return null;
      return 'Check kitchen / food needs from the list, or choose No kitchen / food needed.';
    }
    if (current === 'media') {
      const media = activityRequest.media;
      const anyItem = [
        media.sound,
        media.slides,
        media.livestream,
        media.camera,
        media.graphics,
        media.playback,
      ].some(Boolean);
      if (media.noneConfirmed && !anyItem) return null;
      if (media.needed && anyItem) return null;
      return 'Check what you need from the list, or choose No media needed.';
    }
    if (current === 'floorPlan') {
      const floorPlan = activityRequest.floorPlan;
      const anyItem = [
        floorPlan.theaterSeating,
        floorPlan.roundTables,
        floorPlan.classroomSeating,
        floorPlan.podium,
        floorPlan.registrationTable,
        floorPlan.servingTables,
        floorPlan.clearFloor,
        floorPlan.accessibilitySeating,
      ].some((qty) => Number(qty) > 0);
      if (floorPlan.noneConfirmed && !anyItem) return null;
      if (floorPlan.needed && anyItem) return null;
      return 'Check setup features and quantities, or choose No floor plan needed.';
    }
    if (current === 'review') {
      const ack = activityRequest.acknowledgements;
      if (
        !ack.cleanRoom ||
        !ack.noBannersWithoutPermission ||
        !ack.conflictMayReschedule
      ) {
        return 'Please confirm the three acknowledgements before saving.';
      }
      if (leadTimeBanner?.tier === 'emergency') {
        if (!activityRequest.emergencyReason?.trim()) {
          return 'Add a short reason for this emergency request.';
        }
        if (!activityRequest.willContactOffice) {
          return 'Confirm that you will contact the office.';
        }
      }
    }
    return null;
  }

  function goNext() {
    setStepError(null);
    setError(null);
    const message = validateStep(step);
    if (message) {
      setStepError(message);
      return;
    }
    const next = EVENT_FORM_STEPS[currentIndex + 1];
    if (next) setStep(next.id);
  }

  function goBack() {
    setStepError(null);
    setError(null);
    const prev = EVENT_FORM_STEPS[currentIndex - 1];
    if (prev) setStep(prev.id);
  }

  function chooseVoiceCoach(useVoice: boolean): void {
    setStepError(null);
    setError(null);
    setShowVoiceOffer(false);
    if (useVoice) {
      // Unlock HTML audio inside the click so shimmer TTS can play right away.
      unlockHtmlAudio();
    }
    setVoiceEnabled(useVoice);
    setShowVoiceStory(useVoice);
    if (useVoice) {
      setVoiceSessionNonce((current) => current + 1);
    } else {
      setVoiceSessionNonce(0);
    }
    setVoiceStatus({
      intakePhase: 'opening',
      isListening: false,
      lastHeard: null,
      lastReply: null,
    });
    setStep('basics');

    if (!rememberVoiceChoice) return;

    const nextPreference: VoiceCoachPreference = useVoice ? 'on' : 'off';
    setVoicePreference(nextPreference);
    startVoicePrefTransition(async () => {
      const result = await updateVoiceCoachPreferenceAction({
        voiceCoachPreference: nextPreference,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function finishVoiceStory(): void {
    setShowVoiceStory(false);
    setStep('basics');
    setStepError(null);
  }

  function applyIntakePatch(patch: EventFormIntakePatch): void {
    if (patch.title) setTitle(patch.title);
    if (patch.eventType) changeEventType(patch.eventType);
    if (patch.eventDate && patch.eventDate !== 'tbd') {
      setEventDate(patch.eventDate);
    }
    if (patch.startTime && patch.startTime !== 'tbd') {
      setStartTime(patch.startTime);
    }
    if (patch.endTime) setEndTime(patch.endTime);
    if (patch.locationMode) {
      setLocationMode(patch.locationMode);
      if (patch.locationMode === 'church') setLocation('');
      if (patch.locationMode === 'offsite') setSpaceId('');
    }
    if (patch.location && patch.location !== 'TBD') {
      setLocationMode('offsite');
      setSpaceId('');
      setLocation(patch.location);
    }
    if (patch.timePreference) setPreference(patch.timePreference);
    if (patch.suggestTime) {
      if (step !== 'when') setStep('when');
      handleSuggest(patch.timePreference);
    }

    setActivityRequest((current) => {
      let next = { ...current };
      if (patch.contactName && patch.contactName !== 'TBD') {
        next = { ...next, contactName: patch.contactName };
      }
      if (patch.contactPhone) {
        next = {
          ...next,
          contactPhone: patch.contactPhone.replace(/[^\d+\-() ]/g, '').trim(),
        };
      }
      if (
        patch.participantsEstimate != null &&
        patch.participantsEstimate >= 0
      ) {
        next = {
          ...next,
          participantsEstimate: patch.participantsEstimate,
        };
      }
      if (patch.guestSpeaker) {
        next = { ...next, guestSpeaker: patch.guestSpeaker };
      }
      if (patch.mediaNone) {
        next = {
          ...next,
          media: {
            ...next.media,
            needed: false,
            noneConfirmed: true,
            sound: false,
            slides: false,
            livestream: false,
            camera: false,
            graphics: false,
            playback: false,
          },
        };
      }
      if (patch.mediaNeed?.length) {
        const media = {
          ...next.media,
          noneConfirmed: false,
        };
        for (const field of patch.mediaNeed) {
          media[field] = true;
        }
        next = {
          ...next,
          media: {
            ...media,
            needed: ACTIVITY_MEDIA_FIELDS.some((field) => media[field]),
          },
        };
      }
      if (patch.kitchenNone) {
        next = {
          ...next,
          kitchen: {
            ...next.kitchen,
            needed: false,
            noneConfirmed: true,
            heatingCooking: false,
            utensils: false,
            plates: false,
            cupsGlasses: false,
            napkinsTableCloths: false,
            coffee: false,
            refrigeration: false,
            freezer: false,
          },
        };
      }
      if (patch.kitchenNeed?.length) {
        const kitchen = {
          ...next.kitchen,
          noneConfirmed: false,
        };
        for (const field of patch.kitchenNeed) {
          kitchen[field] = true;
        }
        next = {
          ...next,
          kitchen: {
            ...kitchen,
            needed: ACTIVITY_KITCHEN_FIELDS.some((field) => kitchen[field]),
          },
        };
      }
      if (patch.floorPlanNone) {
        next = {
          ...next,
          floorPlan: {
            ...next.floorPlan,
            needed: false,
            noneConfirmed: true,
            theaterSeating: 0,
            roundTables: 0,
            classroomSeating: 0,
            podium: 0,
            registrationTable: 0,
            servingTables: 0,
            clearFloor: 0,
            accessibilitySeating: 0,
          },
        };
      }
      if (patch.floorPlanQty?.length) {
        const floorPlan = {
          ...next.floorPlan,
          noneConfirmed: false,
        };
        for (const item of patch.floorPlanQty) {
          floorPlan[item.field] = clampFloorPlanQty(item.field, item.qty);
        }
        next = {
          ...next,
          floorPlan: {
            ...floorPlan,
            needed: ACTIVITY_FLOOR_PLAN_FIELDS.some(
              (field) => Number(floorPlan[field]) > 0,
            ),
          },
        };
      }
      if (patch.helpFrom?.length) {
        const helpFrom = new Set([
          ...next.coordination.helpFrom,
          ...patch.helpFrom,
        ]);
        next = {
          ...next,
          coordination: {
            ...next.coordination,
            helpFrom: [...helpFrom],
          },
        };
      }
      if (patch.ackAll) {
        next = {
          ...next,
          acknowledgements: {
            cleanRoom: true,
            noBannersWithoutPermission: true,
            conflictMayReschedule: true,
          },
          willContactOffice:
            leadTimeBanner?.tier === 'emergency'
              ? true
              : next.willContactOffice,
        };
      }
      return next;
    });
  }

  function handleVoiceCommand(
    command: EventFormVoiceCommand,
  ): string | void {
    switch (command.type) {
      case 'help':
      case 'repeat':
      case 'unknown':
        return;
      case 'stop':
        setVoiceEnabled(false);
        setShowVoiceStory(false);
        return 'Okay. Voice control is off.';
      case 'next': {
        const message = validateStep(step);
        if (message) {
          setStepError(message);
          return message;
        }
        setStepError(null);
        setError(null);
        const next = EVENT_FORM_STEPS[currentIndex + 1];
        if (!next) return 'You are already on the last step.';
        setStep(next.id);
        return 'Continuing.';
      }
      case 'back': {
        const prev = EVENT_FORM_STEPS[currentIndex - 1];
        if (!prev) return 'You are already on the first step.';
        setStepError(null);
        setError(null);
        setStep(prev.id);
        return 'Going back.';
      }
      case 'goToStep':
        setStepError(null);
        setError(null);
        setStep(command.step);
        return;
      case 'setTitle':
        setTitle(spokenTitleCase(command.title));
        return;
      case 'setEventType':
        changeEventType(command.eventType);
        return;
      case 'setEventDate':
        setEventDate(command.eventDate);
        return;
      case 'setStartTime':
        setStartTime(command.startTime);
        return;
      case 'setEndTime':
        setEndTime(command.endTime);
        return;
      case 'setLocationMode':
        setLocationMode(command.mode);
        if (command.mode === 'church') {
          setLocation('');
        } else {
          setSpaceId('');
        }
        return;
      case 'setLocation':
        setLocationMode('offsite');
        setSpaceId('');
        setLocation(spokenTitleCase(command.location));
        return;
      case 'setContactName':
        setActivityRequest((current) => ({
          ...current,
          contactName: spokenTitleCase(command.name),
        }));
        return;
      case 'setContactPhone':
        setActivityRequest((current) => ({
          ...current,
          contactPhone: command.phone.replace(/[^\d+\-() ]/g, '').trim(),
        }));
        return;
      case 'setParticipants':
        setActivityRequest((current) => ({
          ...current,
          participantsEstimate: command.count,
        }));
        return;
      case 'setGuestSpeaker':
        setActivityRequest((current) => ({
          ...current,
          guestSpeaker: spokenTitleCase(command.name),
        }));
        return;
      case 'mediaNone':
        setActivityRequest((current) => ({
          ...current,
          media: {
            ...current.media,
            needed: false,
            noneConfirmed: true,
            sound: false,
            slides: false,
            livestream: false,
            camera: false,
            graphics: false,
            playback: false,
          },
        }));
        return;
      case 'mediaNeed':
        setActivityRequest((current) => {
          const media = {
            ...current.media,
            [command.field]: true,
            noneConfirmed: false,
          };
          const needed = ACTIVITY_MEDIA_FIELDS.some((field) => media[field]);
          return { ...current, media: { ...media, needed } };
        });
        return;
      case 'kitchenNone':
        setActivityRequest((current) => ({
          ...current,
          kitchen: {
            ...current.kitchen,
            needed: false,
            noneConfirmed: true,
            heatingCooking: false,
            utensils: false,
            plates: false,
            cupsGlasses: false,
            napkinsTableCloths: false,
            coffee: false,
            refrigeration: false,
            freezer: false,
          },
        }));
        return;
      case 'kitchenNeed':
        setActivityRequest((current) => {
          const kitchen = {
            ...current.kitchen,
            [command.field]: true,
            noneConfirmed: false,
          };
          const needed = ACTIVITY_KITCHEN_FIELDS.some(
            (field) => kitchen[field],
          );
          return { ...current, kitchen: { ...kitchen, needed } };
        });
        return;
      case 'floorPlanNone':
        setActivityRequest((current) => ({
          ...current,
          floorPlan: {
            ...current.floorPlan,
            needed: false,
            noneConfirmed: true,
            theaterSeating: 0,
            roundTables: 0,
            classroomSeating: 0,
            podium: 0,
            registrationTable: 0,
            servingTables: 0,
            clearFloor: 0,
            accessibilitySeating: 0,
          },
        }));
        return;
      case 'floorPlanQty': {
        const qty = clampFloorPlanQty(command.field, command.qty);
        setActivityRequest((current) => {
          const floorPlan = {
            ...current.floorPlan,
            [command.field]: qty,
            noneConfirmed: false,
          };
          const needed = ACTIVITY_FLOOR_PLAN_FIELDS.some(
            (field) => Number(floorPlan[field]) > 0,
          );
          return { ...current, floorPlan: { ...floorPlan, needed } };
        });
        return;
      }
      case 'toggleHelpFrom':
        setActivityRequest((current) => {
          const helpFrom = current.coordination.helpFrom;
          const selected = helpFrom.includes(command.help);
          return {
            ...current,
            coordination: {
              ...current.coordination,
              helpFrom: selected
                ? helpFrom.filter((item) => item !== command.help)
                : [...helpFrom, command.help],
            },
          };
        });
        return;
      case 'ackAll':
        setActivityRequest((current) => ({
          ...current,
          acknowledgements: {
            cleanRoom: true,
            noBannersWithoutPermission: true,
            conflictMayReschedule: true,
          },
          willContactOffice:
            leadTimeBanner?.tier === 'emergency'
              ? true
              : current.willContactOffice,
        }));
        return;
      case 'setTimePreference':
        if (step !== 'when') setStep('when');
        setPreference(command.preference);
        return;
      case 'suggestTime':
        if (step !== 'when') setStep('when');
        handleSuggest(command.preference);
        return;
      case 'useSuggestion': {
        if (step !== 'when') setStep('when');
        const item = suggestion?.suggestions[command.index];
        if (!item) {
          return 'I do not have that suggestion yet. Ask me to suggest a time first.';
        }
        applySuggestion(item);
        return;
      }
      case 'runReview':
        if (step !== 'review') setStep('review');
        handleReviewCheck();
        return;
      case 'saveDraft':
        if (step !== 'review') setStep('review');
        saveEvent('draft');
        return;
      case 'submitApproval':
        if (step !== 'review') setStep('review');
        if (requireApprovalToPublish) {
          saveEvent('pending_approval');
          return;
        }
        saveEvent(status === 'draft' ? 'scheduled' : status);
        return;
      default:
        return;
    }
  }

  function saveEvent(nextStatus: FormStatus = status) {
    setError(null);
    setSuccess(null);
    setStepError(null);

    const whereError = validateStep('where');
    if (whereError) {
      setStep('where');
      setStepError(whereError);
      return;
    }
    const whenError = validateStep('when');
    if (whenError) {
      setStep('when');
      setStepError(whenError);
      return;
    }
    const formReviewError = validateStep('review');
    if (formReviewError) {
      setStep('review');
      setStepError(formReviewError);
      return;
    }
    if (review?.status === 'blocked' && nextStatus !== 'draft') {
      setStep('review');
      setStepError(
        'Fix the problems from Check for problems before submitting, or run the check again after you change the form.',
      );
      return;
    }

    const activityPayload = buildActivityPayload(nextStatus);

    startTransition(async () => {
      if (isEditing && initialEvent) {
        const result = await updateChurchEventAction(initialEvent.id, {
          eventDate,
          title,
          startTime,
          endTime,
          location,
          spaceId: locationMode === 'church' ? spaceId : '',
          notes,
          eventType,
          status: nextStatus,
          activityRequest: activityPayload,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSuccess(
          nextStatus === 'pending_approval'
            ? 'Submitted for approval.'
            : 'Event saved.',
        );
        onSaved?.();
        router.refresh();
        return;
      }

      const result = await createChurchEventAction({
        eventDate,
        title,
        startTime,
        endTime,
        location,
        spaceId: locationMode === 'church' ? spaceId : '',
        notes,
        recurrencePattern,
        recurrenceUntil,
        recurrenceWeekdays:
          recurrencePattern === 'custom' ? customWeekdays : undefined,
        recurrenceIntervalWeeks:
          recurrencePattern === 'custom' ? customIntervalWeeks : undefined,
        eventType,
        ministryId: lockedMinistryId ?? ministryId,
        status: nextStatus,
        activityRequest: activityPayload,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(
        result.createdCount > 1
          ? `Added ${result.createdCount} dates.`
          : nextStatus === 'pending_approval'
            ? 'Submitted for approval.'
            : nextStatus === 'draft'
              ? 'Draft event saved.'
              : 'Event added.',
      );
      resetCreateForm();
      onSaved?.();
      router.refresh();
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (showVoiceOffer || showVoiceStory) {
      return;
    }
    if (step !== 'review') {
      goNext();
      return;
    }
    if (requireApprovalToPublish) {
      saveEvent('draft');
      return;
    }
    saveEvent(status === 'pending_approval' ? 'scheduled' : status);
  }

  const ministryLabel = lockedMinistryId
    ? ministries.find((m) => m.id === lockedMinistryId)?.name ?? 'This ministry'
    : ministryId
      ? ministries.find((m) => m.id === ministryId)?.name ?? 'Ministry'
      : 'Church-wide';

  return (
    <form onSubmit={handleSubmit} className="ebc-card space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-ebc-burgundy">
            {isEditing ? 'Edit event' : 'Add event'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isEditing
              ? 'Step through the details — updates this date only.'
              : lockedMinistryId
                ? 'A few short steps. Saved as a draft until you publish.'
                : 'A few short steps — date and time are optional while planning.'}
          </p>
        </div>
        {isEditing && onCancelEdit ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      {showVoiceOffer ? (
        <div className="space-y-4 rounded-xl bg-ebc-burgundy px-4 py-6 text-white sm:px-6">
          <div>
            <h3 className="text-xl font-semibold">Use the voice coach?</h3>
            <p className="mt-2 text-base text-white/90">
              I can listen while you describe the event, fill in the form, and
              ask short follow-up questions. Or you can type everything
              yourself.
            </p>
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => chooseVoiceCoach(true)}
              disabled={isSavingVoicePref}
              className="ebc-choice min-h-11 border-white/40 bg-white text-ebc-burgundy hover:bg-white"
            >
              <span className="text-base font-semibold">Yes — use voice</span>
            </button>
            <button
              type="button"
              onClick={() => chooseVoiceCoach(false)}
              disabled={isSavingVoicePref}
              className="ebc-choice min-h-11 border-white/50 bg-transparent text-white hover:bg-white/10"
            >
              <span className="text-base font-semibold">No — I will type it</span>
            </button>
          </div>
          <label className="ebc-choice min-h-11 border-white/40 bg-white/10 text-white">
            <input
              type="checkbox"
              checked={rememberVoiceChoice}
              onChange={(e) => setRememberVoiceChoice(e.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-white/50"
            />
            <span>
              <span className="block text-sm font-medium">
                Remember my choice
              </span>
              <span className="mt-0.5 block text-xs font-normal text-white/80">
                Save this as a personal setting. Change it anytime under Account
                → Preferences.
              </span>
            </span>
          </label>
          {isSavingVoicePref ? (
            <p className="text-sm text-white/80">Saving your preference…</p>
          ) : null}
        </div>
      ) : (
        <>
      {showVoiceStory && voiceEnabled ? (
        <EventFormVoiceStoryPage
          intakePhase={voiceStatus.intakePhase}
          isListening={voiceStatus.isListening}
          lastHeard={voiceStatus.lastHeard}
          lastReply={voiceStatus.lastReply}
          onContinue={finishVoiceStory}
        />
      ) : (
        <ol className="flex flex-wrap gap-2" aria-label="Event steps">
          {EVENT_FORM_STEPS.map((item, index) => {
            const active = item.id === step;
            const done = index < currentIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (index <= currentIndex) {
                      setStepError(null);
                      setStep(item.id);
                    }
                  }}
                  disabled={index > currentIndex}
                  className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-ebc-burgundy text-white'
                      : done
                        ? 'border border-ebc-burgundy/30 text-ebc-burgundy'
                        : 'border border-slate-200 text-slate-400'
                  }`}
                >
                  {index + 1}. {item.label}
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <EventFormVoiceCoach
        step={step}
        enabled={voiceEnabled}
        sessionNonce={voiceSessionNonce}
        embedded={showVoiceStory && voiceEnabled}
        onEnabledChange={(next) => {
          setVoiceEnabled(next);
          if (!next) {
            setVoiceSessionNonce(0);
            setShowVoiceStory(false);
          }
        }}
        onIntakePatch={applyIntakePatch}
        onCommand={handleVoiceCommand}
        onStatusChange={setVoiceStatus}
        announceText={voiceAnnounce}
      />

      {showVoiceStory && voiceEnabled ? null : (
        <>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {stepError ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {stepError}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-ebc-green/30 bg-ebc-green/5 px-3 py-2 text-sm text-ebc-green-dark">
          {success}
        </p>
      ) : null}

      {step === 'basics' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VBS kickoff, Board meeting"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Type</span>
            <select
              value={eventType}
              onChange={(e) =>
                changeEventType(e.target.value as ChurchEventType)
              }
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            >
              {CHURCH_EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {CHURCH_EVENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-slate-500">
              Bible study / class vs meeting changes media defaults.
            </span>
          </label>
          {!requireApprovalToPublish ? (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                value={status === 'pending_approval' ? 'draft' : status}
                onChange={(e) =>
                  setStatus(e.target.value as 'draft' | 'scheduled')
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled (published)</option>
              </select>
            </label>
          ) : (
            <div className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <p className="mt-2 text-sm text-slate-600">
                Saved as a draft, or submit for office/trustee approval on the
                last step.
              </p>
            </div>
          )}
          {lockedMinistryId ? (
            <input type="hidden" name="ministryId" value={lockedMinistryId} />
          ) : (
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Ministry</span>
              <select
                value={ministryId}
                onChange={(e) => setMinistryId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
              >
                <option value="">Church-wide</option>
                {ministries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      ) : null}

      {step === 'when' ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <aside className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <h3 className="text-base font-semibold text-ebc-burgundy">
                Suggest time
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Not sure when to meet? Tell us what you’re hoping for, and we’ll
                check the church calendar for open windows. Tap a suggestion to
                fill the date and times on the right.
              </p>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                What are you looking for?
              </span>
              <input
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                placeholder="e.g. Friday evening, Saturday morning"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base"
              />
            </label>
            <button
              type="button"
              disabled={isSuggesting || isPending}
              onClick={() => handleSuggest()}
              className="ebc-action-secondary min-h-11 w-full"
            >
              {isSuggesting ? 'Checking calendar…' : 'Suggest time'}
            </button>
            {suggestError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {suggestError}
              </p>
            ) : null}
            {suggestion ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-sm text-slate-700">{suggestion.summary}</p>
                <ul className="space-y-2">
                  {suggestion.suggestions.map((item) => (
                    <li
                      key={`${item.eventDate}-${item.startTime ?? ''}-${item.reason}`}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-slate-200 px-3 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {formatSuggestionDate(item.eventDate)}
                          {item.startTime
                            ? ` · ${item.startTime}${item.endTime ? `–${item.endTime}` : ''}`
                            : ''}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">{item.reason}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => applySuggestion(item)}
                        className="min-h-11 rounded-lg border border-ebc-burgundy/30 px-3 py-1.5 text-xs font-medium text-ebc-burgundy hover:bg-ebc-burgundy/5"
                      >
                        Use this
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>

          <div className="grid gap-4 sm:grid-cols-2">
            {leadTimeBanner ? (
              <p
                role="status"
                className={`sm:col-span-2 rounded-lg border px-3 py-2 text-sm ${
                  leadTimeBanner.tone === 'red'
                    ? 'border-red-300 bg-red-50 text-red-800'
                    : leadTimeBanner.tone === 'amber'
                      ? 'border-amber-300 bg-amber-50 text-amber-900'
                      : leadTimeBanner.tone === 'info'
                        ? 'border-ebc-navy/20 bg-ebc-navy/5 text-ebc-navy'
                        : 'border-ebc-green/30 bg-ebc-green/5 text-ebc-green-dark'
                }`}
              >
                {leadTimeBanner.message}
              </p>
            ) : null}
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                {recurrencePattern === 'none' || isEditing ? 'Date' : 'Start date'}
                {recurrencePattern !== 'none' && !isEditing ? ' *' : ''}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <input
                  name="eventDate"
                  type="date"
                  required={recurrencePattern !== 'none' && !isEditing}
                  value={eventDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    setEventDate(next);
                    if (
                      recurrencePattern === 'custom' &&
                      customWeekdays.length === 0 &&
                      next
                    ) {
                      const day = new Date(`${next}T12:00:00`).getDay();
                      setCustomWeekdays([day]);
                    }
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base"
                />
                {ordinalWeekday ? (
                  <span className="shrink-0 text-sm font-medium text-ebc-burgundy">
                    {ordinalWeekday}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-slate-500">Optional</span>
                )}
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start time</span>
              <input
                name="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">End time</span>
              <input
                name="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
              />
            </label>

            {!isEditing ? (
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Repeats</span>
                <select
                  value={recurrencePattern}
                  onChange={(e) => {
                    const next = e.target.value as EventRecurrencePattern;
                    setRecurrencePattern(next);
                    if (next === 'custom' && customWeekdays.length === 0) {
                      if (eventDate) {
                        const day = new Date(`${eventDate}T12:00:00`).getDay();
                        setCustomWeekdays([day]);
                      }
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
                >
                  {EVENT_RECURRENCE_PATTERNS.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {EVENT_RECURRENCE_PATTERN_LABELS[pattern]}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Series</span>
                <p className="mt-2 text-sm text-slate-600">
                  {initialEvent?.recurring
                    ? `↻ ${initialEvent.recurring} (this date only)`
                    : 'One-time / this date only'}
                </p>
              </div>
            )}

            {!isEditing && recurrencePattern === 'custom' ? (
              <div className="space-y-4 sm:col-span-2">
                <fieldset>
                  <legend className="text-sm font-medium text-slate-700">
                    Which days?
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {WEEKDAY_SHORT_LABELS.map((label, day) => {
                      const selected = customWeekdays.includes(day);
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            setCustomWeekdays((current) =>
                              selected
                                ? current.filter((value) => value !== day)
                                : [...current, day].sort((a, b) => a - b),
                            );
                          }}
                          className={`ebc-choice min-h-11 min-w-11 rounded-lg px-3 py-2 text-sm font-medium ${
                            selected
                              ? 'border-ebc-burgundy bg-ebc-burgundy text-white'
                              : 'border border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Every how many weeks?
                  </span>
                  <select
                    value={customIntervalWeeks}
                    onChange={(e) =>
                      setCustomIntervalWeeks(Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
                  >
                    {CUSTOM_INTERVAL_WEEKS_OPTIONS.map((weeks) => (
                      <option key={weeks} value={weeks}>
                        {weeks === 1 ? 'Every week' : `Every ${weeks} weeks`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {!isEditing && recurrencePattern !== 'none' ? (
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Create through (optional)
                </span>
                <input
                  type="date"
                  value={recurrenceUntil}
                  min={eventDate || undefined}
                  onChange={(e) => setRecurrenceUntil(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Defaults to about {EVENT_RECURRENCE_HORIZON_DAYS} days ahead.
                  {recurrencePreview
                    ? ` Will add ${recurrencePreview.dates.length} date${
                        recurrencePreview.dates.length === 1 ? '' : 's'
                      }${
                        recurrencePreview.label
                          ? ` · ${recurrencePreview.label}`
                          : ''
                      }.`
                    : ''}
                </span>
              </label>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 'where' ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Where is this happening?</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setLocationMode('church');
                setLocation('');
                setSpaceId('');
                setStepError(null);
              }}
              className={`ebc-choice min-h-11 rounded-xl border px-4 py-4 text-left ${
                locationMode === 'church'
                  ? 'border-ebc-burgundy bg-ebc-burgundy/5'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <span className="block text-base font-semibold text-slate-900">
                At the church
              </span>
              <span className="mt-1 block text-sm text-slate-600">
                Pick a room — we’ll check for conflicts
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                const fromChurch = locationMode === 'church';
                setLocationMode('offsite');
                setSpaceId('');
                if (fromChurch) setLocation('');
                setConflictWarning(null);
                setStepError(null);
              }}
              className={`ebc-choice min-h-11 rounded-xl border px-4 py-4 text-left ${
                locationMode === 'offsite'
                  ? 'border-ebc-burgundy bg-ebc-burgundy/5'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <span className="block text-base font-semibold text-slate-900">
                Somewhere else
              </span>
              <span className="mt-1 block text-sm text-slate-600">
                Search a place or type an address
              </span>
            </button>
          </div>

          {locationMode === 'church' ? (
            <div className="space-y-3">
              <ChurchSpaceSelect
                label="Church room"
                value={location}
                spaceId={spaceId || undefined}
                allowOther={false}
                onChange={(next) => {
                  setLocation(next.location);
                  setSpaceId(next.spaceId ?? '');
                }}
              />
              {conflictWarning ? (
                <p
                  role="alert"
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"
                >
                  {conflictWarning}
                </p>
              ) : null}
            </div>
          ) : null}

          {locationMode === 'offsite' ? (
            <EventPlaceSearch
              value={location}
              onChange={(next) => {
                setLocation(next);
                setSpaceId('');
              }}
            />
          ) : null}
        </div>
      ) : null}

      {step === 'people' ? (
        <ActivityPeopleStep
          value={activityRequest}
          onChange={setActivityRequest}
        />
      ) : null}

      {step === 'kitchen' ? (
        <ActivityKitchenStep
          value={activityRequest}
          onChange={setActivityRequest}
        />
      ) : null}

      {step === 'media' ? (
        <ActivityMediaStep
          eventType={eventType}
          value={activityRequest}
          onChange={setActivityRequest}
        />
      ) : null}

      {step === 'floorPlan' ? (
        <ActivityFloorPlanStep
          value={activityRequest}
          onChange={setActivityRequest}
        />
      ) : null}

      {step === 'coordination' ? (
        <ActivityCoordinationStep
          value={activityRequest}
          onChange={setActivityRequest}
          showSaturdayTrusteeNote={saturdayTrusteeNote}
        />
      ) : null}

      {step === 'review' ? (
        <div className="space-y-4">
          <dl className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm">
            <div>
              <dt className="font-medium text-slate-500">Title</dt>
              <dd className="mt-0.5 text-slate-900">{title.trim() || 'Untitled event'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Type · Status</dt>
              <dd className="mt-0.5 text-slate-900">
                {CHURCH_EVENT_TYPE_LABELS[eventType]} ·{' '}
                {requireApprovalToPublish
                  ? 'Draft until approved'
                  : status === 'draft'
                    ? 'Draft'
                    : 'Scheduled'}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Ministry</dt>
              <dd className="mt-0.5 text-slate-900">{ministryLabel}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">When</dt>
              <dd className="mt-0.5 text-slate-900">
                {eventDate || 'Date TBD'}
                {startTime
                  ? ` · ${startTime}${endTime ? `–${endTime}` : ''}`
                  : ''}
                {!isEditing && recurrencePattern !== 'none'
                  ? ` · ${
                      recurrencePreview?.label ??
                      EVENT_RECURRENCE_PATTERN_LABELS[recurrencePattern]
                    }`
                  : ''}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Where</dt>
              <dd className="mt-0.5 text-slate-900">
                {location.trim() ||
                  (locationMode === 'church' ? 'Church room TBD' : 'Not set')}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">People & setup</dt>
              <dd className="mt-0.5 text-slate-900">
                {activityRequest.contactName?.trim() || 'Contact TBD'}
                {activityRequest.participantsEstimate != null
                  ? ` · ~${activityRequest.participantsEstimate} people`
                  : ''}
                {activityRequest.kitchen.needed ? ' · Kitchen needed' : ''}
                {activityRequest.media.needed ? ' · Media needed' : ''}
                {activityRequest.floorPlan.needed
                  ? ' · Floor plan / setup'
                  : ''}
              </dd>
            </div>
          </dl>

          {leadTimeBanner?.tier === 'emergency' ? (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
              <p className="text-sm font-medium text-red-800">
                Emergency timing — contact the office
              </p>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Short reason
                </span>
                <textarea
                  value={activityRequest.emergencyReason ?? ''}
                  onChange={(e) =>
                    setActivityRequest({
                      ...activityRequest,
                      emergencyReason: e.target.value,
                    })
                  }
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base"
                  placeholder="Why this needs to happen on short notice"
                />
              </label>
              <label className="ebc-choice">
                <input
                  type="checkbox"
                  checked={Boolean(activityRequest.willContactOffice)}
                  onChange={(e) =>
                    setActivityRequest({
                      ...activityRequest,
                      willContactOffice: e.target.checked,
                    })
                  }
                  className="h-4 w-4 shrink-0 rounded border-slate-300"
                />
                <span className="text-sm font-medium">
                  I&apos;ll contact the church office
                </span>
              </label>
            </div>
          ) : null}

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700">
              Acknowledgements
            </legend>
            {(
              [
                [
                  'cleanRoom',
                  'We will leave the room clean and return furniture as found',
                ],
                [
                  'noBannersWithoutPermission',
                  'No banners or signage without office permission',
                ],
                [
                  'conflictMayReschedule',
                  'I understand a room conflict may require rescheduling',
                ],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="ebc-choice">
                <input
                  type="checkbox"
                  checked={activityRequest.acknowledgements[key]}
                  onChange={(e) =>
                    setActivityRequest({
                      ...activityRequest,
                      acknowledgements: {
                        ...activityRequest.acknowledgements,
                        [key]: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 shrink-0 rounded border-slate-300"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </fieldset>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white px-4 py-4">
            <div>
              <h3 className="text-base font-semibold text-ebc-burgundy">
                Check for problems
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Looks for room conflicts, incomplete checklist answers, and
                other issues before you save.
              </p>
            </div>
            <button
              type="button"
              disabled={isReviewing || isPending}
              onClick={handleReviewCheck}
              className="ebc-action-secondary min-h-11 w-full sm:w-auto"
            >
              {isReviewing ? 'Checking…' : 'Check for problems'}
            </button>
            {reviewError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {reviewError}
              </p>
            ) : null}
            {review ? (
              <div
                className={`space-y-3 rounded-lg border px-3 py-3 ${
                  review.status === 'blocked'
                    ? 'border-red-300 bg-red-50'
                    : review.status === 'needs_attention'
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-ebc-green/30 bg-ebc-green/5'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    review.status === 'blocked'
                      ? 'text-red-800'
                      : review.status === 'needs_attention'
                        ? 'text-amber-900'
                        : 'text-ebc-green-dark'
                  }`}
                >
                  {review.summary}
                </p>
                {review.findings.length > 0 ? (
                  <ul className="space-y-2">
                    {review.findings.map((finding) => (
                      <li
                        key={`${finding.severity}-${finding.area}-${finding.message}`}
                        className="text-sm text-slate-800"
                      >
                        <span className="font-semibold uppercase tracking-wide text-xs text-slate-500">
                          {finding.severity}
                        </span>
                        <span className="mt-0.5 block">{finding.message}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="text-xs text-slate-500">
                  {reviewUsedAi
                    ? 'Checked with AI plus the church calendar.'
                    : 'Checked with calendar and form rules.'}
                </p>
              </div>
            ) : null}
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Notes (optional)</span>
            <textarea
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base"
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        {currentIndex > 0 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={isPending}
            className="ebc-action-secondary min-h-11 w-full sm:w-auto"
          >
            Back
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}
        {step === 'review' ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {requireApprovalToPublish ? (
              <>
                <button
                  type="button"
                  disabled={isPending || Boolean(conflictWarning)}
                  onClick={() => saveEvent('draft')}
                  className="ebc-action-secondary min-h-11 w-full sm:w-auto disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Save draft'}
                </button>
                <button
                  type="button"
                  disabled={isPending || Boolean(conflictWarning)}
                  onClick={() => saveEvent('pending_approval')}
                  className="ebc-action-primary min-h-11 w-full sm:w-auto disabled:opacity-50"
                >
                  {isPending ? 'Submitting…' : 'Submit for approval'}
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={isPending || Boolean(conflictWarning)}
                className="ebc-action-primary min-h-11 w-full sm:w-auto disabled:opacity-50"
              >
                {isPending
                  ? 'Saving…'
                  : conflictWarning
                    ? 'Resolve room conflict'
                    : isEditing
                      ? 'Save changes'
                      : recurrencePreview && recurrencePreview.dates.length > 1
                        ? `Add ${recurrencePreview.dates.length} dates`
                        : status === 'draft'
                          ? 'Save draft'
                          : 'Add event'}
              </button>
            )}
          </div>
        ) : (
          <button
            type="submit"
            disabled={isPending}
            className="ebc-action-primary min-h-11 w-full sm:w-auto"
          >
            Continue
          </button>
        )}
      </div>
        </>
      )}
        </>
      )}
    </form>
  );
}
