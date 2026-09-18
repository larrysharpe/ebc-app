import {
  ACTIVITY_FLOOR_PLAN_FIELD_LABELS,
  ACTIVITY_FLOOR_PLAN_FIELDS,
  ACTIVITY_HELP_FROM,
  ACTIVITY_HELP_FROM_LABELS,
  ACTIVITY_KITCHEN_FIELD_LABELS,
  ACTIVITY_KITCHEN_FIELDS,
  ACTIVITY_MEDIA_FIELD_LABELS,
  ACTIVITY_MEDIA_FIELDS,
  type ActivityFloorPlanField,
  type ActivityHelpFrom,
  type ActivityKitchenField,
  type ActivityMediaField,
} from '@/modules/events/constants/activity-request.constants';
import {
  CHURCH_EVENT_TYPE_LABELS,
  type ChurchEventType,
} from '@/modules/events/types/church-event.types';

import type { EventFormStepId } from '../../church-event-form.constants';
import type { SpeechRecognitionInstance } from './event-form-voice.types';

export type EventFormVoiceCommand =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'help' }
  | { type: 'repeat' }
  | { type: 'stop' }
  | { type: 'goToStep'; step: EventFormStepId }
  | { type: 'setTitle'; title: string }
  | { type: 'setEventType'; eventType: ChurchEventType }
  | { type: 'setEventDate'; eventDate: string }
  | { type: 'setStartTime'; startTime: string }
  | { type: 'setEndTime'; endTime: string }
  | { type: 'setLocationMode'; mode: 'church' | 'offsite' }
  | { type: 'setLocation'; location: string }
  | { type: 'setContactName'; name: string }
  | { type: 'setContactPhone'; phone: string }
  | { type: 'setParticipants'; count: number }
  | { type: 'setGuestSpeaker'; name: string }
  | { type: 'setTimePreference'; preference: string }
  | { type: 'suggestTime'; preference?: string }
  | { type: 'useSuggestion'; index: number }
  | { type: 'mediaNone' }
  | { type: 'mediaNeed'; field: ActivityMediaField }
  | { type: 'kitchenNone' }
  | { type: 'kitchenNeed'; field: ActivityKitchenField }
  | { type: 'floorPlanNone' }
  | { type: 'floorPlanQty'; field: ActivityFloorPlanField; qty: number }
  | { type: 'toggleHelpFrom'; help: ActivityHelpFrom }
  | { type: 'ackAll' }
  | { type: 'runReview' }
  | { type: 'saveDraft' }
  | { type: 'submitApproval' }
  | { type: 'unknown'; raw: string };

const STEP_ALIASES: Record<EventFormStepId, string[]> = {
  basics: ['basics', 'basic', 'start', 'beginning', 'first step'],
  when: ['when', 'date and time', 'date', 'time', 'schedule'],
  where: ['where', 'location', 'place', 'room'],
  people: ['people', 'contact', 'contacts'],
  kitchen: ['kitchen', 'food'],
  media: ['media', 'av', 'audio visual'],
  floorPlan: ['floor plan', 'floorplan', 'setup', 'tables and chairs'],
  coordination: ['coordination', 'bulletin', 'extra help'],
  review: ['review', 'summary', 'finish', 'last step'],
};

const TYPE_ALIASES: Record<ChurchEventType, string[]> = {
  worship: ['worship', 'sunday worship', 'sunday service'],
  education: ['education', 'class', 'bible study', 'bible class'],
  meeting: ['meeting', 'prayer meeting', 'prayer'],
  outreach: ['outreach'],
  special: ['special', 'special service'],
  other: ['other'],
};

const MEDIA_ALIASES: Record<ActivityMediaField, string[]> = {
  sound: ['sound', 'microphone', 'microphones', 'mic', 'mics'],
  slides: ['slides', 'projection', 'projector'],
  livestream: ['livestream', 'live stream', 'streaming'],
  camera: ['camera', 'recording', 'video recording'],
  graphics: ['graphics', 'overlays'],
  playback: [
    'music or video',
    'playback',
    'play music',
    'play video',
    'video played',
  ],
};

const KITCHEN_ALIASES: Record<ActivityKitchenField, string[]> = {
  heatingCooking: ['heating', 'cooking', 'cook'],
  utensils: ['utensils', 'forks', 'knives', 'spoons'],
  plates: ['plates', 'bowls'],
  cupsGlasses: ['cups', 'glasses'],
  napkinsTableCloths: ['napkins', 'tablecloths', 'table cloths'],
  coffee: ['coffee'],
  refrigeration: ['refrigerator', 'fridge', 'refrigeration'],
  freezer: ['freezer'],
};

const FLOOR_ALIASES: Record<ActivityFloorPlanField, string[]> = {
  theaterSeating: ['theater seating', 'theatre seating', 'facing front'],
  roundTables: ['round tables', 'round table'],
  classroomSeating: ['classroom seating', 'rows'],
  podium: ['podium', 'lectern'],
  registrationTable: ['registration table', 'welcome table'],
  servingTables: ['serving tables', 'serving table'],
  clearFloor: ['clear floor', 'open floor'],
  accessibilitySeating: ['accessibility seating', 'accessible seating'],
};

const HELP_ALIASES: Record<ActivityHelpFrom, string[]> = {
  ushers: ['ushers', 'usher'],
  trustees: ['trustees', 'trustee'],
  communications: ['communications', 'comms'],
  other_ministries: ['other ministries', 'other ministry'],
};

const STEP_SPEAK_LABELS: Record<EventFormStepId, string> = {
  basics: 'Basics',
  when: 'When',
  where: 'Where',
  people: 'People',
  kitchen: 'Kitchen',
  media: 'Media',
  floorPlan: 'Floor plan',
  coordination: 'Coordination',
  review: 'Review',
};

export function normalizeVoiceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strip polite / filler phrasing so “can you suggest the time for me”
 * matches the same intents as “suggest time”.
 */
export function softenConversationalText(text: string): string {
  let next = normalizeVoiceText(text);
  const patterns = [
    /^(hey|hi|hello|um|uh|okay|ok|so|well)\s+/,
    /^(can you|could you|would you|will you|can we|could we|would we)\s+/,
    /^(please|just|maybe|kind of|kinda)\s+/,
    /^(i want you to|i need you to|i d like you to|i would like you to)\s+/,
    /^(i want to|i need to|i d like to|i would like to|i m trying to)\s+/,
    /^(help me|help us)\s+(to\s+)?/,
    /\b(please|for me|for us|thanks|thank you)\b/g,
  ];
  for (const pattern of patterns) {
    next = next.replace(pattern, ' ').replace(/\s+/g, ' ').trim();
  }
  return next;
}

export function getSpeechRecognitionConstructor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  const globalWindow = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return globalWindow.SpeechRecognition ?? globalWindow.webkitSpeechRecognition;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Prefer natural neural / enhanced English voices over harsh system defaults. */
export function scoreSpeechVoice(voice: {
  name: string;
  lang: string;
  localService: boolean;
}): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang === 'en-us') score += 40;
  else if (lang.startsWith('en-')) score += 25;
  else return -100;

  if (
    name.includes('neural') ||
    name.includes('natural') ||
    name.includes('enhanced') ||
    name.includes('premium') ||
    name.includes('superstar')
  ) {
    score += 50;
  }
  if (name.includes('google')) score += 35;
  if (name.includes('microsoft') && name.includes('online')) score += 30;
  if (
    name.includes('samantha') ||
    name.includes('karen') ||
    name.includes('moira') ||
    name.includes('aria') ||
    name.includes('jenny') ||
    name.includes('guy') ||
    name.includes('sara')
  ) {
    score += 20;
  }
  // Prefer cloud / non-compact voices when available.
  if (!voice.localService) score += 10;
  if (name.includes('compact') || name.includes('eloquence')) score -= 25;
  if (name.includes('fred') || name.includes('albert')) score -= 30;

  return score;
}

export function pickNaturalSpeechVoice(
  voices: ReadonlyArray<{
    name: string;
    lang: string;
    localService: boolean;
  }>,
): (typeof voices)[number] | null {
  let best: (typeof voices)[number] | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const voice of voices) {
    const score = scoreSpeechVoice(voice);
    if (score > bestScore) {
      best = voice;
      bestScore = score;
    }
  }
  return bestScore >= 0 ? best : null;
}

/**
 * Warm the browser speech engine inside a user gesture so later speak()
 * calls (e.g. after React state updates) are more reliable in Chrome.
 */
export function primeSpeechSynthesis(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.resume();
    const warm = new SpeechSynthesisUtterance(' ');
    warm.volume = 0;
    warm.rate = 2;
    warm.lang = 'en-US';
    window.speechSynthesis.speak(warm);
    window.speechSynthesis.cancel();
  } catch {
    // Ignore priming failures — speakGuidance still attempts later.
  }
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function matchAlias<T extends string>(
  text: string,
  aliases: Record<T, string[]>,
): T | null {
  const entries = Object.entries(aliases) as [T, string[]][];
  entries.sort((a, b) => {
    const aMax = Math.max(...a[1].map((phrase) => phrase.length));
    const bMax = Math.max(...b[1].map((phrase) => phrase.length));
    return bMax - aMax;
  });
  for (const [key, phrases] of entries) {
    for (const phrase of phrases) {
      if (text === phrase || text.includes(phrase)) return key;
    }
  }
  return null;
}

function extractAfter(text: string, prefixes: string[]): string | null {
  for (const prefix of prefixes) {
    if (text.startsWith(prefix)) {
      const rest = text.slice(prefix.length).trim();
      return rest || null;
    }
    const idx = text.indexOf(` ${prefix} `);
    if (idx >= 0) {
      const rest = text.slice(idx + prefix.length + 2).trim();
      return rest || null;
    }
  }
  return null;
}

function parseSpokenDate(text: string): string | null {
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const slash = text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/);
  if (slash) {
    const month = slash[1]!.padStart(2, '0');
    const day = slash[2]!.padStart(2, '0');
    return `${slash[3]}-${month}-${day}`;
  }

  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed);
    if (!Number.isNaN(date.getTime())) {
      const y = date.getFullYear();
      if (y >= 2020 && y <= 2100) {
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    }
  }
  return null;
}

function parseSpokenTime(text: string): string | null {
  const cleaned = text.replace(/\./g, '').trim();
  const match = cleaned.match(
    /\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\b/i,
  );
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3]?.toLowerCase().replace(/\./g, '') ?? '';
  if (meridiem.startsWith('p') && hour < 12) hour += 12;
  if (meridiem.startsWith('a') && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseQuantity(text: string): number | null {
  const digit = text.match(/\b(\d{1,3})\b/);
  if (digit) return Number(digit[1]);
  const words: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    twelve: 12,
    fifteen: 15,
    twenty: 20,
    twentyfive: 25,
    'twenty five': 25,
    thirty: 30,
    fifty: 50,
    hundred: 100,
  };
  for (const [word, value] of Object.entries(words)) {
    if (text.includes(word)) return value;
  }
  return null;
}

function suggestionIndexFromText(text: string): number | null {
  if (
    includesAny(text, [
      'first one',
      'first suggestion',
      'the first',
      'option one',
      'number one',
      'use that',
      'use this',
      'that one',
      'this one',
    ])
  ) {
    return 0;
  }
  if (
    includesAny(text, [
      'second one',
      'second suggestion',
      'the second',
      'option two',
      'number two',
    ])
  ) {
    return 1;
  }
  if (
    includesAny(text, [
      'third one',
      'third suggestion',
      'the third',
      'option three',
      'number three',
    ])
  ) {
    return 2;
  }
  return null;
}

function extractSuggestPreference(text: string): string | undefined {
  const after = extractAfter(text, [
    'suggest a time for',
    'suggest time for',
    'suggest the time for',
    'find a time for',
    'looking for',
    'prefer',
    'preference is',
    'i prefer',
  ]);
  if (!after) return undefined;
  const cleaned = after
    .replace(
      /^(me|us|a time|the time|an open time|an opening)\s+/,
      '',
    )
    .replace(/^(for|on)\s+/, '')
    .trim();
  if (!cleaned || cleaned === 'me' || cleaned === 'us') return undefined;
  return cleaned;
}

/**
 * Parse a spoken phrase into a form command.
 * Accepts natural wording (“can you suggest the time for me”).
 */
export function parseEventFormVoiceCommand(
  transcript: string,
): EventFormVoiceCommand {
  const raw = normalizeVoiceText(transcript);
  const text = softenConversationalText(transcript);
  if (!text && !raw) return { type: 'unknown', raw: transcript };
  const spoken = text || raw;

  if (
    /^(stop|cancel|never mind|quiet|be quiet)$/.test(spoken) ||
    spoken.includes('stop listening') ||
    spoken.includes('turn off voice')
  ) {
    return { type: 'stop' };
  }
  if (
    /^(help|what do i do|what should i do|guide me|talk to me|what can i say)$/.test(
      spoken,
    ) ||
    spoken.startsWith('help ')
  ) {
    return { type: 'help' };
  }
  if (
    /^(repeat|say that again|say again|say that one more time)$/.test(spoken)
  ) {
    return { type: 'repeat' };
  }

  if (
    includesAny(spoken, [
      'use the first',
      'use first',
      'pick the first',
      'choose the first',
      'use the second',
      'use second',
      'pick the second',
      'use the third',
      'use that',
      'use this',
      'use that one',
      'use this one',
      'take the first',
      'take that',
    ])
  ) {
    const index = suggestionIndexFromText(spoken) ?? 0;
    return { type: 'useSuggestion', index };
  }

  if (
    includesAny(spoken, [
      'suggest a time',
      'suggest the time',
      'suggest time',
      'suggest times',
      'find a time',
      'find me a time',
      'find an open time',
      'check the calendar',
      'what times are free',
      'what time works',
      'pick a time for me',
      'choose a time for me',
      'recommend a time',
    ]) ||
    (spoken.includes('suggest') && spoken.includes('time')) ||
    (spoken.includes('find') && spoken.includes('time'))
  ) {
    return {
      type: 'suggestTime',
      preference: extractSuggestPreference(spoken),
    };
  }

  const preferenceOnly = extractAfter(spoken, [
    'looking for',
    'prefer',
    'preference is',
    'i prefer',
    'i am looking for',
  ]);
  if (preferenceOnly && preferenceOnly.length > 2) {
    return { type: 'setTimePreference', preference: preferenceOnly };
  }

  if (
    includesAny(spoken, [
      'continue',
      'next step',
      'go on',
      'go ahead',
      'keep going',
      'move on',
      'that s it',
      'i m done',
      'im done',
      'ready for the next',
    ]) ||
    spoken === 'next'
  ) {
    return { type: 'next' };
  }
  if (
    includesAny(spoken, [
      'go back',
      'previous step',
      'go to the previous',
      'back a step',
    ]) ||
    spoken === 'back' ||
    spoken === 'previous'
  ) {
    return { type: 'back' };
  }
  if (
    includesAny(spoken, [
      'check for problems',
      'run review',
      'check the form',
      'look for problems',
      'any problems',
    ]) ||
    spoken === 'check'
  ) {
    return { type: 'runReview' };
  }
  if (
    includesAny(spoken, [
      'submit for approval',
      'submit approval',
      'send for approval',
      'submit it',
    ]) ||
    spoken === 'submit'
  ) {
    return { type: 'submitApproval' };
  }
  if (
    includesAny(spoken, ['save draft', 'save as draft', 'save it']) ||
    spoken === 'save'
  ) {
    return { type: 'saveDraft' };
  }
  if (
    includesAny(spoken, [
      'acknowledge',
      'i agree',
      'i accept',
      'confirm acknowledgements',
      'confirm the acknowledgements',
    ])
  ) {
    return { type: 'ackAll' };
  }

  const goMatch = spoken.match(
    /^(?:go to|open|switch to|take me to|jump to)\s+(.+)$/,
  );
  if (goMatch?.[1]) {
    const step = matchAlias(goMatch[1], STEP_ALIASES);
    if (step) return { type: 'goToStep', step };
  }

  if (
    includesAny(spoken, [
      'at the church',
      'at church',
      'in the church',
      'church building',
    ])
  ) {
    return { type: 'setLocationMode', mode: 'church' };
  }
  if (
    includesAny(spoken, [
      'somewhere else',
      'off site',
      'offsite',
      'not at the church',
      'another location',
    ])
  ) {
    return { type: 'setLocationMode', mode: 'offsite' };
  }

  if (
    includesAny(spoken, [
      'no media needed',
      'no media',
      'do not need media',
      'dont need media',
      'we do not need media',
      'we dont need media',
      'media not needed',
    ])
  ) {
    return { type: 'mediaNone' };
  }
  if (
    includesAny(spoken, [
      'no kitchen',
      'no food needed',
      'do not need kitchen',
      'dont need kitchen',
      'we do not need kitchen',
      'we dont need food',
      'kitchen not needed',
    ])
  ) {
    return { type: 'kitchenNone' };
  }
  if (
    includesAny(spoken, [
      'no floor plan',
      'no setup needed',
      'do not need floor plan',
      'dont need a floor plan',
      'dont need floor plan',
      'floor plan not needed',
    ])
  ) {
    return { type: 'floorPlanNone' };
  }

  for (const field of ACTIVITY_MEDIA_FIELDS) {
    for (const alias of MEDIA_ALIASES[field]) {
      if (
        spoken.includes(`need ${alias}`) ||
        spoken.includes(`needs ${alias}`) ||
        spoken.includes(`add ${alias}`) ||
        spoken.includes(`we need ${alias}`) ||
        spoken === alias
      ) {
        return { type: 'mediaNeed', field };
      }
    }
  }

  for (const field of ACTIVITY_KITCHEN_FIELDS) {
    for (const alias of KITCHEN_ALIASES[field]) {
      if (
        spoken.includes(`need ${alias}`) ||
        spoken.includes(`needs ${alias}`) ||
        spoken.includes(`add ${alias}`) ||
        spoken.includes(`we need ${alias}`)
      ) {
        return { type: 'kitchenNeed', field };
      }
    }
  }

  for (const field of ACTIVITY_FLOOR_PLAN_FIELDS) {
    for (const alias of FLOOR_ALIASES[field]) {
      if (spoken.includes(alias)) {
        const qty = field === 'clearFloor' ? 1 : (parseQuantity(spoken) ?? 1);
        return { type: 'floorPlanQty', field, qty };
      }
    }
  }

  for (const help of ACTIVITY_HELP_FROM) {
    for (const alias of HELP_ALIASES[help]) {
      if (
        spoken.includes(`help from ${alias}`) ||
        spoken.includes(`need ${alias}`) ||
        spoken.includes(`add ${alias}`) ||
        spoken.includes(`we need ${alias}`)
      ) {
        return { type: 'toggleHelpFrom', help };
      }
    }
  }

  const typePhrase = extractAfter(spoken, [
    'type is',
    'event type is',
    'this is a',
    'this is an',
    'set type to',
    'make it a',
    'make it an',
  ]);
  if (typePhrase) {
    const eventType = matchAlias(typePhrase, TYPE_ALIASES);
    if (eventType) return { type: 'setEventType', eventType };
  }
  const eventTypeDirect = matchAlias(spoken, TYPE_ALIASES);
  if (spoken.startsWith('type ') && eventTypeDirect) {
    return { type: 'setEventType', eventType: eventTypeDirect };
  }

  const title = extractAfter(spoken, [
    'title is',
    'the title is',
    'name it',
    'call it',
    'set title to',
    'the name is',
    'event is called',
  ]);
  if (title) return { type: 'setTitle', title };

  const datePhrase = extractAfter(spoken, [
    'date is',
    'the date is',
    'set date to',
    'on',
  ]);
  if (datePhrase) {
    const eventDate = parseSpokenDate(datePhrase);
    if (eventDate) return { type: 'setEventDate', eventDate };
  }

  const startPhrase = extractAfter(spoken, [
    'start time is',
    'starts at',
    'start at',
    'begin at',
    'beginning at',
  ]);
  if (startPhrase) {
    const startTime = parseSpokenTime(startPhrase);
    if (startTime) return { type: 'setStartTime', startTime };
  }

  const endPhrase = extractAfter(spoken, [
    'end time is',
    'ends at',
    'end at',
    'until',
    'ending at',
  ]);
  if (endPhrase) {
    const endTime = parseSpokenTime(endPhrase);
    if (endTime) return { type: 'setEndTime', endTime };
  }

  const location = extractAfter(spoken, [
    'location is',
    'address is',
    'place is',
    'room is',
  ]);
  if (location) return { type: 'setLocation', location };

  const contact = extractAfter(spoken, [
    'contact is',
    'contact name is',
    'my name is',
    'contact person is',
    'i am',
  ]);
  if (contact && contact.split(' ').length <= 5) {
    return { type: 'setContactName', name: contact };
  }

  const phone = extractAfter(spoken, [
    'phone is',
    'phone number is',
    'call me at',
    'my number is',
  ]);
  if (phone) return { type: 'setContactPhone', phone };

  const peoplePhrase = extractAfter(spoken, [
    'participants are',
    'about how many people',
    'how many people',
    'number of people',
    'expecting',
    'about',
    'people ',
  ]);
  if (peoplePhrase) {
    const count = parseQuantity(peoplePhrase);
    if (count != null && (spoken.includes('people') || spoken.includes('participants') || spoken.includes('expecting'))) {
      return { type: 'setParticipants', count };
    }
  }

  const guest = extractAfter(spoken, [
    'guest speaker is',
    'speaker is',
  ]);
  if (guest) return { type: 'setGuestSpeaker', name: guest };

  return { type: 'unknown', raw: transcript };
}

export function buildStepGuidance(step: EventFormStepId): string {
  switch (step) {
    case 'basics':
      return 'This is Basics. You can say something like, the title is Fall Fresh Kickoff, and type is meeting. When that looks right, just say continue.';
    case 'when':
      return 'This is When. Tell me the date, like date is September 18 2026, or ask me to suggest a time. You can also say looking for Friday evening. Say continue when you are ready.';
    case 'where':
      return 'This is Where. Say at the church, or somewhere else. If it is off site, say location is, then the place. Say continue when you are ready.';
    case 'people':
      return 'This is People. Say contact is, then your name. You can also say about 40 people. Say continue when you are ready.';
    case 'kitchen':
      return 'This is Kitchen and food. Glance through the list. You can say we need plates, or coffee, or no kitchen needed. Then say continue.';
    case 'media':
      return 'This is Media. You can say we need sound, or need slides, or no media needed. Then say continue.';
    case 'floorPlan':
      return 'This is Floor plan. Try round tables 8, or theater seating 50, or no floor plan needed. Then say continue.';
    case 'coordination':
      return 'This is Coordination. You can say need ushers, or help from trustees. Say continue when you are ready.';
    case 'review':
      return 'This is Review. Look over the summary. Say I agree for the acknowledgements, then check for problems, and save draft or submit for approval.';
    default:
      return 'Say help anytime, or continue when you want to move ahead.';
  }
}

export function describeVoiceCommand(command: EventFormVoiceCommand): string {
  switch (command.type) {
    case 'next':
      return 'Okay, moving on.';
    case 'back':
      return 'Sure, going back.';
    case 'help':
      return 'Happy to. Here is what we can do on this step.';
    case 'repeat':
      return 'Of course.';
    case 'stop':
      return 'Okay, I will stop listening.';
    case 'goToStep':
      return `Okay, opening ${STEP_SPEAK_LABELS[command.step]}.`;
    case 'setTitle':
      return `Got it. Title is ${command.title}.`;
    case 'setEventType':
      return `Okay, type is ${CHURCH_EVENT_TYPE_LABELS[command.eventType]}.`;
    case 'setEventDate':
      return `Date set to ${command.eventDate}.`;
    case 'setStartTime':
      return `Start time ${command.startTime}.`;
    case 'setEndTime':
      return `End time ${command.endTime}.`;
    case 'setLocationMode':
      return command.mode === 'church'
        ? 'Okay, at the church.'
        : 'Okay, somewhere else.';
    case 'setLocation':
      return `Location set to ${command.location}.`;
    case 'setContactName':
      return `Contact is ${command.name}.`;
    case 'setContactPhone':
      return 'Phone number saved.';
    case 'setParticipants':
      return `About ${command.count} people. Got it.`;
    case 'setGuestSpeaker':
      return `Guest speaker ${command.name}.`;
    case 'setTimePreference':
      return `Okay, looking for ${command.preference}. Want me to suggest a time?`;
    case 'suggestTime':
      return command.preference
        ? `Sure. I will look for ${command.preference}.`
        : 'Sure. Checking the calendar for open times.';
    case 'useSuggestion':
      return command.index === 0
        ? 'Okay, using the first suggestion.'
        : `Okay, using suggestion ${command.index + 1}.`;
    case 'mediaNone':
      return 'Okay, no media needed.';
    case 'mediaNeed':
      return `Added ${ACTIVITY_MEDIA_FIELD_LABELS[command.field]}.`;
    case 'kitchenNone':
      return 'Okay, no kitchen or food needed.';
    case 'kitchenNeed':
      return `Added ${ACTIVITY_KITCHEN_FIELD_LABELS[command.field]}.`;
    case 'floorPlanNone':
      return 'Okay, no floor plan needed.';
    case 'floorPlanQty':
      return `Set ${ACTIVITY_FLOOR_PLAN_FIELD_LABELS[command.field]} to ${command.qty}.`;
    case 'toggleHelpFrom':
      return `Help from ${ACTIVITY_HELP_FROM_LABELS[command.help]}.`;
    case 'ackAll':
      return 'Thanks. Acknowledgements are checked.';
    case 'runReview':
      return 'Okay, checking for problems.';
    case 'saveDraft':
      return 'Saving your draft now.';
    case 'submitApproval':
      return 'Submitting for approval.';
    case 'unknown':
      return 'Sorry, I did not catch that. You can say things like suggest a time, continue, or help.';
    default:
      return 'Okay.';
  }
}
