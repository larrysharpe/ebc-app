import { getObjectStorage } from '@/lib/storage';

import {
  MINISTRY_MEDIA_MAX_BYTES,
  MINISTRY_MEDIA_MAX_FILES,
} from '../constants/ministry-media.constants';
import type { MinistryFileLibrary, MinistryMediaAsset } from '../types';
import {
  buildMinistryMediaStorageKey,
  detectMediaKind,
  normalizeFolderPath,
  sanitizeMediaFileName,
} from '../utils/ministry-media.utils';
import {
  createMinistryMediaAsset,
  deleteMinistryMediaAsset,
  getMinistryMediaAssetById,
  listMinistryMediaAssets,
  updateMinistryMediaAssetMeta,
} from '../repositories/ministry-media.repository';

function newAssetId(): string {
  return `media-${crypto.randomUUID().slice(0, 10)}`;
}

export async function listMediaForMinistry(
  ministryId: string,
  library?: MinistryFileLibrary,
): Promise<MinistryMediaAsset[]> {
  return listMinistryMediaAssets(ministryId, library);
}

export async function getMediaAsset(id: string): Promise<MinistryMediaAsset | null> {
  return getMinistryMediaAssetById(id);
}

export async function uploadMediaForMinistry(input: {
  ministryId: string;
  files: File[];
  folderPath?: string;
  library?: MinistryFileLibrary;
  uploadedBy?: string;
}): Promise<{ ok: true; assets: MinistryMediaAsset[] } | { ok: false; error: string }> {
  if (input.files.length === 0) {
    return { ok: false, error: 'Choose at least one file.' };
  }
  if (input.files.length > MINISTRY_MEDIA_MAX_FILES) {
    return {
      ok: false,
      error: `Upload at most ${MINISTRY_MEDIA_MAX_FILES} files at a time.`,
    };
  }

  const storage = getObjectStorage();
  const assets: MinistryMediaAsset[] = [];
  const folderPath = normalizeFolderPath(input.folderPath);
  const library = input.library === 'documents' ? 'documents' : 'media';

  for (const file of input.files) {
    if (file.size <= 0) continue;
    if (file.size > MINISTRY_MEDIA_MAX_BYTES) {
      return {
        ok: false,
        error: `${file.name} is too large (max ${Math.round(MINISTRY_MEDIA_MAX_BYTES / (1024 * 1024))}MB).`,
      };
    }

    const assetId = newAssetId();
    const fileName = sanitizeMediaFileName(file.name);
    const mimeType = file.type || 'application/octet-stream';
    const storageKey = buildMinistryMediaStorageKey({
      ministryId: input.ministryId,
      assetId,
      fileName,
    });
    const body = Buffer.from(await file.arrayBuffer());

    const stored = await storage.putObject({
      storageKey,
      body,
      contentType: mimeType,
    });

    const asset = await createMinistryMediaAsset({
      id: assetId,
      ministryId: input.ministryId,
      fileName,
      displayName: file.name,
      mimeType,
      sizeBytes: stored.sizeBytes,
      storageKey: stored.storageKey,
      storageProvider: stored.provider,
      kind: detectMediaKind(mimeType, file.name),
      library,
      folderPath,
      uploadedBy: input.uploadedBy,
    });
    assets.push(asset);
  }

  if (assets.length === 0) {
    return { ok: false, error: 'No valid files to upload.' };
  }

  return { ok: true, assets };
}

export async function updateMediaMeta(
  assetId: string,
  input: { displayName?: string; notes?: string; folderPath?: string },
): Promise<MinistryMediaAsset | null> {
  return updateMinistryMediaAssetMeta(assetId, input);
}

export async function removeMediaAsset(
  assetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const asset = await getMinistryMediaAssetById(assetId);
  if (!asset) {
    return { ok: false, error: 'Media not found.' };
  }

  const storage = getObjectStorage();
  await storage.deleteObject(asset.storageKey);
  await deleteMinistryMediaAsset(assetId);
  return { ok: true };
}

export async function readMediaBytes(
  assetId: string,
): Promise<{ asset: MinistryMediaAsset; body: Buffer } | null> {
  const asset = await getMinistryMediaAssetById(assetId);
  if (!asset) return null;

  const storage = getObjectStorage();
  const object = await storage.getObject(asset.storageKey);
  if (!object) return null;

  return { asset, body: object.body };
}
