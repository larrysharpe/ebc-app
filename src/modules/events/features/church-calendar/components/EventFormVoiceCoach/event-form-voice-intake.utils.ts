import type {
  ActivityFloorPlanField,
  ActivityHelpFrom,
  ActivityKitchenField,
  ActivityMediaField,
} from '@/modules/events/constants/activity-request.constants';
import {
  CHURCH_EVENT_TYPE_LABELS,
  type ChurchEventType,
} from '@/modules/events/types/church-event.types';

import {
  parseEventFormVoiceCommand,
  softenConversationalText,
  type EventFormVoiceCommand,
} from './event-form-voice.utils';
import {
  createIntakeSession,
  getIntakeOpeningPrompt,
  getIntakeSkipOpeningPrompt,
  INTAKE_SLOT_ORDER,
  type EventFormIntakePatch,
  type IntakeKnownState,
  type IntakeSession,
  type IntakeSlotId,
  type IntakeTurnResult,
} from './event-form-voice-intake.types';

export {
  createIntakeSession,
  getIntakeOpeningPrompt,
  getIntakeSkipOpeningPrompt,
  INTAKE_SLOT_ORDER,
};
export type {
  EventFormIntakePatch,
  IntakeKnownState,
  IntakeSession,
  IntakeSlotId,
  IntakeTurnResult,
};

const TYPE_ALIASES: Record<ChurchEventType, string[]> = {
  worship: ['worship', 'sunday worship', 'sunday service'],
  education: ['education', 'class', 'bible study', 'bible class', 'workshop'],
  meeting: ['meeting', 'prayer meeting', 'prayer'],
  outreach: ['outreach'],
  special: ['special', 'special service'],
  other: ['other'],
};

function isYes(text: string): boolean {
  return /^(yes|yeah|yep|yup|sure|correct|that s right|thats right|we do|we will|needed|we need some)$/.test(
    text,
  ) || text.startsWith('yes ');
}

function isNo(text: string): boolean {
  return /^(no|nope|nah|none|nothing|not needed|we do not|we dont|do not|dont)$/.test(
    text,
  ) ||
    text.startsWith('no ') ||
    text.includes('not needed') ||
    text.includes('do not need') ||
    text.includes('dont need');
}

function spokenTitleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function matchEventType(text: string): ChurchEventType | null {
  const soft = softenConversationalText(text);
  const entries = Object.entries(TYPE_ALIASES) as [ChurchEventType, string[]][];
  entries.sort((a, b) => {
    const aMax = Math.max(...a[1].map((p) => p.length));
    const bMax = Math.max(...b[1].map((p) => p.length));
    return bMax - aMax;
  });
  for (const [key, phrases] of entries) {
    for (const phrase of phrases) {
      if (soft === phrase || soft.includes(phrase)) return key;
    }
  }
  return null;
}

function commandsFromTranscript(transcript: string): EventFormVoiceCommand[] {
  const found: EventFormVoiceCommand[] = [];
  const seen = new Set<string>();

  function push(command: EventFormVoiceCommand): void {
    if (command.type === 'unknown') return;
    const key = JSON.stringify(command);
    if (seen.has(key)) return;
    seen.add(key);
    found.push(command);
  }

  // Preserve clause breaks before softening fillers.
  const clauseSource = transcript
    .toLowerCase()
    .replace(/[!?']/g, ' ')
    .replace(/[.,;]/g, ' | ')
    .replace(/\s+/g, ' ')
    .trim();
  const soft = softenConversationalText(transcript);

  push(parseEventFormVoiceCommand(transcript));

  const chunks = `${clauseSource} | ${soft}`
    .split(/\||\band\b|\bthen\b|\balso\b|\bit is\b|\bit s\b|\bits\b/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 2);

  for (const chunk of chunks) {
    push(parseEventFormVoiceCommand(chunk));
  }

  // Dedicated multi-fact pulls from the full softened line.
  const title = soft.match(
    /(?:title is|the title is|called|named|name is)\s+(.+?)(?:\s+(?:on|at|in|for|with|contact|about|and|it is|type|we)\b|$)/,
  );
  if (title?.[1]) {
    push({ type: 'setTitle', title: title[1].trim() });
  }

  const typeMatch = soft.match(
    /(?:type is|this is a|this is an|it is a|it is an)\s+([a-z ]+?)(?:\s+(?:on|at|in|for|with|contact|about|and)\b|$)/,
  );
  if (typeMatch?.[1]) {
    const eventType = matchEventType(typeMatch[1]);
    if (eventType) push({ type: 'setEventType', eventType });
  } else {
    const eventType = matchEventType(soft);
    if (eventType && soft.includes(eventType === 'education' ? 'bible' : eventType)) {
      push({ type: 'setEventType', eventType });
    }
  }

  const dateIso = soft.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (dateIso) {
    push({ type: 'setEventDate', eventDate: dateIso[1]! });
  }

  const contact = soft.match(
    /(?:contact is|contact name is|my name is)\s+([a-z][a-z ]{0,40}?)(?:\s+(?:about|and|phone|at|on|we)\b|$)/,
  );
  if (contact?.[1]) {
    push({ type: 'setContactName', name: contact[1].trim() });
  }

  const people = soft.match(
    /(?:about|around)?\s*(\d{1,3})\s+people/,
  );
  if (people?.[1]) {
    push({ type: 'setParticipants', count: Number(people[1]) });
  }

  if (soft.includes('at the church') || soft.includes('at church')) {
    push({ type: 'setLocationMode', mode: 'church' });
  }

  if (
    soft.includes('no media needed') ||
    soft.includes('no media') ||
    soft.includes('dont need media')
  ) {
    push({ type: 'mediaNone' });
  }
  if (
    soft.includes('no kitchen') ||
    soft.includes('no food needed') ||
    soft.includes('dont need kitchen')
  ) {
    push({ type: 'kitchenNone' });
  }
  if (
    soft.includes('no floor plan') ||
    soft.includes('no setup needed') ||
    soft.includes('dont need a floor plan')
  ) {
    push({ type: 'floorPlanNone' });
  }

  for (const field of [
    'sound',
    'slides',
    'livestream',
    'camera',
    'graphics',
    'playback',
  ] as const) {
    if (soft.includes(`need ${field}`) || soft.includes(`needs ${field}`)) {
      push({ type: 'mediaNeed', field });
    }
  }

  return found;
}

export function patchFromVoiceCommands(
  commands: EventFormVoiceCommand[],
): EventFormIntakePatch {
  const patch: EventFormIntakePatch = {};
  const mediaNeed: ActivityMediaField[] = [];
  const kitchenNeed: ActivityKitchenField[] = [];
  const floorPlanQty: NonNullable<EventFormIntakePatch['floorPlanQty']> = [];
  const helpFrom: ActivityHelpFrom[] = [];

  for (const command of commands) {
    switch (command.type) {
      case 'setTitle':
        patch.title = spokenTitleCase(command.title);
        break;
      case 'setEventType':
        patch.eventType = command.eventType;
        break;
      case 'setEventDate':
        patch.eventDate = command.eventDate;
        break;
      case 'setStartTime':
        patch.startTime = command.startTime;
        break;
      case 'setEndTime':
        patch.endTime = command.endTime;
        break;
      case 'setLocationMode':
        patch.locationMode = command.mode;
        break;
      case 'setLocation':
        patch.locationMode = 'offsite';
        patch.location = spokenTitleCase(command.location);
        break;
      case 'setContactName':
        patch.contactName = spokenTitleCase(command.name);
        break;
      case 'setContactPhone':
        patch.contactPhone = command.phone;
        break;
      case 'setParticipants':
        patch.participantsEstimate = command.count;
        break;
      case 'setGuestSpeaker':
        patch.guestSpeaker = spokenTitleCase(command.name);
        break;
      case 'setTimePreference':
        patch.timePreference = command.preference;
        break;
      case 'suggestTime':
        patch.suggestTime = true;
        if (command.preference) patch.timePreference = command.preference;
        break;
      case 'mediaNone':
        patch.mediaNone = true;
        break;
      case 'mediaNeed':
        mediaNeed.push(command.field);
        break;
      case 'kitchenNone':
        patch.kitchenNone = true;
        break;
      case 'kitchenNeed':
        kitchenNeed.push(command.field);
        break;
      case 'floorPlanNone':
        patch.floorPlanNone = true;
        break;
      case 'floorPlanQty':
        floorPlanQty.push({ field: command.field, qty: command.qty });
        break;
      case 'toggleHelpFrom':
        helpFrom.push(command.help);
        break;
      case 'ackAll':
        patch.ackAll = true;
        break;
      default:
        break;
    }
  }

  if (mediaNeed.length > 0) patch.mediaNeed = [...new Set(mediaNeed)];
  if (kitchenNeed.length > 0) patch.kitchenNeed = [...new Set(kitchenNeed)];
  if (floorPlanQty.length > 0) patch.floorPlanQty = floorPlanQty;
  if (helpFrom.length > 0) patch.helpFrom = [...new Set(helpFrom)];
  return patch;
}

export function mergeIntakeKnown(
  known: IntakeKnownState,
  patch: EventFormIntakePatch,
): IntakeKnownState {
  const next: IntakeKnownState = { ...known };
  if (patch.title) next.title = patch.title;
  if (patch.eventType) next.eventType = patch.eventType;
  if (patch.eventDate) next.eventDate = patch.eventDate;
  if (patch.startTime) next.startTime = patch.startTime;
  if (patch.endTime) next.endTime = patch.endTime;
  if (patch.locationMode) next.locationMode = patch.locationMode;
  if (patch.location) next.location = patch.location;
  if (patch.contactName) next.contactName = patch.contactName;
  if (patch.contactPhone) next.contactPhone = patch.contactPhone;
  if (patch.participantsEstimate != null) {
    next.participantsEstimate = patch.participantsEstimate;
  }
  if (patch.guestSpeaker) next.guestSpeaker = patch.guestSpeaker;
  if (patch.mediaNone || (patch.mediaNeed && patch.mediaNeed.length > 0)) {
    next.mediaResolved = true;
  }
  if (patch.kitchenNone || (patch.kitchenNeed && patch.kitchenNeed.length > 0)) {
    next.kitchenResolved = true;
  }
  if (
    patch.floorPlanNone ||
    (patch.floorPlanQty && patch.floorPlanQty.length > 0)
  ) {
    next.floorPlanResolved = true;
  }
  return next;
}

function slotFilled(known: IntakeKnownState, slot: IntakeSlotId): boolean {
  switch (slot) {
    case 'title':
      return Boolean(known.title?.trim());
    case 'eventType':
      return Boolean(known.eventType);
    case 'eventDate':
      return Boolean(known.eventDate);
    case 'startTime':
      return Boolean(known.startTime);
    case 'locationMode':
      return Boolean(known.locationMode);
    case 'location':
      return (
        known.locationMode === 'church' || Boolean(known.location?.trim())
      );
    case 'contactName':
      return Boolean(known.contactName?.trim());
    case 'participants':
      return known.participantsEstimate != null;
    case 'media':
      return Boolean(known.mediaResolved);
    case 'kitchen':
      return Boolean(known.kitchenResolved);
    case 'floorPlan':
      return Boolean(known.floorPlanResolved);
    default:
      return true;
  }
}

export function nextMissingSlot(
  known: IntakeKnownState,
): IntakeSlotId | null {
  for (const slot of INTAKE_SLOT_ORDER) {
    if (!slotFilled(known, slot)) return slot;
  }
  return null;
}

export function questionForSlot(slot: IntakeSlotId): string {
  switch (slot) {
    case 'title':
      return 'What should we call this event?';
    case 'eventType':
      return 'What kind of event is it — worship, class or Bible study, meeting, outreach, special service, or other?';
    case 'eventDate':
      return 'What date is it on? You can say something like September 18 2026, or ask me to suggest a time.';
    case 'startTime':
      return 'What time does it start?';
    case 'locationMode':
      return 'Is it at the church, or somewhere else?';
    case 'location':
      return 'Where is it? You can say the room or the address.';
    case 'contactName':
      return 'Who is the main contact person?';
    case 'participants':
      return 'About how many people do you expect?';
    case 'media':
      return 'Do you need any media — like sound, slides, livestream, camera, or music or video played? Or say no media needed.';
    case 'kitchen':
      return 'Do you need anything from the kitchen or for food — plates, coffee, fridge — or say no kitchen needed?';
    case 'floorPlan':
      return 'Do you need a room setup — like round tables or theater seating — or say no floor plan needed?';
    default:
      return 'What else should I know?';
  }
}

function summarizeCaptured(patch: EventFormIntakePatch): string {
  const bits: string[] = [];
  if (patch.title) bits.push(`title ${patch.title}`);
  if (patch.eventType) bits.push(CHURCH_EVENT_TYPE_LABELS[patch.eventType]);
  if (patch.eventDate) bits.push(`date ${patch.eventDate}`);
  if (patch.startTime) bits.push(`starts ${patch.startTime}`);
  if (patch.locationMode === 'church') bits.push('at the church');
  if (patch.location) bits.push(`at ${patch.location}`);
  if (patch.contactName) bits.push(`contact ${patch.contactName}`);
  if (patch.participantsEstimate != null) {
    bits.push(`about ${patch.participantsEstimate} people`);
  }
  if (patch.mediaNone) bits.push('no media');
  if (patch.mediaNeed?.length) bits.push(`media ${patch.mediaNeed.join(', ')}`);
  if (patch.kitchenNone) bits.push('no kitchen');
  if (patch.kitchenNeed?.length) {
    bits.push(`kitchen ${patch.kitchenNeed.join(', ')}`);
  }
  if (patch.floorPlanNone) bits.push('no floor plan');
  if (bits.length === 0) return '';
  if (bits.length === 1) return `Got it — ${bits[0]}.`;
  return `Got it — ${bits.slice(0, -1).join(', ')}, and ${bits[bits.length - 1]}.`;
}

function contextualPatchForSlot(
  slot: IntakeSlotId,
  transcript: string,
): EventFormIntakePatch {
  const soft = softenConversationalText(transcript);
  if (!soft) return {};

  switch (slot) {
    case 'title':
      return { title: spokenTitleCase(soft) };
    case 'eventType': {
      const eventType = matchEventType(soft);
      return eventType ? { eventType } : {};
    }
    case 'eventDate': {
      const command = parseEventFormVoiceCommand(`date is ${soft}`);
      if (command.type === 'setEventDate') {
        return { eventDate: command.eventDate };
      }
      if (command.type === 'suggestTime') {
        return {
          suggestTime: true,
          timePreference: command.preference,
        };
      }
      return {};
    }
    case 'startTime': {
      const command = parseEventFormVoiceCommand(`starts at ${soft}`);
      if (command.type === 'setStartTime') {
        return { startTime: command.startTime };
      }
      return {};
    }
    case 'locationMode':
      if (soft.includes('church')) return { locationMode: 'church' };
      if (
        soft.includes('somewhere else') ||
        soft.includes('off site') ||
        soft.includes('offsite') ||
        soft.includes('elsewhere')
      ) {
        return { locationMode: 'offsite' };
      }
      return {};
    case 'location':
      return { locationMode: 'offsite', location: spokenTitleCase(soft) };
    case 'contactName':
      return { contactName: spokenTitleCase(soft) };
    case 'participants': {
      const command = parseEventFormVoiceCommand(`people ${soft}`);
      if (command.type === 'setParticipants') {
        return { participantsEstimate: command.count };
      }
      return {};
    }
    case 'media':
      if (isNo(soft)) return { mediaNone: true };
      if (isYes(soft)) return {};
      return patchFromVoiceCommands(commandsFromTranscript(transcript));
    case 'kitchen':
      if (isNo(soft)) return { kitchenNone: true };
      return patchFromVoiceCommands(commandsFromTranscript(transcript));
    case 'floorPlan':
      if (isNo(soft)) return { floorPlanNone: true };
      return patchFromVoiceCommands(commandsFromTranscript(transcript));
    default:
      return {};
  }
}

function patchHasContent(patch: EventFormIntakePatch): boolean {
  return Object.keys(patch).length > 0;
}

/**
 * One conversational turn: open story or answer a clarifying question.
 */
export function processIntakeTurn(
  session: IntakeSession,
  transcript: string,
): IntakeTurnResult {
  const soft = softenConversationalText(transcript);

  if (
    soft.includes('stop listening') ||
    soft === 'stop' ||
    soft === 'cancel' ||
    soft.includes('turn off voice')
  ) {
    return {
      session,
      patch: {},
      reply: 'Okay, I will stop listening.',
      exitIntake: true,
    };
  }

  if (
    soft === 'skip' ||
    soft === 'skip that' ||
    soft === 'not sure' ||
    soft === 'i do not know' ||
    soft === 'i dont know' ||
    soft === 'pass'
  ) {
    if (session.phase === 'clarifying' && session.pendingSlot) {
      if (
        session.pendingSlot === 'title' ||
        session.pendingSlot === 'eventType'
      ) {
        return {
          session,
          patch: {},
          reply: `I still need that one. ${questionForSlot(session.pendingSlot)}`,
        };
      }
      const knownAfter = markSlotSkipped(session.known, session.pendingSlot);
      const following = nextMissingSlot(knownAfter);
      if (!following) {
        return {
          session: {
            phase: 'ready',
            known: knownAfter,
            pendingSlot: null,
            openingCollected: true,
          },
          patch: {},
          reply:
            'Okay, we can skip that. I have enough to start. Look over the form, say continue through the steps, or tell me more anytime.',
        };
      }
      return {
        session: {
          phase: 'clarifying',
          known: knownAfter,
          pendingSlot: following,
          openingCollected: true,
        },
        patch: {},
        reply: `Okay, we can skip that. ${questionForSlot(following)}`,
      };
    }
  }

  if (
    soft.includes('that is all') ||
    soft.includes('thats all') ||
    soft.includes('that s everything') ||
    soft.includes('thats everything') ||
    soft.includes('i am done') ||
    soft.includes('im done') ||
    soft.includes('finished')
  ) {
    if (session.phase === 'opening' && !session.openingCollected) {
      // treat as empty opening complete → start clarifying
      const nextSlot = nextMissingSlot(session.known);
      if (!nextSlot) {
        return {
          session: {
            phase: 'ready',
            known: session.known,
            pendingSlot: null,
            openingCollected: true,
          },
          patch: {},
          reply:
            'Great. Look over the form when you are ready, or say continue.',
        };
      }
      return {
        session: {
          phase: 'clarifying',
          known: session.known,
          pendingSlot: nextSlot,
          openingCollected: true,
        },
        patch: {},
        reply: `Okay. ${questionForSlot(nextSlot)}`,
      };
    }
  }

  let patch = patchFromVoiceCommands(commandsFromTranscript(transcript));

  if (
    session.phase === 'clarifying' &&
    session.pendingSlot &&
    !patchHasContent(patch)
  ) {
    patch = contextualPatchForSlot(session.pendingSlot, transcript);
  }

  // Opening: also try contextual title if nothing parsed but long utterance
  if (
    session.phase === 'opening' &&
    !patch.title &&
    soft.split(' ').length >= 2 &&
    soft.split(' ').length <= 6 &&
    !patchHasContent(patch)
  ) {
    // short utterance alone might be the title later; during opening wait for richer speech
  }

  if (!patchHasContent(patch) && session.phase === 'opening') {
    return {
      session,
      patch: {},
      reply:
        'I want to catch the details. Tell me the name of the event, when it is, where, and who to contact — whatever you already know.',
    };
  }

  if (!patchHasContent(patch) && session.pendingSlot) {
    return {
      session,
      patch: {},
      reply: `Sorry, I did not catch that. ${questionForSlot(session.pendingSlot)}`,
    };
  }

  if (!patchHasContent(patch)) {
    return {
      session,
      patch: {},
      reply: 'Sorry, I did not catch that. What else should I know about the event?',
    };
  }

  const known = mergeIntakeKnown(session.known, patch);
  const summary = summarizeCaptured(patch);
  const nextSlot = nextMissingSlot(known);

  if (!nextSlot) {
    return {
      session: {
        phase: 'ready',
        known,
        pendingSlot: null,
        openingCollected: true,
      },
      patch,
      reply: `${summary} That covers the main details. Look over the form, say continue through the steps, or tell me if something should change.`,
    };
  }

  const wasOpening = session.phase === 'opening' && !session.openingCollected;
  return {
    session: {
      phase: 'clarifying',
      known,
      pendingSlot: nextSlot,
      openingCollected: true,
    },
    patch,
    reply: wasOpening
      ? `${summary} Thanks. ${questionForSlot(nextSlot)}`
      : `${summary} ${questionForSlot(nextSlot)}`,
  };
}

function markSlotSkipped(
  known: IntakeKnownState,
  slot: IntakeSlotId,
): IntakeKnownState {
  switch (slot) {
    case 'startTime':
      return { ...known, startTime: known.startTime ?? 'tbd' };
    case 'eventDate':
      return { ...known, eventDate: known.eventDate ?? 'tbd' };
    case 'locationMode':
      return { ...known, locationMode: known.locationMode ?? 'church' };
    case 'location':
      return {
        ...known,
        locationMode: known.locationMode ?? 'offsite',
        location: known.location ?? 'TBD',
      };
    case 'contactName':
      return { ...known, contactName: known.contactName ?? 'TBD' };
    case 'participants':
      return {
        ...known,
        participantsEstimate: known.participantsEstimate ?? 0,
      };
    case 'media':
      return { ...known, mediaResolved: true };
    case 'kitchen':
      return { ...known, kitchenResolved: true };
    case 'floorPlan':
      return { ...known, floorPlanResolved: true };
    default:
      return known;
  }
}
