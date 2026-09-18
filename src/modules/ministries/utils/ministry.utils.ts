import type { Ministry, MinistryCategory } from '../types';
import { MINISTRY_CATEGORIES } from '../types';

export function groupMinistriesByCategory(
  ministries: Ministry[],
): Record<MinistryCategory, Ministry[]> {
  const groups = Object.keys(MINISTRY_CATEGORIES).reduce(
    (acc, key) => {
      acc[key as MinistryCategory] = [];
      return acc;
    },
    {} as Record<MinistryCategory, Ministry[]>,
  );

  for (const ministry of ministries) {
    groups[ministry.category].push(ministry);
  }

  for (const category of Object.keys(groups) as MinistryCategory[]) {
    groups[category].sort((a, b) => a.name.localeCompare(b.name));
  }

  return groups;
}

export function getPrimaryLeaderName(ministry: Ministry): string | null {
  const leader =
    ministry.personnel.find((p) => p.role === 'director' || p.role === 'chair') ??
    ministry.personnel[0];
  return leader?.name ?? null;
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function sortEventsUpcoming(events: Ministry['events']): Ministry['events'] {
  return [...events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
  );
}
