export type VisitorStatus = 'new' | 'contacted' | 'connected';

export type Visitor = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  visitDate: string;
  howHeard?: string;
  followUpNotes?: string;
  status: VisitorStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateVisitorInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  visitDate: string;
  howHeard?: string;
  followUpNotes?: string;
};

export const VISITOR_STATUS_LABELS: Record<VisitorStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  connected: 'Connected',
};
