import type { BandInstrument, BandPlayerType } from './music.types';

export type MusicianIntakeStatus = 'pending' | 'rostered' | 'declined';

export type MusicianIntake = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  instrument: BandInstrument;
  serviceDate: string;
  playerType: BandPlayerType;
  /** True when payment paperwork was completed — never store dollar amounts. */
  paymentPaperworkComplete: boolean;
  paymentNotes?: string;
  status: MusicianIntakeStatus;
  bandMusicianId?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
};

export const MUSICIAN_INTAKE_STATUS_LABELS: Record<MusicianIntakeStatus, string> = {
  pending: 'Pending',
  rostered: 'On roster',
  declined: 'Declined',
};
