export type MinistryMediaKind = 'image' | 'video' | 'document' | 'audio' | 'other';

export type MinistryFileLibrary = 'media' | 'documents';

export type MinistryMediaAsset = {
  id: string;
  ministryId: string;
  fileName: string;
  displayName?: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  storageProvider: 'local' | 's3';
  kind: MinistryMediaKind;
  library: MinistryFileLibrary;
  /** Virtual path like `2026/CLC Retreat`. Empty string = library root. */
  folderPath: string;
  notes?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
};
