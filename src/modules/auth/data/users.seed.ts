import type { UserRole } from '@/modules/auth/types/auth.types';

type DevSeedUser = {
  email: string;
  name: string;
  roles: UserRole[];
  ministryIds?: string[];
  choirIds?: string[];
};

export const DEV_SEED_USERS: DevSeedUser[] = [
  {
    email: 'superadmin@ebenezerbc.org',
    name: 'Platform Super Admin',
    roles: ['super_admin'],
  },
  {
    email: 'admin@ebenezerbc.org',
    name: 'Church Administrator',
    roles: ['admin'],
  },
  {
    email: 'webmaster@ebenezerbc.org',
    name: 'Church Webmaster',
    roles: ['webmaster'],
  },
  {
    email: 'pastor@ebenezerbc.org',
    name: 'Pastor',
    roles: ['pastor'],
  },
  {
    email: 'office@ebenezerbc.org',
    name: 'Church Office',
    roles: ['office_staff'],
  },
  {
    email: 'finance@ebenezerbc.org',
    name: 'Finance Team',
    roles: ['finance'],
  },
  {
    email: 'trustee@ebenezerbc.org',
    name: 'Trustee Board',
    roles: ['trustee'],
  },
  {
    email: 'facilities@ebenezerbc.org',
    name: 'Facility Manager',
    roles: ['facility_manager'],
  },
  {
    email: 'facilities.assistant@ebenezerbc.org',
    name: 'Facility Assistant',
    roles: ['facility_manager'],
  },
  {
    email: 'social@ebenezerbc.org',
    name: 'Social Media Manager',
    roles: ['social_manager'],
  },
  {
    email: 'volunteer@ebenezerbc.org',
    name: 'Volunteer',
    roles: ['volunteer'],
  },
  {
    email: 'music@ebenezerbc.org',
    name: 'Music Minister',
    roles: ['music_minister'],
  },
  {
    email: 'lydia.stewart@ebenezerbc.org',
    name: 'Lydia Stewart',
    roles: ['choir_director'],
    choirIds: ['senior', 'youth', 'combined'],
  },
  {
    email: 'nikki.jennings@ebenezerbc.org',
    name: 'Niki Jennings',
    roles: ['choir_director'],
    choirIds: ['adult'],
  },
  {
    email: 'leonard.whicker@ebenezerbc.org',
    name: 'Leonard Whicker',
    roles: ['choir_director'],
    choirIds: ['mens'],
  },
  {
    email: 'choir@ebenezerbc.org',
    name: 'Choir Director (demo)',
    roles: ['choir_director'],
    choirIds: ['senior'],
  },
  {
    email: 'choir.member@ebenezerbc.org',
    name: 'Choir Member',
    roles: ['choir_member'],
  },
  {
    email: 'band@ebenezerbc.org',
    name: 'Band Director',
    roles: ['band_director'],
  },
  {
    email: 'band.member@ebenezerbc.org',
    name: 'Band Member',
    roles: ['band_member'],
  },
  {
    email: 'youth.leader@ebenezerbc.org',
    name: 'Keyonia Waters',
    roles: ['ministry_leader'],
    ministryIds: ['min-youth'],
  },
  {
    email: 'missionary.leader@ebenezerbc.org',
    name: 'Missionary Ministry Lead',
    roles: ['ministry_leader'],
    ministryIds: ['min-missionary'],
  },
  {
    email: 'media.leader@ebenezerbc.org',
    name: 'Media Ministry Lead',
    roles: ['ministry_leader'],
    ministryIds: ['min-media'],
  },
  {
    email: 'womens.leader@ebenezerbc.org',
    name: "Women's Ministry Lead",
    roles: ['ministry_leader'],
    ministryIds: ['min-womens'],
  },
  {
    email: 'usher.leader@ebenezerbc.org',
    name: 'Usher & Greeter Lead',
    roles: ['ministry_leader'],
    ministryIds: ['min-usher'],
  },
  {
    email: 'deacon.choir.jamm@ebenezerbc.org',
    name: 'Marcus Johnson',
    roles: ['deacon', 'choir_member', 'ministry_leader'],
    ministryIds: ['min-jamm'],
  },
];

export const DEV_SEED_PASSWORD = 'EBCDev2026!';

export const DEV_ACCOUNT_GROUPS = [
  { label: 'Platform', emails: ['superadmin@ebenezerbc.org', 'admin@ebenezerbc.org', 'webmaster@ebenezerbc.org'] },
  { label: 'Church staff', emails: ['pastor@ebenezerbc.org', 'office@ebenezerbc.org', 'finance@ebenezerbc.org'] },
  {
    label: 'Ministry leaders (scoped)',
    emails: [
      'youth.leader@ebenezerbc.org',
      'missionary.leader@ebenezerbc.org',
      'media.leader@ebenezerbc.org',
      'womens.leader@ebenezerbc.org',
      'usher.leader@ebenezerbc.org',
    ],
  },
  {
    label: 'Multi-role example',
    emails: ['deacon.choir.jamm@ebenezerbc.org'],
  },
  {
    label: 'Music',
    emails: [
      'music@ebenezerbc.org',
      'lydia.stewart@ebenezerbc.org',
      'nikki.jennings@ebenezerbc.org',
      'leonard.whicker@ebenezerbc.org',
      'choir@ebenezerbc.org',
      'choir.member@ebenezerbc.org',
      'band@ebenezerbc.org',
      'band.member@ebenezerbc.org',
    ],
  },
  { label: 'Other roles', emails: ['trustee@ebenezerbc.org', 'facilities@ebenezerbc.org', 'facilities.assistant@ebenezerbc.org', 'social@ebenezerbc.org', 'volunteer@ebenezerbc.org'] },
] as const;
