export const CHURCH = {
  name: 'Ebenezer Baptist Church',
  location: 'Woodbridge, Virginia',
  mission: 'Putting the Family Back Together',
  themeLine: "We're Marching to Zion!",
  address: '13020 Telegraph Road, Woodbridge, VA 22192',
  phone: '(703) 494-2669',
} as const;

export const WEEKLY_RHYTHM = [
  {
    id: 'sunday-school',
    label: 'Sunday School',
    schedule: 'Sundays',
    time: '9:00 AM',
    note: 'All ages',
  },
  {
    id: 'worship',
    label: 'Sunday Worship',
    schedule: 'Sundays',
    time: '10:00 AM',
    note: 'Chapel · YouTube & Facebook live',
  },
  {
    id: 'prayer-bible',
    label: 'Prayer & Bible Study',
    schedule: 'Wednesdays',
    time: '7:00 PM',
    note: 'Zoom',
  },
] as const;

export const QUICK_LINKS = [
  {
    id: 'website',
    label: 'Church Website',
    description: 'ebenezerbc.org',
    href: 'https://ebenezerbc.org/',
    accent: 'burgundy' as const,
  },
  {
    id: 'give',
    label: 'Online Giving',
    description: 'Realm & give page',
    href: 'https://ebenezerbc.org/give/',
    accent: 'green' as const,
  },
  {
    id: 'youtube',
    label: 'Watch Live',
    description: 'YouTube worship',
    href: 'https://www.youtube.com/@EBCWoodbridgeVA',
    accent: 'navy' as const,
  },
  {
    id: 'realm',
    label: 'Realm Connect',
    description: 'Giving & community app',
    href: 'https://onrealm.org/',
    accent: 'gold' as const,
  },
] as const;

/** Official EBC logo (transparent PNG) — `public/branding/ebc-official-logo.png` */
export const LOGO_URL = '/branding/ebc-official-logo.png';

export const LOGO_ALT = 'Ebenezer Baptist Church — cross, Ebenezer script, Baptist Church';
