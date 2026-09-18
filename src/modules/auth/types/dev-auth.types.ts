import type { UserRole } from '@/modules/auth/types/auth.types';

export type DevAccountOption = {
  /** Present for DB-backed accounts outside the curated seed list. */
  id?: string;
  email: string;
  name: string;
  roles: readonly UserRole[];
  ministryIds: readonly string[];
  choirIds: readonly string[];
  group: string;
};
