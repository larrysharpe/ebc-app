export type SongRequestStatus = 'pending' | 'approved' | 'declined';

export type SongRequest = {
  id: string;
  title: string;
  artist?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  defaultKey?: string;
  themes: string[];
  notes?: string;
  /** Why the requester wants this song in the repertoire. */
  reason?: string;
  status: SongRequestStatus;
  requestedById?: string;
  requestedByName?: string;
  songId?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export const SONG_REQUEST_STATUS_LABELS: Record<SongRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Added to catalog',
  declined: 'Declined',
};
