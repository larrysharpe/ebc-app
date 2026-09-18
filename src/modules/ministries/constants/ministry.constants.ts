import type { MinistryPersonRole } from '../types';
import type { MinistryDutyDefinition } from '../types';

export const PERSON_ROLE_LABELS: Record<MinistryPersonRole, string> = {
  director: 'Director',
  chair: 'Chair',
  vice_chair: 'Vice Chair',
  advisor: 'Advisor',
  member: 'Member',
  volunteer: 'Volunteer',
};

export const DUTY_NEEDED_COUNT_MIN = 1;
export const DUTY_NEEDED_COUNT_MAX = 99;

/** Sunday worship AV SOP from website seed (`website-sops.ts`). */
const MEDIA_SUNDAY_SOP_ID = 'sop-web-med-1';

/** Default duty catalog for Media Ministry (seed / first-run). */
export const MEDIA_DUTY_CATALOG_SEED: MinistryDutyDefinition[] = [
  {
    id: 'media_lead',
    label: 'Media lead',
    email: 'mediaministry@ebenezerbc.org',
    sopId: MEDIA_SUNDAY_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'slides',
    label: 'In-service slides',
    sopId: MEDIA_SUNDAY_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'camera',
    label: 'In-service camera',
    sopId: MEDIA_SUNDAY_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'sound',
    label: 'Sound',
    sopId: MEDIA_SUNDAY_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'streaming',
    label: 'Streaming',
    sopId: MEDIA_SUNDAY_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'digital_sign_operator',
    label: 'Digital sign operator',
    neededCount: 1,
    active: true,
  },
  {
    id: 'digital_sign_creative',
    label: 'Digital sign creative',
    neededCount: 1,
    active: true,
  },
  { id: 'photographer', label: 'Photographer', neededCount: 1, active: true },
  { id: 'videographer', label: 'Videographer', neededCount: 1, active: true },
  { id: 'graphics', label: 'Graphics', neededCount: 1, active: true },
];

/** Weekly announcement SOP from website seed (`website-sops.ts`). */
const COMMUNICATIONS_ANNOUNCEMENT_SOP_ID = 'sop-web-comms-1';

/** Default duty catalog for Communications Ministry (seed / first-run). */
export const COMMUNICATIONS_DUTY_CATALOG_SEED: MinistryDutyDefinition[] = [
  {
    id: 'communications_lead',
    label: 'Communications lead',
    sopId: COMMUNICATIONS_ANNOUNCEMENT_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'announcements',
    label: 'Announcements editor',
    sopId: COMMUNICATIONS_ANNOUNCEMENT_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'bulletin',
    label: 'Bulletin editor',
    sopId: COMMUNICATIONS_ANNOUNCEMENT_SOP_ID,
    neededCount: 1,
    active: true,
  },
  {
    id: 'website_content',
    label: 'Website content',
    neededCount: 1,
    active: true,
  },
  {
    id: 'social_publisher',
    label: 'Social publisher',
    neededCount: 1,
    active: true,
  },
  {
    id: 'brand_steward',
    label: 'Brand steward',
    neededCount: 1,
    active: true,
  },
  {
    id: 'ai_cycle',
    label: 'AI cycle steward',
    sopId: COMMUNICATIONS_ANNOUNCEMENT_SOP_ID,
    neededCount: 1,
    active: true,
  },
];

export const MINISTRY_TABS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'overview', label: 'Plan' },
  { id: 'personnel', label: 'Roster' },
  { id: 'duties', label: 'Duties' },
  { id: 'sops', label: 'SOPs' },
  { id: 'media', label: 'Media' },
  { id: 'documents', label: 'Documents' },
] as const;
