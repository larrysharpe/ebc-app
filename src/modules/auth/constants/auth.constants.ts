import type { UserRole } from '@/modules/auth/types/auth.types';
import { MUSIC_MODULE_ROLES } from '@/modules/auth/constants/permissions.constants';

export const SESSION_COOKIE = 'ebc_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  webmaster: 'Webmaster',
  pastor: 'Pastor',
  office_staff: 'Office Staff',
  finance: 'Finance',
  trustee: 'Trustee',
  deacon: 'Deacon',
  music_minister: 'Music Minister',
  choir_director: 'Choir Director',
  choir_member: 'Choir Member',
  band_director: 'Band Director',
  band_member: 'Band Member',
  social_manager: 'Social Manager',
  facility_manager: 'Facility Manager',
  ministry_leader: 'Ministry Leader',
  volunteer: 'Volunteer',
};

/** Route prefix → roles allowed (super_admin/admin always allowed via helper). */
const STAFF_HOME_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
  'finance',
  'trustee',
  'deacon',
  ...MUSIC_MODULE_ROLES,
  'social_manager',
  'facility_manager',
  'ministry_leader',
  'volunteer',
];

export const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/': STAFF_HOME_ROLES,
  '/welcome': STAFF_HOME_ROLES,
  '/visitors': ['super_admin', 'admin', 'webmaster', 'pastor', 'office_staff'],
  '/people': [
    'super_admin',
    'admin',
    'webmaster',
    'pastor',
    'office_staff',
    'ministry_leader',
    'deacon',
  ],
  '/members': [
    'super_admin',
    'admin',
    'webmaster',
    'pastor',
    'office_staff',
    'ministry_leader',
    'deacon',
  ],
  '/ministries': [
    'super_admin',
    'admin',
    'webmaster',
    'pastor',
    'office_staff',
    'ministry_leader',
  ],
  '/music': ['super_admin', 'admin', 'webmaster', 'pastor', ...MUSIC_MODULE_ROLES],
  '/events': [
    'super_admin',
    'admin',
    'webmaster',
    'pastor',
    'office_staff',
    'trustee',
  ],
  '/facilities': [
    'super_admin',
    'admin',
    'webmaster',
    'pastor',
    'office_staff',
    'trustee',
    'facility_manager',
  ],
  '/leadership': ['super_admin', 'admin', 'webmaster', 'pastor'],
  '/giving': ['super_admin', 'admin', 'webmaster', 'pastor', 'finance', 'trustee'],
  '/trustees': ['super_admin', 'admin', 'webmaster', 'pastor', 'trustee'],
  '/social': ['super_admin', 'admin', 'webmaster', 'pastor', 'social_manager'],
  '/settings': ['super_admin', 'admin'],
  '/account': STAFF_HOME_ROLES,
};

/** Documented in ACL UI — `/church` is open to every authenticated user via `isGlobalChurchRoute`. */
export const GLOBAL_CHURCH_ROUTE_LABEL = 'Church life (all signed-in users)';

export const PUBLIC_PATHS = ['/login', '/legal'] as const;
