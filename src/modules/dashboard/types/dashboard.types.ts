export type DashboardEventItem = {
  id: string;
  title: string;
  startAt: string;
  location?: string;
  ministrySlug: string;
  ministryName: string;
};

export type DashboardPlanItem = {
  id: string;
  title: string;
  serviceDate: string;
  choirGroup: string;
  songCount: number;
};

export type DashboardSopGap = {
  ministrySlug: string;
  ministryName: string;
  sopTitle: string;
  score: number;
  minScore: number;
};

export type DashboardVisitorItem = {
  id: string;
  name: string;
  visitDate: string;
  status: string;
};

export type OperationalSnapshot = {
  draftPlans: DashboardPlanItem[];
  upcomingEvents: DashboardEventItem[];
  sopGaps: DashboardSopGap[];
  newVisitors: DashboardVisitorItem[];
  ministriesWithoutPersonnel: { slug: string; name: string }[];
};

export type AttentionTone = 'urgent' | 'normal';

export type AttentionItem = {
  id: string;
  label: string;
  detail: string;
  href: string;
  tone: AttentionTone;
  urgencyScore: number;
};

export type HomeMinistryCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  meta: string;
};

export type HomeDashboardData = {
  greetingName: string;
  roleLabel: string;
  attentionItems: AttentionItem[];
  myMinistries: HomeMinistryCard[];
  snapshot: OperationalSnapshot;
};
