import type { SopSectionId } from '@/modules/leadership/types';

export type SopDraft = {
  title: string;
  templateId: string;
  sections: Record<SopSectionId, string>;
};

export type SopQualityCheck = {
  id: string;
  label: string;
  passed: boolean;
  tip: string;
  weight: number;
};

export type SopQualityResult = {
  score: number;
  checks: SopQualityCheck[];
  readyToPublish: boolean;
};
