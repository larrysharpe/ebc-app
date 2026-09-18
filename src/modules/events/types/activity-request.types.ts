import type {
  ActivityHelpFrom,
  LeadTimeTier,
} from '../constants/activity-request.constants';

export type ActivityMediaNeeds = {
  needed: boolean;
  /** User explicitly chose “No media needed” after reviewing the list. */
  noneConfirmed: boolean;
  sound: boolean;
  slides: boolean;
  livestream: boolean;
  camera: boolean;
  graphics: boolean;
  /** Pre-recorded music or video to play during the event. */
  playback: boolean;
  notes?: string;
};

export type ActivityKitchenNeeds = {
  needed: boolean;
  /** User explicitly chose “No kitchen / food needed” after reviewing the list. */
  noneConfirmed: boolean;
  heatingCooking: boolean;
  utensils: boolean;
  plates: boolean;
  cupsGlasses: boolean;
  napkinsTableCloths: boolean;
  coffee: boolean;
  refrigeration: boolean;
  freezer: boolean;
  notes?: string;
};

export type ActivityFloorPlanNeeds = {
  needed: boolean;
  /** User explicitly chose “No floor plan needed” after reviewing the list. */
  noneConfirmed: boolean;
  /** Quantities; 0 means not requested. */
  theaterSeating: number;
  roundTables: number;
  classroomSeating: number;
  podium: number;
  registrationTable: number;
  servingTables: number;
  clearFloor: number;
  accessibilitySeating: number;
  notes?: string;
};

export type ActivityCoordination = {
  bulletin: boolean;
  otherChurches: boolean;
  flyerCopies: boolean;
  financialVoucher: boolean;
  helpFrom: ActivityHelpFrom[];
};

export type ActivityAcknowledgements = {
  cleanRoom: boolean;
  noBannersWithoutPermission: boolean;
  conflictMayReschedule: boolean;
};

export type ActivityRequest = {
  contactName?: string;
  contactPhone?: string;
  participantsEstimate?: number;
  guestSpeaker?: string;
  kitchen: ActivityKitchenNeeds;
  media: ActivityMediaNeeds;
  floorPlan: ActivityFloorPlanNeeds;
  coordination: ActivityCoordination;
  acknowledgements: ActivityAcknowledgements;
  leadTimeTier?: LeadTimeTier;
  emergencyReason?: string;
  willContactOffice?: boolean;
  submittedAt?: string;
  approvedByUserId?: string;
  approvedAt?: string;
  returnedAt?: string;
  returnReason?: string;
};
