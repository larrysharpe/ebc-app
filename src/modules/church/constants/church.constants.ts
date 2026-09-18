import { CHURCH } from '@/lib/church';

export const CHURCH_CONTACT = {
  prayerEmail: 'prayerrequests@ebenezerbc.org',
  officeEmail: 'churchadmin@ebenezerbc.org',
  deaconMinistryEmail: 'deaconministry@ebenezer.org',
  phone: CHURCH.phone,
  address: CHURCH.address,
} as const;

export const CHURCH_EXTERNAL_URLS = {
  giving: 'https://ebenezerbc.org/other/give',
  calendar: 'https://ebenezerbc.org/event/calendar',
  announcements: 'https://ebenezerbc.org/event/announcements',
  realm: 'https://onrealm.org/',
  youtube: 'https://www.youtube.com/@EBCWoodbridgeVA',
} as const;

export const CHURCH_LIFE_LINKS = [
  {
    id: 'plan',
    href: '/church/plan',
    headerLabel: 'Plan',
    title: 'Church plan',
    description:
      '4-week church-wide priorities rolled up from ministry needs and suggested plans.',
    external: false,
  },
  {
    id: 'giving',
    href: '/church/giving',
    headerLabel: 'Give',
    title: 'Give',
    description: 'Online giving through Realm and the church website.',
    external: false,
  },
  {
    id: 'prayer',
    href: '/church/prayer',
    headerLabel: 'Prayer',
    title: 'Request prayer',
    description: 'Share a prayer need with the pastoral care team confidentially.',
    external: false,
  },
  {
    id: 'deacon',
    href: '/church/deacon',
    headerLabel: 'Family Deacon',
    title: 'Contact your family deacon',
    description:
      'Reach your assigned deacon for pastoral care, visitations, and family support.',
    external: false,
  },
  {
    id: 'calendar',
    href: '/church/calendar',
    headerLabel: 'Calendar',
    title: 'Church calendar',
    description: 'Worship, Bible study, and church-wide events.',
    external: false,
  },
] as const;
