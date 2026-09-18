import type { MinistrySop, MinistrySopStatus } from '@/modules/ministries/types';

import { SOP_STATUS_CLASSES, SOP_STATUS_LABELS } from './sop-panel.constants';

export function sopStatusLabel(status: MinistrySopStatus | undefined): string {
  return SOP_STATUS_LABELS[status ?? 'draft'];
}

export function sopStatusClass(status: MinistrySopStatus | undefined): string {
  return SOP_STATUS_CLASSES[status ?? 'draft'];
}

export function resolveSelectedSop(
  sops: MinistrySop[],
  selectedId: string | null,
): MinistrySop | null {
  if (sops.length === 0) return null;
  return sops.find((sop) => sop.id === selectedId) ?? sops[0] ?? null;
}
