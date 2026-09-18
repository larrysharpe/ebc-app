export type {
  SessionImpersonator,
  SessionUser,
  UserRole,
  UserStatus,
} from '@/modules/auth/types/auth.types';
export type { MusicAccess, Permission } from '@/modules/auth/types/permissions.types';
export { ROLE_LABELS } from '@/modules/auth/constants/auth.constants';
export { canAccessRoute, canPerform } from '@/modules/auth/utils/route-access.utils';
export { getMusicAccess, hasPermission } from '@/modules/auth/utils/permissions.utils';
export { getSession, requireSession, signOut } from '@/modules/auth/services/auth.service';
export { SignInForm } from '@/modules/auth/features/sign-in';
export { WelcomeSplash } from '@/modules/auth/features/welcome-splash';
export { resolveWelcomeNextPath } from '@/modules/auth/utils/welcome-destination.utils';
