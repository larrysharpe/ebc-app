import type { SessionUser, UserRole, UserStatus } from '@/modules/auth/types/auth.types';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  roles: readonly UserRole[];
  status: UserStatus;
  ministryIds: readonly string[];
  choirIds: readonly string[];
};

export type SaveUserInput = {
  id?: string;
  email: string;
  name: string;
  roles: UserRole[];
  status: UserStatus;
  ministryIds?: string[];
  choirIds?: string[];
  password?: string;
};

export type AclRouteRow = {
  route: string;
  label: string;
  roles: UserRole[];
};

export type AclPermissionRow = {
  permission: string;
  label: string;
  description: string;
};

export type UserAdminContext = Pick<SessionUser, 'id' | 'roles'>;
