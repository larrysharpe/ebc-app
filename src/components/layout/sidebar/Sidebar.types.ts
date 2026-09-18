import type { NavIcon } from './sidebar.constants';
import type { UserRole } from '@/modules/auth/types/auth.types';

export type SidebarMinistry = {
  slug: string;
  name: string;
};

export type SidebarProps = {
  currentPath: string;
  userRoles: readonly UserRole[];
  ministries: SidebarMinistry[];
  /**
   * When true, staff module links are hidden and only assigned ministries appear
   * (sole `ministry_leader` role).
   */
  ministryOnlyNav?: boolean;
  className?: string;
  onNavigate?: () => void;
  ariaHidden?: boolean;
  /** Church life shortcuts (Plan, Give, …) — used in the mobile drawer. */
  showChurchLifeLinks?: boolean;
};

export type NavItemProps = {
  href: string;
  label: string;
  icon: NavIcon;
  available: boolean;
  active: boolean;
  onNavigate?: () => void;
};
