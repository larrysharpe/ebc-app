/** Stored value when scripture reader / prayer leader is not needed. */
export const PLAN_SERVICE_ROLE_NA = 'N/A';

export function isPlanServiceRoleNa(
  value: string | null | undefined,
): boolean {
  return Boolean(value && value.trim().toUpperCase() === 'N/A');
}

/** Blank underline when unset; "N/A" when marked not applicable. */
export function formatPlanServiceRole(
  value: string | null | undefined,
  blank = '_____________________________',
): string {
  if (isPlanServiceRoleNa(value)) return PLAN_SERVICE_ROLE_NA;
  const trimmed = value?.trim();
  return trimmed ? trimmed : blank;
}

export function normalizePlanServiceRoleInput(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) return null;
  if (trimmed.toUpperCase() === 'N/A') return PLAN_SERVICE_ROLE_NA;
  return trimmed;
}

/** Callout asking for volunteers; null when both roles are N/A. */
export function planServiceRolesCallout(
  scriptureReader: string | null | undefined,
  prayerLeader: string | null | undefined,
): string | null {
  const scriptureNa = isPlanServiceRoleNa(scriptureReader);
  const prayerNa = isPlanServiceRoleNa(prayerLeader);
  if (scriptureNa && prayerNa) return null;
  if (scriptureNa) return 'I need someone for prayer.';
  if (prayerNa) return 'I need someone to read the scripture.';
  return 'I need someone to read the scripture and prayer.';
}
