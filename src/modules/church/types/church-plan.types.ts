export type ChurchPlanRecord = {
  suggestedPlan?: string;
  suggestedPlanGeneratedAt?: string;
};

export type MinistryPlanRollupEntry = {
  slug: string;
  name: string;
  category: string;
  urgentSignals: string[];
  normalSignals: string[];
  planExcerpt: string | null;
  planGeneratedAt?: string;
};

export type ChurchPlanViewModel = {
  plan: ChurchPlanRecord;
  rollup: MinistryPlanRollupEntry[];
  urgentCount: number;
  ministriesWithPlan: number;
};
