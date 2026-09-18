import type { RepertoireSnapshot } from '../../utils/repertoire.utils';

export type RepertoireCoachProps = {
  snapshot: RepertoireSnapshot;
  canRefresh: boolean;
};

export type RepertoireCoachResult =
  | { ok: true; guidance: string; generatedAt: string }
  | { ok: false; error: string };
