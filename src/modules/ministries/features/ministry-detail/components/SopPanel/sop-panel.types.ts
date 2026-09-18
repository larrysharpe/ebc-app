import type { SopConfigStore } from '@/modules/leadership/types';
import type { Ministry, MinistrySop, MinistrySopStatus } from '@/modules/ministries/types';

export type SopPanelProps = {
  ministry: Ministry;
  sopConfig: SopConfigStore;
  canManage?: boolean;
  canApprove?: boolean;
};

export type SopListRailProps = {
  sops: MinistrySop[];
  selectedId: string | null;
  onSelect: (sopId: string) => void;
};

export type SopDocumentProps = {
  sop: MinistrySop;
  sopConfig: SopConfigStore;
  requiresSafety: boolean;
  canManage: boolean;
  canApprove: boolean;
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetStatus: (status: MinistrySopStatus) => void;
};
