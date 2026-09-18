export type NavChildItem = {
  href: string;
  label: string;
};

export type NavItemConfig = {
  href: string;
  label: string;
  icon: 'home' | 'users' | 'calendar' | 'music' | 'heart' | 'megaphone' | 'share' | 'gift' | 'shield' | 'building' | 'leadership' | 'settings';
  available: boolean;
  children?: readonly NavChildItem[];
};

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { href: '/', label: 'Home', icon: 'home', available: true },
  { href: '/visitors', label: 'Visitors', icon: 'users', available: true },
  { href: '/people', label: 'People', icon: 'users', available: true },
  {
    href: '/events',
    label: 'Events',
    icon: 'calendar',
    available: true,
    /** Children built role-aware in `getNavItemsForRoles`. */
    children: [
      { href: '/events', label: 'Calendar' },
      { href: '/events/services', label: 'Sunday services' },
    ],
  },
  {
    href: '/music',
    label: 'Music',
    icon: 'music',
    available: true,
    /** Children built role-aware in `getNavItemsForRoles` (job-first). */
    children: [
      { href: '/music/plans', label: 'Choir plans' },
      { href: '/music/songs', label: 'Songs' },
      { href: '/music/choirs', label: 'My choirs' },
      { href: '/music/band', label: 'Band' },
    ],
  },
  { href: '/volunteers', label: 'Volunteers', icon: 'heart', available: false },
  { href: '/communications', label: 'Communications', icon: 'megaphone', available: false },
  { href: '/social', label: 'Social', icon: 'share', available: false },
  { href: '/giving', label: 'Giving', icon: 'gift', available: false },
  { href: '/trustees', label: 'Trustees', icon: 'shield', available: false },
  { href: '/facilities', label: 'Facilities', icon: 'building', available: true },
  { href: '/leadership', label: 'Leadership', icon: 'leadership', available: true },
  { href: '/settings', label: 'Settings', icon: 'settings', available: true },
];

export type NavIcon = NavItemConfig['icon'] | 'layers';
