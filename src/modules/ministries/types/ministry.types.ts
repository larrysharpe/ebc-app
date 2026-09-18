export const MINISTRY_CATEGORIES = {
  education: { label: 'Christian Education', accent: 'navy' },
  fellowship: { label: 'Fellowship', accent: 'gold' },
  outreach: { label: 'Outreach', accent: 'green' },
  leadership: { label: 'Church Leadership', accent: 'burgundy' },
  service: { label: 'Service & Support', accent: 'burgundy' },
  capital: { label: 'Capital', accent: 'gold' },
} as const;

export type MinistryCategory = keyof typeof MINISTRY_CATEGORIES;

export type MinistryPersonRole =
  | 'director'
  | 'chair'
  | 'vice_chair'
  | 'advisor'
  | 'member'
  | 'volunteer';

/** Duty id assigned on a roster entry (matches `MinistryDutyDefinition.id`). */
export type MinistryDutyId = string;

export type MinistryDutyDefinition = {
  id: string;
  label: string;
  description?: string;
  /** Shared inbox for this duty (e.g. slides@…); optional. */
  email?: string;
  /** Linked ministry SOP id (`MinistrySop.id`). */
  sopId?: string;
  /** How many people should fill this duty on the roster. */
  neededCount: number;
  /** Soft-hide from new assignments without removing historical assignments. */
  active: boolean;
};

export type MinistryPerson = {
  id: string;
  /** Links to church directory `Person.id`. Required for real people. */
  personId?: string;
  /** Display name (synced from Person when linked). */
  name: string;
  role: MinistryPersonRole;
  /** Optional free-text title (e.g. “Youth Bible Study”). Prefer duties for Media. */
  title?: string;
  duties?: MinistryDutyId[];
  email?: string;
  phone?: string;
  /** Placeholder slot (e.g. Photographer open) — not a directory person yet. */
  isOpenRole?: boolean;
};

export type MinistryEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt?: string;
  location?: string;
  notes?: string;
  recurring?: string;
};

export type MinistrySopStatus = 'draft' | 'in_review' | 'approved' | 'archived';

export type MinistrySopKind = 'charter' | 'task';

export type MinistrySopRevision = {
  version: string;
  date: string;
  author: string;
  change: string;
};

export type MinistrySop = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  updatedBy?: string;
  templateId?: string;
  kind?: MinistrySopKind;
  documentNumber?: string;
  version?: string;
  status?: MinistrySopStatus;
  effectiveDate?: string;
  preparedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  nextReviewAt?: string;
  revisions?: MinistrySopRevision[];
};

export type Ministry = {
  id: string;
  slug: string;
  name: string;
  category: MinistryCategory;
  description: string;
  websiteUrl?: string;
  meetingSummary?: string;
  /** Shared ministry contact (not a roster person's personal email). */
  contactEmail?: string;
  personnel: MinistryPerson[];
  events: MinistryEvent[];
  sops: MinistrySop[];
  dutyCatalog: MinistryDutyDefinition[];
  /** Cached AI suggested plan (markdown). */
  suggestedPlan?: string;
  /** ISO timestamp when suggestedPlan was last generated. */
  suggestedPlanGeneratedAt?: string;
};

export type MinistryTab =
  | 'overview'
  | 'personnel'
  | 'duties'
  | 'calendar'
  | 'sops'
  | 'media'
  | 'documents';

export type MinistryStore = {
  ministries: Ministry[];
  updatedAt: string;
};
