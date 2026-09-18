import {
  ACTIVITY_MEDIA_STEP_MODE,
  type ActivityHelpFrom,
} from '../constants/activity-request.constants';
import type { ChurchEventType } from '../types/church-event.types';
import type {
  ActivityCoordination,
  ActivityFloorPlanNeeds,
  ActivityKitchenNeeds,
  ActivityMediaNeeds,
  ActivityRequest,
} from '../types/activity-request.types';

function emptyMedia(needed: boolean): ActivityMediaNeeds {
  return {
    needed,
    noneConfirmed: false,
    sound: needed,
    slides: needed,
    livestream: needed,
    camera: false,
    graphics: false,
    playback: false,
  };
}

function emptyKitchen(): ActivityKitchenNeeds {
  return {
    needed: false,
    noneConfirmed: false,
    heatingCooking: false,
    utensils: false,
    plates: false,
    cupsGlasses: false,
    napkinsTableCloths: false,
    coffee: false,
    refrigeration: false,
    freezer: false,
  };
}

function emptyFloorPlan(): ActivityFloorPlanNeeds {
  return {
    needed: false,
    noneConfirmed: false,
    theaterSeating: 0,
    roundTables: 0,
    classroomSeating: 0,
    podium: 0,
    registrationTable: 0,
    servingTables: 0,
    clearFloor: 0,
    accessibilitySeating: 0,
  };
}

function coordinationDefaults(
  eventType: ChurchEventType,
): ActivityCoordination {
  const helpFrom: ActivityHelpFrom[] = [];
  if (eventType === 'worship' || eventType === 'special') {
    helpFrom.push('ushers');
  }
  if (eventType === 'outreach') {
    helpFrom.push('ushers', 'communications');
  }

  return {
    bulletin: eventType === 'special' || eventType === 'outreach',
    otherChurches: eventType === 'outreach',
    flyerCopies: false,
    financialVoucher: false,
    helpFrom,
  };
}

/**
 * Type-based defaults for the activity-request wizard.
 */
export function buildActivityRequestDefaults(
  eventType: ChurchEventType,
): ActivityRequest {
  const mediaMode = ACTIVITY_MEDIA_STEP_MODE[eventType];
  const mediaNeeded = mediaMode === 'confirm';

  return {
    kitchen: emptyKitchen(),
    media: emptyMedia(mediaNeeded),
    floorPlan: emptyFloorPlan(),
    coordination: coordinationDefaults(eventType),
    acknowledgements: {
      cleanRoom: false,
      noBannersWithoutPermission: false,
      conflictMayReschedule: false,
    },
  };
}

/** Merge saved request with fresh type defaults (keeps user answers when present). */
export function mergeActivityRequestWithDefaults(
  eventType: ChurchEventType,
  existing: ActivityRequest | null | undefined,
): ActivityRequest {
  const defaults = buildActivityRequestDefaults(eventType);
  if (!existing) return defaults;

  return {
    ...defaults,
    ...existing,
    kitchen: {
      ...defaults.kitchen,
      ...existing.kitchen,
      noneConfirmed: existing.kitchen?.noneConfirmed ?? false,
    },
    media: {
      ...defaults.media,
      ...existing.media,
      noneConfirmed: existing.media?.noneConfirmed ?? false,
    },
    floorPlan: {
      ...defaults.floorPlan,
      ...existing.floorPlan,
      noneConfirmed: existing.floorPlan?.noneConfirmed ?? false,
      theaterSeating: Number(existing.floorPlan?.theaterSeating) || 0,
      roundTables: Number(existing.floorPlan?.roundTables) || 0,
      classroomSeating: Number(existing.floorPlan?.classroomSeating) || 0,
      podium: Number(existing.floorPlan?.podium) || 0,
      registrationTable: Number(existing.floorPlan?.registrationTable) || 0,
      servingTables: Number(existing.floorPlan?.servingTables) || 0,
      clearFloor: Number(existing.floorPlan?.clearFloor) || 0,
      accessibilitySeating:
        Number(existing.floorPlan?.accessibilitySeating) || 0,
    },
    coordination: {
      ...defaults.coordination,
      ...existing.coordination,
      helpFrom: existing.coordination?.helpFrom ?? defaults.coordination.helpFrom,
    },
    acknowledgements: {
      ...defaults.acknowledgements,
      ...existing.acknowledgements,
    },
  };
}

/** Saturday after noon → show duty-trustee reminder. */
export function needsSaturdayTrusteeNote(
  eventDate: string | undefined,
  startTime: string | undefined,
): boolean {
  if (!eventDate?.trim()) return false;
  const day = new Date(`${eventDate.slice(0, 10)}T12:00:00`).getDay();
  if (day !== 6) return false;
  if (!startTime?.trim()) return true;
  return startTime >= '12:00';
}
