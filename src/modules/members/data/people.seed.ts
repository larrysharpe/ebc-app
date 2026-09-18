import type { Person } from '../types';

type PersonSeed = Omit<Person, 'createdAt' | 'updatedAt' | 'isMinor'> & {
  isMinor?: boolean;
};

const SEED_ROWS: PersonSeed[] = [
  {
    id: 'person-willie-mccarter',
    firstName: 'Willie',
    lastName: 'McCarter',
    email: 'willie.mccarter@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-larry-sharpe',
    firstName: 'Larry',
    lastName: 'Sharpe',
    email: 'larry.sharpe@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-robert-tbd',
    firstName: 'Robert',
    lastName: '(TBD)',
    email: 'robert.tbd@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Last name to confirm',
  },
  {
    id: 'person-joshua-brown',
    firstName: 'Joshua',
    lastName: 'Brown',
    email: 'joshua.brown@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-jackson-chandler',
    firstName: 'Jackson',
    lastName: 'Chandler',
    email: 'jackson.chandler@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-cory-davis',
    firstName: 'Cory',
    lastName: 'Davis',
    email: 'cory.davis@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-diego-haynesworth',
    firstName: 'Diego',
    lastName: 'Haynesworth',
    email: 'diego.haynesworth@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-sherman-miller',
    firstName: 'Sherman',
    lastName: 'Miller',
    email: 'sherman.miller@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-sherman-miller-jr',
    firstName: 'Sherman',
    lastName: 'Miller',
    suffix: 'Jr.',
    email: 'sherman.miller.jr@ebenezerbc.org',
    membershipStatus: 'member',
  },

  // Choir leaders (church)
  {
    id: 'person-lydia-stewart',
    firstName: 'Lydia',
    lastName: 'Stewart',
    email: 'lydia.stewart@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Choir director / Deaconess — Senior, Youth, Combined',
  },
  {
    id: 'person-nikki-jennings',
    firstName: 'Niki',
    lastName: 'Jennings',
    email: 'nikki.jennings@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-leonard-whicker',
    firstName: 'Leonard',
    lastName: 'Whicker',
    email: 'leonard.whicker@ebenezerbc.org',
    membershipStatus: 'member',
  },
  {
    id: 'person-kayla-tbd',
    firstName: 'Kayla',
    lastName: '(TBD)',
    email: 'kayla.tbd@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Young Adult Choir — last name to confirm',
  },
  {
    id: 'person-alex-tbd',
    firstName: 'Alex',
    lastName: '(TBD)',
    email: 'alex.tbd@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Young Adult Choir — last name to confirm',
  },

  // Demo music accounts linked to directory (same emails as users.seed)
  {
    id: 'person-music-minister',
    firstName: 'Music',
    lastName: 'Minister',
    email: 'music@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Dev seed — matches music@ login',
  },
  {
    id: 'person-choir-member-demo',
    firstName: 'Choir',
    lastName: 'Member',
    email: 'choir.member@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Dev seed — matches choir.member@ login',
  },
  {
    id: 'person-band-director-demo',
    firstName: 'Band',
    lastName: 'Director',
    email: 'band@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Dev seed — matches band@ login',
  },
  {
    id: 'person-band-member-demo',
    firstName: 'Band',
    lastName: 'Member',
    email: 'band.member@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Dev seed — matches band.member@ login',
  },
  {
    id: 'person-marcus-johnson',
    firstName: 'Marcus',
    lastName: 'Johnson',
    email: 'deacon.choir.jamm@ebenezerbc.org',
    membershipStatus: 'member',
    notes: 'Dev seed — deacon + choir + JAMM leader',
  },

  // Hired musicians (not church members)
  {
    id: 'person-andre-porter',
    firstName: 'Andre',
    lastName: 'Porter',
    email: 'andre.porter@ebenezerbc.org',
    membershipStatus: 'hired',
    notes: 'Hired musician — keys',
  },
  {
    id: 'person-lauren-guinyard',
    firstName: 'Lauren',
    lastName: 'Guinyard',
    email: 'lauren.guinyard@ebenezerbc.org',
    membershipStatus: 'hired',
    notes: 'Hired musician — keys',
  },
  {
    id: 'person-gore',
    firstName: 'Gore',
    lastName: '(TBD)',
    email: 'gore.tbd@ebenezerbc.org',
    membershipStatus: 'hired',
    notes: 'Hired musician — bass; first name TBD',
  },
];

/** Seed church directory people used by ministry rosters, music, etc. */
export const PEOPLE_SEED: Array<Omit<Person, 'createdAt' | 'updatedAt'>> =
  SEED_ROWS.map((row) => ({
    ...row,
    isMinor: row.isMinor ?? false,
  }));

export const HIRED_MUSICIAN_PERSON_IDS = [
  'person-andre-porter',
  'person-lauren-guinyard',
  'person-gore',
];
