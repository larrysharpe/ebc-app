import type { MinistrySopStatus } from '@/modules/ministries/types';

export const SOP_STATUS_LABELS: Record<MinistrySopStatus, string> = {
  approved: 'Approved',
  in_review: 'In review',
  archived: 'Archived',
  draft: 'Draft',
};

export const SOP_STATUS_CLASSES: Record<MinistrySopStatus, string> = {
  approved: 'bg-ebc-green/15 text-ebc-green-dark',
  in_review: 'bg-ebc-navy/10 text-ebc-navy',
  archived: 'bg-slate-200 text-slate-600',
  draft: 'bg-ebc-gold/20 text-ebc-burgundy-dark',
};
