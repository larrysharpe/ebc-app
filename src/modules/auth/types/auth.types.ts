export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'webmaster'
  | 'pastor'
  | 'office_staff'
  | 'finance'
  | 'trustee'
  | 'deacon'
  | 'music_minister'
  | 'choir_director'
  | 'choir_member'
  | 'band_director'
  | 'band_member'
  | 'social_manager'
  | 'facility_manager'
  | 'ministry_leader'
  | 'volunteer';

/** Legacy values still stored on older accounts until migrated. */
export type LegacyUserRole = 'music_director' | 'musician';

export type StoredUserRole = UserRole | LegacyUserRole;

export type UserStatus = 'active' | 'disabled';

/** Original account when a Super Admin is viewing the app as another user. */
export type SessionImpersonator = {
  id: string;
  email: string;
  name: string;
  roles: readonly UserRole[];
  ministryIds: readonly string[];
  choirIds: readonly string[];
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  roles: readonly UserRole[];
  ministryIds: readonly string[];
  /** Choirs this choir_director may plan for (empty = fall back to roster leaders). */
  choirIds: readonly string[];
  /** Set when logged in as another user; restore via stop impersonating. */
  impersonator?: SessionImpersonator;
};

export type AuthUserRecord = SessionUser & {
  passwordHash: string;
  status: UserStatus;
};
