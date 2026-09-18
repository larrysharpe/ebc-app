/** Ministry id/slug pairs for route and scope checks (kept in auth to avoid cross-module imports). */
export const MINISTRY_SCOPES = [
  { id: 'min-youth', slug: 'youth-ministry', name: 'Youth Ministry' },
  { id: 'min-missionary', slug: 'missionary-ministry', name: 'Missionary Ministry' },
  { id: 'min-media', slug: 'media-ministry', name: 'Media Ministry' },
  { id: 'min-sunday-school', slug: 'sunday-school', name: 'Sunday School' },
  { id: 'min-bible-study', slug: 'wednesday-bible-study', name: 'Wednesday Bible Study' },
  { id: 'min-womens', slug: 'womens-ministry', name: "Women's Ministry" },
  { id: 'min-mountain-men', slug: 'mountain-men', name: 'Mountain Men' },
  { id: 'min-golden-eagles', slug: 'golden-eagles', name: 'Golden Eagles' },
  { id: 'min-jamm', slug: 'jamm', name: 'JAMM' },
  { id: 'min-deacon', slug: 'deacon-ministry', name: 'Deacon Ministry' },
  { id: 'min-deaconess', slug: 'deaconess-ministry', name: 'Deaconess Ministry' },
  { id: 'min-trustee', slug: 'trustee-ministry', name: 'Trustee Ministry' },
  { id: 'min-count-me-in', slug: 'count-me-in', name: 'Count Me In' },
  { id: 'min-usher', slug: 'usher-greeter', name: 'Usher & Greeter' },
  { id: 'min-nehemiah', slug: 'nehemiah-project', name: 'Nehemiah Project' },
] as const;

export type MinistryScopeId = (typeof MINISTRY_SCOPES)[number]['id'];
export type MinistryScopeSlug = (typeof MINISTRY_SCOPES)[number]['slug'];

export const MINISTRY_ID_BY_SLUG: Record<string, MinistryScopeId> = Object.fromEntries(
  MINISTRY_SCOPES.map((entry) => [entry.slug, entry.id]),
) as Record<string, MinistryScopeId>;

export const MINISTRY_SLUG_BY_ID: Record<MinistryScopeId, MinistryScopeSlug> = Object.fromEntries(
  MINISTRY_SCOPES.map((entry) => [entry.id, entry.slug]),
) as Record<MinistryScopeId, MinistryScopeSlug>;

export const MINISTRY_NAME_BY_ID: Record<MinistryScopeId, string> = Object.fromEntries(
  MINISTRY_SCOPES.map((entry) => [entry.id, entry.name]),
) as Record<MinistryScopeId, string>;

/** Roles that can access every ministry (not scoped to ministryId). */
export const GLOBAL_MINISTRY_ACCESS_ROLES = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
] as const;

/** Roles with full platform access (all modules and settings). */
export const PLATFORM_ADMIN_ROLES = ['super_admin', 'admin'] as const;
