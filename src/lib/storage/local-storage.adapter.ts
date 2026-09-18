import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { ObjectStorage, StoredObject } from './storage.types';

const LOCAL_ROOT = path.join(process.cwd(), '.data', 'object-storage');

export function createLocalObjectStorage(rootDir = LOCAL_ROOT): ObjectStorage {
  return {
    provider: 'local',

    async putObject(input): Promise<StoredObject> {
      const absolute = path.join(rootDir, input.storageKey);
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, input.body);
      return {
        storageKey: input.storageKey,
        provider: 'local',
        sizeBytes: input.body.byteLength,
      };
    },

    async getObject(storageKey) {
      try {
        const absolute = path.join(rootDir, storageKey);
        const body = await readFile(absolute);
        return { body };
      } catch {
        return null;
      }
    },

    async deleteObject(storageKey) {
      try {
        await unlink(path.join(rootDir, storageKey));
      } catch {
        // Missing file is fine on delete.
      }
    },
  };
}
