import type { Ministry } from '../types';

/** True when there is no generated-at timestamp, or it is older than maxAgeHours. */
export function isSuggestedPlanStale(
  generatedAtIso: string | undefined,
  maxAgeHours: number,
  now: Date = new Date(),
): boolean {
  if (!generatedAtIso) return true;
  const generatedAt = new Date(generatedAtIso);
  if (Number.isNaN(generatedAt.getTime())) return true;
  const ageMs = now.getTime() - generatedAt.getTime();
  return ageMs >= maxAgeHours * 60 * 60 * 1000;
}

/** Prefer never-generated first, then oldest generatedAt. */
export function sortMinistriesForSuggestedPlanRefresh(
  ministries: Ministry[],
): Ministry[] {
  return [...ministries].sort((a, b) => {
    const aAt = a.suggestedPlanGeneratedAt
      ? new Date(a.suggestedPlanGeneratedAt).getTime()
      : 0;
    const bAt = b.suggestedPlanGeneratedAt
      ? new Date(b.suggestedPlanGeneratedAt).getTime()
      : 0;
    const aMissing = a.suggestedPlanGeneratedAt ? 1 : 0;
    const bMissing = b.suggestedPlanGeneratedAt ? 1 : 0;
    if (aMissing !== bMissing) return aMissing - bMissing;
    return aAt - bAt;
  });
}

export function formatSuggestedPlanGeneratedAt(
  generatedAtIso: string,
  now: Date = new Date(),
): string {
  const generatedAt = new Date(generatedAtIso);
  if (Number.isNaN(generatedAt.getTime())) return 'Unknown time';

  const diffMs = now.getTime() - generatedAt.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return generatedAt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
