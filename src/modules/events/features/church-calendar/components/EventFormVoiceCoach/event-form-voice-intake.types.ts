import type {
  ActivityFloorPlanField,
  ActivityHelpFrom,
  ActivityKitchenField,
  ActivityMediaField,
} from '@/modules/events/constants/activity-request.constants';
import type { ChurchEventType } from '@/modules/events/types/church-event.types';

/** Ordered clarifying questions after the opening story. */
export const INTAKE_SLOT_ORDER = [
  'title',
  'eventType',
  'eventDate',
  'startTime',
  'locationMode',
  'location',
  'contactName',
  'participants',
  'media',
  'kitchen',
  'floorPlan',
] as const;

export type IntakeSlotId = (typeof INTAKE_SLOT_ORDER)[number];

export type IntakePhase = 'opening' | 'clarifying' | 'ready';

export type EventFormIntakePatch = {
  title?: string;
  eventType?: ChurchEventType;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  locationMode?: 'church' | 'offsite';
  location?: string;
  contactName?: string;
  contactPhone?: string;
  participantsEstimate?: number;
  guestSpeaker?: string;
  timePreference?: string;
  suggestTime?: boolean;
  mediaNone?: boolean;
  mediaNeed?: ActivityMediaField[];
  kitchenNone?: boolean;
  kitchenNeed?: ActivityKitchenField[];
  floorPlanNone?: boolean;
  floorPlanQty?: Array<{ field: ActivityFloorPlanField; qty: number }>;
  helpFrom?: ActivityHelpFrom[];
  ackAll?: boolean;
};

export type IntakeKnownState = {
  title?: string;
  eventType?: ChurchEventType;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  locationMode?: 'church' | 'offsite';
  location?: string;
  contactName?: string;
  contactPhone?: string;
  participantsEstimate?: number;
  guestSpeaker?: string;
  mediaResolved?: boolean;
  kitchenResolved?: boolean;
  floorPlanResolved?: boolean;
};

export type IntakeSession = {
  phase: IntakePhase;
  known: IntakeKnownState;
  pendingSlot: IntakeSlotId | null;
  openingCollected: boolean;
};

export type IntakeTurnResult = {
  session: IntakeSession;
  patch: EventFormIntakePatch;
  reply: string;
  /** True when user asked to leave intake / use command mode. */
  exitIntake?: boolean;
};

export function createIntakeSession(): IntakeSession {
  return {
    phase: 'opening',
    known: {},
    pendingSlot: null,
    openingCollected: false,
  };
}

export function getIntakeOpeningPrompt(): string {
  return 'Great — I am listening. Tell me everything you know about this event: the name, what kind it is, when and where, who to contact, about how many people, and any media, kitchen, or room setup. You can skip this intro and just start talking whenever you are ready.';
}

export function getIntakeSkipOpeningPrompt(): string {
  return 'Okay — go ahead. Tell me what you know about the event.';
}

