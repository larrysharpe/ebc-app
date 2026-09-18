/** Which Sunday of the month a choir normally sings (1–5). */
export type SundayOfMonth = 1 | 2 | 3 | 4 | 5;

/**
 * Choir id stored on plans/overrides. Prefer loading labels from the Choir table.
 * Seeded chapel ids: senior, youth, adult, mens, young_adult.
 */
export type ChoirGroup = string;

export type PlanSongSlotType =
  | 'welcome'
  | 'worship'
  | 'congregational_hymn'
  | 'offering'
  | 'sermonic'
  | 'response'
  | 'last_song'
  | 'surprise'
  | 'other';

export type PlanStatus = 'draft' | 'sent';

export type Song = {
  id: string;
  title: string;
  artist?: string;
  youtubeUrl?: string;
  /** Practice track / YouTube Music (or direct audio) for choir members. */
  audioUrl?: string;
  defaultKey?: string;
  themes: string[];
  notes?: string;
  lyricsText?: string;
  copyrightNotes?: string;
};

export type PlanSongSlot = {
  id: string;
  sortOrder: number;
  songId?: string;
  customTitle?: string;
  youtubeUrl?: string;
  slotType: PlanSongSlotType;
  assignments: string;
  sectionNotes?: string;
  notes?: string;
};

export type PlanPractice = {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
};

export type ServiceMusicPlan = {
  id: string;
  title: string;
  choirGroup: ChoirGroup;
  serviceDate: string;
  /** Linked church calendar event when the director selected one. */
  churchEventId?: string;
  /** Linked church Sunday service (legacy / special characteristics). */
  sundayServiceId?: string;
  /** Which Sunday of the month this service falls on (1–5). */
  sundayOfMonth?: SundayOfMonth;
  /** True when a different choir sings than the default rotation for that Sunday. */
  scheduleOverride?: boolean;
  /** Why the schedule was swapped (e.g. Men's choir off Father's Day). */
  scheduleNote?: string;
  serviceStartTime?: string;
  serviceEndTime?: string;
  /** Choir arrival / call time before the service. */
  arrivalTime?: string;
  /** @deprecated Prefer `practices` — kept in sync with the first practice. */
  practiceDate?: string;
  /** @deprecated Prefer `practices`. */
  practiceStartTime?: string;
  /** @deprecated Prefer `practices`. */
  practiceEndTime?: string;
  /** @deprecated Prefer `practices`. */
  practiceLocation?: string;
  /** One or more rehearsals for this engagement. */
  practices?: PlanPractice[];
  occasion?: string;
  attire?: string;
  scriptureReader?: string | null;
  prayerLeader?: string | null;
  directorNotes?: string;
  postServiceMessage?: string;
  status: PlanStatus;
  sentAt?: string;
  directorName: string;
  songs: PlanSongSlot[];
};

export type ChoirScheduleOverride = {
  id: string;
  serviceDate: string;
  choirGroup: ChoirGroup;
  sundayOfMonth: SundayOfMonth;
  note?: string;
};

export type BandInstrument = 'keys' | 'drums' | 'violin' | 'bass' | 'congas';

export type MusicianSlotRole =
  | 'primary'
  | 'every_other'
  | 'backup'
  | 'emergency'
  | 'song_fill'
  | 'special';

export type BandPlayerType = 'regular' | 'guest';

export type BandMusician = {
  id: string;
  /** Display name (denormalized; prefer resolving from personId when set). */
  name: string;
  /** Person directory id — members or hired musicians. */
  personId?: string;
  /** Primary instrument — depth chart is grouped by this. */
  instrument: BandInstrument;
  /** Additional instruments this musician can cover. */
  secondaryInstruments: BandInstrument[];
  playerType: BandPlayerType;
  /** Service date when a guest musician is scheduled. */
  guestServiceDate?: string;
  /** Which Sundays of the month (1–5) this musician normally plays. */
  sundays?: SundayOfMonth[];
  /** Shares 2nd Sunday on an alternating schedule (e.g. drums). */
  everyOther2nd?: boolean;
  /** Depth-chart tier (primary / backup / emergency / …). */
  role: MusicianSlotRole;
  /** Sort within the same instrument + tier (lower = higher on the chart). */
  depthOrder: number;
  /** Name details not yet confirmed. */
  namePending?: boolean;
  notes?: string;
};

export type MusicStore = {
  songs: Song[];
  plans: ServiceMusicPlan[];
  scheduleOverrides?: ChoirScheduleOverride[];
  bandRoster?: BandMusician[];
  updatedAt: string;
};

/** Default chapel choir rotation — can be swapped per date. */
export const DEFAULT_CHOIR_BY_SUNDAY: Record<SundayOfMonth, ChoirGroup> = {
  1: 'senior',
  2: 'youth',
  3: 'adult',
  4: 'mens',
  5: 'young_adult',
};

/** Choir leadership — always reference a Person (member or hired). */
export type ChoirLeader = {
  personId: string;
  title?: string;
};

/** How someone participates on a choir roster. */
export type ChoirMemberRole = 'singer' | 'soloist' | 'band';

export const CHOIR_MEMBER_ROLES: readonly ChoirMemberRole[] = [
  'singer',
  'soloist',
  'band',
] as const;

export const CHOIR_MEMBER_ROLE_LABELS: Record<ChoirMemberRole, string> = {
  singer: 'Singers',
  soloist: 'Soloists',
  band: 'Band members',
};

/** Choir roster member — Person from the directory. */
export type ChoirMember = {
  personId: string;
  role: ChoirMemberRole;
};

export type ChoirScheduleRow = {
  sunday: SundayOfMonth;
  choirGroup: ChoirGroup;
  leaders: ChoirLeader[];
};

/** Fallback labels for seeded choir ids when Choir rows are not loaded. */
export const CHOIR_GROUP_LABELS: Record<string, string> = {
  senior: 'Senior Choir',
  youth: 'Youth Choir',
  adult: 'Adult Choir',
  mens: "Men's Choir",
  young_adult: 'Young Adult Choir',
  combined: 'Combined Choir',
};

export const SLOT_TYPE_LABELS: Record<PlanSongSlotType, string> = {
  welcome: 'Welcome',
  worship: 'Worship',
  congregational_hymn: 'Congregational hymn',
  offering: 'Offering',
  sermonic: 'Sermonic',
  response: 'Response',
  last_song: 'Last song',
  surprise: 'Surprise',
  other: 'Other',
};

/** Default empty slots for a typical chapel service set list. */
export const STANDARD_SERVICE_SLOT_TYPES: readonly PlanSongSlotType[] = [
  'welcome',
  'worship',
  'congregational_hymn',
  'offering',
  'sermonic',
  'response',
  'last_song',
];

export const BAND_INSTRUMENT_LABELS: Record<BandInstrument, string> = {
  keys: 'Keys',
  drums: 'Drums',
  violin: 'Violin',
  bass: 'Bass',
  congas: 'Congos',
};

export const BAND_INSTRUMENT_ORDER: BandInstrument[] = [
  'keys',
  'drums',
  'violin',
  'bass',
  'congas',
];

export const MUSICIAN_ROLE_LABELS: Record<MusicianSlotRole, string> = {
  primary: 'Primary',
  every_other: 'Alternating',
  backup: 'Backup',
  emergency: 'Emergency',
  song_fill: 'Song fill-in',
  special: 'Special',
};

/** Short guidance shown in the musician form. */
export const MUSICIAN_ROLE_DESCRIPTIONS: Record<MusicianSlotRole, string> = {
  primary: 'Regular rotation — expected for assigned Sundays.',
  every_other: 'Shares a Sunday on an alternating schedule.',
  backup: 'Can cover a full service when a primary is out.',
  emergency: 'Last-resort cover for a full service.',
  song_fill:
    'Not full-service skilled yet — can play individual songs when asked.',
  special: 'One-off or unusual role (e.g. guest circumstances).',
};

export const MUSICIAN_ROLE_ORDER: MusicianSlotRole[] = [
  'primary',
  'every_other',
  'backup',
  'emergency',
  'song_fill',
  'special',
];

export const BAND_PLAYER_TYPE_LABELS: Record<BandPlayerType, string> = {
  regular: 'Regular',
  guest: 'Guest',
};
