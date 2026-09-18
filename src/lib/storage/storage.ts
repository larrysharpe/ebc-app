import { createLocalObjectStorage } from './local-storage.adapter';
import type { ObjectStorage, StorageProvider } from './storage.types';

/**
 * Returns the active object storage backend.
 * Local disk for now; swap to S3 when STORAGE_PROVIDER=s3 is configured.
 */
export function getObjectStorage(): ObjectStorage {
  const provider = (process.env.STORAGE_PROVIDER ?? 'local') as StorageProvider;
  if (provider === 's3') {
    throw new Error(
      'S3 storage is not configured yet. Set STORAGE_PROVIDER=local or implement the S3 adapter.',
    );
  }
  return createLocalObjectStorage();
}
