import type { MinistryCategory } from '@/modules/ministries/types';

export type SopSectionId =
  | 'purpose'
  | 'scope'
  | 'structure'
  | 'membership'
  | 'meetings'
  | 'whenToUse'
  | 'responsible'
  | 'before'
  | 'steps'
  | 'after'
  | 'safety'
  | 'contacts';

export type SopSectionConfig = {
  id: SopSectionId;
  label: string;
  hint: string;
  placeholder: string;
  required: boolean;
  /** When true, guided editor shows this section only for charter templates (or if already filled). */
  charterOnly?: boolean;
};

export type SopTemplateConfig = {
  id: string;
  label: string;
  description: string;
  categories: MinistryCategory[];
  suggestedTitle: string;
  prefill: Partial<Record<SopSectionId, string>>;
  enabled: boolean;
  /** Defaults to task when omitted. */
  kind?: 'charter' | 'task';
};

export type SopConfigStore = {
  sections: SopSectionConfig[];
  templates: SopTemplateConfig[];
  categoryDefaults: Record<MinistryCategory, string>;
  minQualityScore: number;
  updatedAt: string;
};
