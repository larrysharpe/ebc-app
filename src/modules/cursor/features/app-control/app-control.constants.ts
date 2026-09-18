import { MINISTRY_SCOPES } from '@/modules/auth/constants/ministry-scope.constants';

export type AppRouteTarget = {
  path: string;
  label: string;
  aliases: string[];
};

export type MinistryRouteTarget = {
  slug: string;
  name: string;
  aliases: string[];
};

export const APP_ROUTE_TARGETS: AppRouteTarget[] = [
  { path: '/', label: 'Home', aliases: ['home', 'dashboard', 'start'] },
  { path: '/ministries', label: 'Ministries', aliases: ['ministries', 'ministry list'] },
  { path: '/visitors', label: 'Visitors', aliases: ['visitors', 'visitor'] },
  { path: '/music', label: 'Music', aliases: ['music', 'choir', 'band'] },
  {
    path: '/music/plans',
    label: 'Choir plans',
    aliases: ['music plans', 'service plans', 'choir plans', 'engagement plans'],
  },
  { path: '/leadership', label: 'Leadership', aliases: ['leadership', 'sop templates', 'sop guidance'] },
  {
    path: '/leadership/sop-templates',
    label: 'SOP templates',
    aliases: ['sop templates', 'leadership sop templates'],
  },
  { path: '/settings', label: 'Settings', aliases: ['settings', 'accounts', 'users'] },
  { path: '/church', label: 'Church life', aliases: ['church', 'church life'] },
  { path: '/giving', label: 'Giving', aliases: ['giving', 'tithes'] },
];

const EXTRA_MINISTRY_ALIASES: Record<string, string[]> = {
  'media-ministry': ['media', 'av', 'livestream', 'live stream', 'sound'],
  'golden-eagles': ['golden eagles', 'seniors', 'senior citizens'],
  'youth-ministry': ['youth'],
  'womens-ministry': ['women', "women's", 'womens'],
  'missionary-ministry': ['missionary', 'missions'],
  jamm: ['jamm', "joseph's army", 'josephs army'],
  'count-me-in': ['count me in', 'countmein', 'volunteers signup'],
  'usher-greeter': ['usher', 'greeter', 'ushers'],
  'nehemiah-project': ['nehemiah'],
  'mountain-men': ['mountain men', 'mens ministry', "men's ministry"],
  'deacon-ministry': ['deacon', 'deacons'],
  'deaconess-ministry': ['deaconess', 'deaconesses'],
  'trustee-ministry': ['trustee', 'trustees'],
  'sunday-school': ['sunday school', 'church school'],
  'wednesday-bible-study': ['bible study', 'wednesday bible study'],
};

export const MINISTRY_ROUTE_TARGETS: MinistryRouteTarget[] = MINISTRY_SCOPES.map((ministry) => ({
  slug: ministry.slug,
  name: ministry.name,
  aliases: [
    ministry.name.toLowerCase(),
    ministry.slug.replace(/-/g, ' '),
    ...(EXTRA_MINISTRY_ALIASES[ministry.slug] ?? []),
  ],
}));

export const MINISTRY_TABS = [
  { id: 'overview', aliases: ['overview', 'about', 'details'] },
  { id: 'personnel', aliases: ['personnel', 'roster', 'people', 'team', 'staff'] },
  { id: 'calendar', aliases: ['calendar', 'events', 'schedule'] },
  { id: 'sops', aliases: ['sop', 'sops', 'standard operating', 'procedures', 'procedure'] },
  {
    id: 'media',
    aliases: ['media', 'media library', 'photos', 'gallery'],
  },
  {
    id: 'documents',
    aliases: ['documents', 'docs', 'document library', 'files', 'paperwork'],
  },
] as const;

/** Paths the UI is allowed to navigate to via app control. */
export const ALLOWED_PATH_PREFIXES = [
  '/',
  '/ministries',
  '/visitors',
  '/music',
  '/leadership',
  '/settings',
  '/church',
  '/giving',
  '/login',
] as const;
