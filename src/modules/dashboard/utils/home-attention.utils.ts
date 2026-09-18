import type { AttentionItem, AttentionTone } from '@/modules/dashboard/types/dashboard.types';

type DraftPlanInput = {
  id: string;
  title: string;
  serviceDate: string;
  songCount: number;
};

type VisitorInput = {
  id: string;
  name: string;
  visitDate: string;
};

type SopGapInput = {
  ministrySlug: string;
  ministryName: string;
  sopTitle: string;
  score: number;
  minScore: number;
};

type PersonnelGapInput = {
  slug: string;
  name: string;
};

function daysUntil(isoDate: string, today = new Date()): number {
  const target = new Date(`${isoDate}T12:00:00`);
  const start = new Date(today);
  start.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function daysSince(isoDate: string, today = new Date()): number {
  return -daysUntil(isoDate, today);
}

/** Higher urgencyScore = more urgent (sorted descending). */
export function buildAttentionItems(input: {
  draftPlans: DraftPlanInput[];
  newVisitors: VisitorInput[];
  sopGaps: SopGapInput[];
  ministriesWithoutPersonnel: PersonnelGapInput[];
  includeDraftPlans: boolean;
  includeVisitors: boolean;
  now?: Date;
}): AttentionItem[] {
  const now = input.now ?? new Date();
  const items: AttentionItem[] = [];

  if (input.includeDraftPlans) {
    for (const plan of input.draftPlans) {
      const until = daysUntil(plan.serviceDate, now);
      const urgencyScore = until <= 2 ? 100 : until <= 7 ? 90 : 80;
      const tone: AttentionTone = until <= 7 ? 'urgent' : 'normal';
      items.push({
        id: `plan-${plan.id}`,
        label: `Finish choir plan: ${plan.title}`,
        detail:
          until < 0
            ? `${plan.songCount} songs · service was ${plan.serviceDate}`
            : until === 0
              ? `${plan.songCount} songs · service today`
              : `${plan.songCount} songs · service in ${until} day${until === 1 ? '' : 's'}`,
        href: `/music/plans/${plan.id}`,
        tone,
        urgencyScore: urgencyScore - Math.min(until, 30),
      });
    }
  }

  if (input.includeVisitors) {
    for (const visitor of input.newVisitors) {
      const since = daysSince(visitor.visitDate, now);
      items.push({
        id: `visitor-${visitor.id}`,
        label: `Follow up with ${visitor.name}`,
        detail: `Visited ${visitor.visitDate}`,
        href: '/visitors',
        tone: since >= 3 ? 'urgent' : 'normal',
        urgencyScore: 85 + Math.min(since, 14),
      });
    }
  }

  for (const ministry of input.ministriesWithoutPersonnel) {
    items.push({
      id: `personnel-${ministry.slug}`,
      label: `Add personnel: ${ministry.name}`,
      detail: 'No roster contacts on file',
      href: `/ministries/${ministry.slug}?tab=personnel`,
      tone: 'normal',
      urgencyScore: 55,
    });
  }

  for (const gap of input.sopGaps) {
    const deficit = Math.max(0, gap.minScore - gap.score);
    items.push({
      id: `sop-${gap.ministrySlug}-${gap.sopTitle}`,
      label: `Improve SOP: ${gap.sopTitle}`,
      detail: `${gap.ministryName} · quality ${gap.score}/${gap.minScore}`,
      href: `/ministries/${gap.ministrySlug}?tab=sops`,
      tone: deficit >= 20 ? 'urgent' : 'normal',
      urgencyScore: 40 + deficit,
    });
  }

  return items.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) return b.urgencyScore - a.urgencyScore;
    return a.label.localeCompare(b.label);
  });
}
