import type { ChoirLeader, ChoirMember, SundayOfMonth } from './music.types';

/** Virtual choir for joint engagements (Christmas, revival, etc.). Not in Sunday rotation. */
export const COMBINED_CHOIR_ID = 'combined';

/** A chapel choir — managed in Choir setup (Music Minister). */
export type Choir = {
  id: string;
  name: string;
  leaders: ChoirLeader[];
  members: ChoirMember[];
  /** Which Sunday of the month this choir normally sings (1–5), if any. */
  defaultSunday: SundayOfMonth | null;
  sortOrder: number;
  active: boolean;
  notes?: string;
};

export function isCombinedChoir(choirId: string): boolean {
  return choirId === COMBINED_CHOIR_ID;
}

/** Seed choirs — leaders are Person ids (see members people.seed). */
export const DEFAULT_CHOIR_SEED: Choir[] = [
  {
    id: 'senior',
    name: 'Senior Choir',
    leaders: [{ personId: 'person-lydia-stewart', title: 'Deaconess' }],
    members: [{ personId: 'person-robert-tbd', role: 'singer' }],
    defaultSunday: 1,
    sortOrder: 1,
    active: true,
  },
  {
    id: 'youth',
    name: 'Youth Choir',
    leaders: [{ personId: 'person-lydia-stewart', title: 'Deaconess' }],
    members: [
      { personId: 'person-jackson-chandler', role: 'singer' },
      { personId: 'person-sherman-miller-jr', role: 'singer' },
    ],
    defaultSunday: 2,
    sortOrder: 2,
    active: true,
  },
  {
    id: 'adult',
    name: 'Adult Choir',
    leaders: [{ personId: 'person-nikki-jennings' }],
    members: [
      { personId: 'person-joshua-brown', role: 'singer' },
      { personId: 'person-cory-davis', role: 'singer' },
      { personId: 'person-diego-haynesworth', role: 'soloist' },
      { personId: 'person-marcus-johnson', role: 'singer' },
    ],
    defaultSunday: 3,
    sortOrder: 3,
    active: true,
  },
  {
    id: 'mens',
    name: "Men's Choir",
    leaders: [{ personId: 'person-leonard-whicker' }],
    members: [
      { personId: 'person-willie-mccarter', role: 'singer' },
      { personId: 'person-larry-sharpe', role: 'singer' },
      { personId: 'person-sherman-miller', role: 'singer' },
    ],
    defaultSunday: 4,
    sortOrder: 4,
    active: true,
  },
  {
    id: 'young_adult',
    name: 'Young Adult Choir',
    leaders: [
      { personId: 'person-kayla-tbd' },
      { personId: 'person-alex-tbd' },
    ],
    members: [{ personId: 'person-choir-member-demo', role: 'singer' }],
    defaultSunday: 5,
    sortOrder: 5,
    active: true,
  },
  {
    id: COMBINED_CHOIR_ID,
    name: 'Combined Choir',
    leaders: [{ personId: 'person-lydia-stewart', title: 'Deaconess' }],
    members: [],
    defaultSunday: null,
    sortOrder: 100,
    active: true,
    notes:
      'For joint engagements (e.g. Christmas, revival). Add the singers who are participating; use the plan occasion to name which groups (Youth + Senior, etc.). Not assigned a monthly Sunday.',
  },
];
