import type { UserRole } from '@/modules/auth/types/auth.types';
import { canManageMinistry } from '@/modules/auth/utils/ministry-scope.utils';
import { normalizeRoles } from '@/modules/auth/utils/roles.utils';

import type { ChurchEvent } from '../types/church-event.types';
import { canManageSundayServices } from './sunday-service-access.utils';

/** Office / pastor / admin — manage the church-wide calendar. */
export function canManageChurchCalendar(
  roleOrRoles: UserRole | string | readonly (UserRole | string)[],
): boolean {
  return canManageSundayServices(roleOrRoles);
}

export type ChurchEventAccessUser = {
  roles: readonly (UserRole | string)[];
  ministryIds?: readonly string[];
};

/** Create/edit church-wide events, or any ministry event (staff Events page). */
export function canManageChurchWideEvents(user: ChurchEventAccessUser): boolean {
  return canManageChurchCalendar(user.roles);
}

/** Create/edit events for a specific ministry (leaders or global staff). */
export function canManageMinistryEvents(
  user: ChurchEventAccessUser,
  ministryId: string,
): boolean {
  if (canManageChurchCalendar(user.roles)) return true;
  return canManageMinistry(
    { roles: normalizeRoles(user.roles), ministryIds: [...(user.ministryIds ?? [])] },
    ministryId,
  );
}

const ACTIVITY_APPROVER_ROLES: readonly UserRole[] = [
  'super_admin',
  'admin',
  'webmaster',
  'pastor',
  'office_staff',
  'trustee',
];

/** Office staff or trustee (plus platform admins/pastor) may approve activity requests. */
export function canApproveActivityRequest(
  roleOrRoles: UserRole | string | readonly (UserRole | string)[],
): boolean {
  return normalizeRoles(roleOrRoles).some((role) =>
    ACTIVITY_APPROVER_ROLES.includes(role),
  );
}

/**
 * Whether action buttons (edit/publish/cancel/delete) should show for a row.
 *
 * - Staff Events page (`manageMinistryId` unset): any non-cancelled event.
 * - Ministry calendar: only events owned by that ministry — never church-wide
 *   (those are view-only here; manage them under Events → Calendar).
 */
export function canManageListedEvent(
  event: Pick<ChurchEvent, 'ministryId' | 'status'>,
  options: {
    canManage: boolean;
    manageMinistryId?: string;
  },
): boolean {
  if (!options.canManage || event.status === 'cancelled') return false;
  if (!options.manageMinistryId) return true;
  return event.ministryId === options.manageMinistryId;
}
