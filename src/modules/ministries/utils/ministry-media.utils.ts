import type { MinistryMediaAsset, MinistryMediaKind } from '../types';

export function sanitizeMediaFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'upload';
}

export function detectMediaKind(mimeType: string, fileName: string): MinistryMediaKind {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType === 'application/pdf' ||
    mimeType.includes('document') ||
    mimeType.includes('sheet') ||
    mimeType.includes('presentation') ||
    mimeType.startsWith('text/') ||
    /\.(pdf|docx?|xlsx?|pptx?|txt|md|csv)$/i.test(fileName)
  ) {
    return 'document';
  }
  return 'other';
}

export function buildMinistryMediaStorageKey(input: {
  ministryId: string;
  assetId: string;
  fileName: string;
}): string {
  const safeName = sanitizeMediaFileName(input.fileName);
  return `ministries/${input.ministryId}/${input.assetId}/${safeName}`;
}

export function formatMediaBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mediaDownloadPath(assetId: string): string {
  return `/api/ministries/media/${assetId}`;
}

/** Normalize virtual folder paths: trim, collapse slashes, no leading/trailing `/`. */
export function normalizeFolderPath(path: string | null | undefined): string {
  if (!path) return '';
  return path
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/');
}

export function joinFolderPath(parent: string, child: string): string {
  const base = normalizeFolderPath(parent);
  const name = normalizeFolderPath(child).split('/')[0] ?? '';
  if (!name) return base;
  return base ? `${base}/${name}` : name;
}

export function parentFolderPath(path: string): string {
  const normalized = normalizeFolderPath(path);
  if (!normalized.includes('/')) return '';
  return normalized.slice(0, normalized.lastIndexOf('/'));
}

export function folderBreadcrumbs(path: string): Array<{ label: string; path: string }> {
  const normalized = normalizeFolderPath(path);
  if (!normalized) return [];
  const parts = normalized.split('/');
  return parts.map((label, index) => ({
    label,
    path: parts.slice(0, index + 1).join('/'),
  }));
}

export type MediaFolderEntry = {
  name: string;
  path: string;
  fileCount: number;
};

/** Immediate child folders under `currentPath`, derived from asset folderPaths. */
export function listChildFolders(
  assets: MinistryMediaAsset[],
  currentPath = '',
): MediaFolderEntry[] {
  const current = normalizeFolderPath(currentPath);
  const prefix = current ? `${current}/` : '';
  const counts = new Map<string, number>();

  for (const asset of assets) {
    const folder = normalizeFolderPath(asset.folderPath);
    if (current) {
      if (folder !== current && !folder.startsWith(prefix)) continue;
      if (folder === current) continue;
    } else if (!folder) {
      continue;
    }

    const remainder = current ? folder.slice(prefix.length) : folder;
    const childName = remainder.split('/')[0];
    if (!childName) continue;
    const childPath = joinFolderPath(current, childName);
    counts.set(childPath, (counts.get(childPath) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([path, fileCount]) => ({
      name: path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path,
      path,
      fileCount,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function assetsInFolder(
  assets: MinistryMediaAsset[],
  currentPath = '',
): MinistryMediaAsset[] {
  const current = normalizeFolderPath(currentPath);
  return assets.filter((asset) => normalizeFolderPath(asset.folderPath) === current);
}
