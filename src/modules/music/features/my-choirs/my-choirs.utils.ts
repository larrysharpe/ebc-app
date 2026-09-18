import type { ServiceMusicPlan, SundayOfMonth } from '../../types';
import type { Choir } from '../../types/choir.types';
import { getNthSundayOfMonth } from '../../utils/choir-schedule.utils';

export type PersonChoirParticipation =
  | { kind: 'leader'; title?: string }
  | { kind: 'member'; role: 'singer' | 'soloist' | 'band' };

export type PersonChoirMembership = {
  choir: Choir;
  participation: PersonChoirParticipation;
  /** Next chapel Sunday for this choir, or next Combined plan date. */
  nextServiceDate: string | null;
  /** Next shared (sent) plan for this choir, if any. */
  nextPlanId: string | null;
};

/** Next sent plan for a choir on or after `fromIso`. */
export function nextSentPlanForChoir(
  choirId: string,
  plans: readonly ServiceMusicPlan[],
  fromIso: string = new Date().toISOString().slice(0, 10),
): ServiceMusicPlan | null {
  const from = fromIso.slice(0, 10);
  return (
    [...plans]
      .filter(
        (plan) =>
          plan.status === 'sent' &&
          plan.choirGroup === choirId &&
          plan.serviceDate >= from,
      )
      .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))[0] ?? null
  );
}

const MEMBER_ROLE_LABELS: Record<'singer' | 'soloist' | 'band', string> = {
  singer: 'Singer',
  soloist: 'Soloist',
  band: 'Band',
};

export function formatChoirParticipation(
  participation: PersonChoirParticipation,
): string {
  if (participation.kind === 'leader') {
    return participation.title?.trim()
      ? `Leader · ${participation.title.trim()}`
      : 'Leader';
  }
  return MEMBER_ROLE_LABELS[participation.role];
}

export function participationForPerson(
  choir: Choir,
  personId: string,
): PersonChoirParticipation | null {
  const leader = choir.leaders.find((row) => row.personId === personId);
  if (leader) {
    return { kind: 'leader', title: leader.title };
  }
  const member = choir.members.find((row) => row.personId === personId);
  if (member) {
    return { kind: 'member', role: member.role };
  }
  return null;
}

/** Choir ids where this person is listed as a leader (director). */
export function ledChoirIdsForPerson(
  choirs: readonly Choir[],
  personId: string | null | undefined,
): string[] {
  if (!personId) return [];
  return choirs
    .filter((choir) => choir.leaders.some((leader) => leader.personId === personId))
    .map((choir) => choir.id);
}

/**
 * Plans a choir director should own in finish/draft lists.
 * Music ministers / admins (`seeAll`) get every plan; directors only their choirs.
 */
export function filterPlansForDirectorScope<T extends { choirGroup: string }>(
  plans: readonly T[],
  options: {
    seeAll: boolean;
    ledChoirIds: readonly string[];
  },
): T[] {
  if (options.seeAll) return [...plans];
  const allowed = new Set(options.ledChoirIds);
  return plans.filter((plan) => allowed.has(plan.choirGroup));
}

/** Next date for a choir's default Sunday slot (null if none, e.g. Combined). */
export function nextDefaultServiceDateForChoir(
  defaultSunday: SundayOfMonth | null,
  fromIso: string = new Date().toISOString().slice(0, 10),
): string | null {
  if (!defaultSunday) return null;
  const from = fromIso.slice(0, 10);
  const start = new Date(`${from}T12:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  let year = start.getFullYear();
  let monthIndex = start.getMonth();

  for (let i = 0; i < 24; i += 1) {
    const iso = getNthSundayOfMonth(year, monthIndex, defaultSunday);
    if (iso && iso >= from) return iso;
    monthIndex += 1;
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }
  }
  return null;
}

export function nextServiceDateForChoir(
  choir: Choir,
  plans: readonly ServiceMusicPlan[],
  fromIso: string = new Date().toISOString().slice(0, 10),
): string | null {
  const from = fromIso.slice(0, 10);
  const rotationDate = nextDefaultServiceDateForChoir(choir.defaultSunday, from);
  const planDate = [...plans]
    .filter((plan) => plan.choirGroup === choir.id && plan.serviceDate >= from)
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))[0]
    ?.serviceDate;

  if (rotationDate && planDate) {
    return rotationDate <= planDate ? rotationDate : planDate;
  }
  return rotationDate ?? planDate ?? null;
}

export function choirsForPerson(
  choirs: readonly Choir[],
  personId: string,
  plans: readonly ServiceMusicPlan[] = [],
  fromIso?: string,
): PersonChoirMembership[] {
  const memberships: PersonChoirMembership[] = [];
  for (const choir of choirs) {
    if (!choir.active) continue;
    const participation = participationForPerson(choir, personId);
    if (!participation) continue;
    const nextPlan = nextSentPlanForChoir(choir.id, plans, fromIso);
    memberships.push({
      choir,
      participation,
      nextServiceDate: nextServiceDateForChoir(choir, plans, fromIso),
      nextPlanId: nextPlan?.id ?? null,
    });
  }
  return memberships.sort((a, b) => {
    const aDate = a.nextServiceDate ?? '9999-99-99';
    const bDate = b.nextServiceDate ?? '9999-99-99';
    if (aDate !== bDate) return aDate.localeCompare(bDate);
    return a.choir.sortOrder - b.choir.sortOrder;
  });
}
