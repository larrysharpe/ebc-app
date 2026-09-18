import { prisma } from '@/lib/db';

import type { MinistryFileLibrary, MinistryMediaAsset } from '../types';
import { normalizeFolderPath } from '../utils/ministry-media.utils';

function mapAsset(row: {
  id: string;
  ministryId: string;
  fileName: string;
  displayName: string | null;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  storageProvider: string;
  kind: string;
  library: string;
  folderPath: string;
  notes: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}): MinistryMediaAsset {
  return {
    id: row.id,
    ministryId: row.ministryId,
    fileName: row.fileName,
    displayName: row.displayName ?? undefined,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    storageKey: row.storageKey,
    storageProvider: row.storageProvider === 's3' ? 's3' : 'local',
    kind: row.kind as MinistryMediaAsset['kind'],
    library: row.library === 'documents' ? 'documents' : 'media',
    folderPath: normalizeFolderPath(row.folderPath),
    notes: row.notes ?? undefined,
    uploadedBy: row.uploadedBy ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listMinistryMediaAssets(
  ministryId: string,
  library?: MinistryFileLibrary,
): Promise<MinistryMediaAsset[]> {
  const rows = await prisma.ministryMediaAsset.findMany({
    where: {
      ministryId,
      ...(library ? { library } : {}),
    },
    orderBy: [{ folderPath: 'asc' }, { createdAt: 'desc' }],
  });
  return rows.map(mapAsset);
}

export async function getMinistryMediaAssetById(
  id: string,
): Promise<MinistryMediaAsset | null> {
  const row = await prisma.ministryMediaAsset.findUnique({ where: { id } });
  return row ? mapAsset(row) : null;
}

export async function createMinistryMediaAsset(
  asset: Omit<MinistryMediaAsset, 'createdAt' | 'updatedAt'>,
): Promise<MinistryMediaAsset> {
  const row = await prisma.ministryMediaAsset.create({
    data: {
      id: asset.id,
      ministryId: asset.ministryId,
      fileName: asset.fileName,
      displayName: asset.displayName,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      storageKey: asset.storageKey,
      storageProvider: asset.storageProvider,
      kind: asset.kind,
      library: asset.library,
      folderPath: normalizeFolderPath(asset.folderPath),
      notes: asset.notes,
      uploadedBy: asset.uploadedBy,
    },
  });
  return mapAsset(row);
}

export async function updateMinistryMediaAssetMeta(
  id: string,
  input: { displayName?: string; notes?: string; folderPath?: string },
): Promise<MinistryMediaAsset | null> {
  try {
    const row = await prisma.ministryMediaAsset.update({
      where: { id },
      data: {
        displayName: input.displayName,
        notes: input.notes,
        ...(input.folderPath !== undefined
          ? { folderPath: normalizeFolderPath(input.folderPath) }
          : {}),
      },
    });
    return mapAsset(row);
  } catch {
    return null;
  }
}

export async function deleteMinistryMediaAsset(id: string): Promise<boolean> {
  try {
    await prisma.ministryMediaAsset.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
