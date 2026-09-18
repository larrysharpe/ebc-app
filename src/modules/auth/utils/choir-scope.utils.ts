import type { SessionUser, UserRole } from '@/modules/auth/types/auth.types';

export type ChoirScopeOption = {
  id: string;
  name: string;
};

export type ChoirAccessUser = Pick<SessionUser, 'roles' | 'choirIds'>;

/** Keep choirIds only when the account is a choir director. */
export function choirIdsForRoles(
  roles: readonly UserRole[],
  choirIds?: readonly string[],
): string[] {
  return roles.includes('choir_director') ? [...(choirIds ?? [])] : [];
}

/**
 * Prefer explicit User.choirIds; fall back to choir roster leadership
 * so older accounts keep working until scoped in Settings.
 */
export function resolveScopedChoirIds(
  assignedChoirIds: readonly string[],
  fallbackChoirIds: readonly string[],
): string[] {
  if (assignedChoirIds.length > 0) return [...assignedChoirIds];
  return [...fallbackChoirIds];
}

export function formatChoirScopeLabels(
  choirIds: readonly string[],
  choirs: readonly ChoirScopeOption[],
): string {
  if (choirIds.length === 0) return '';
  const nameById = new Map(choirs.map((choir) => [choir.id, choir.name]));
  return choirIds
    .map((id) => nameById.get(id) ?? id)
    .join(' · ');
}

export function canPlanForChoir(
  user: ChoirAccessUser,
  choirId: string,
  options: { seeAll: boolean; fallbackChoirIds?: readonly string[] },
): boolean {
  if (options.seeAll) return true;
  const scoped = resolveScopedChoirIds(
    user.choirIds,
    options.fallbackChoirIds ?? [],
  );
  return scoped.includes(choirId);
}
