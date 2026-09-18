export type StorageProvider = 'local' | 's3';

export type StoredObject = {
  storageKey: string;
  provider: StorageProvider;
  sizeBytes: number;
};

export type ObjectStorage = {
  readonly provider: StorageProvider;
  putObject(input: {
    storageKey: string;
    body: Buffer;
    contentType: string;
  }): Promise<StoredObject>;
  getObject(storageKey: string): Promise<{ body: Buffer; contentType?: string } | null>;
  deleteObject(storageKey: string): Promise<void>;
};
