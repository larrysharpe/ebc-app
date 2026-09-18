import { describe, expect, it } from 'vitest';

import type { MinistryMediaAsset } from '../types';
import {
  assetsInFolder,
  buildMinistryMediaStorageKey,
  detectMediaKind,
  folderBreadcrumbs,
  formatMediaBytes,
  joinFolderPath,
  listChildFolders,
  normalizeFolderPath,
  sanitizeMediaFileName,
} from './ministry-media.utils';

function asset(folderPath: string): MinistryMediaAsset {
  return {
    id: '1',
    ministryId: 'min',
    fileName: 'a.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 10,
    storageKey: 'k',
    storageProvider: 'local',
    kind: 'image',
    library: 'media',
    folderPath,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('ministry media utils', () => {
  it('sanitizes file names', () => {
    expect(sanitizeMediaFileName('Sunday Bulletin (final).pdf')).toBe(
      'Sunday_Bulletin_final_.pdf',
    );
  });

  it('detects media kinds from mime and extension', () => {
    expect(detectMediaKind('image/png', 'a.png')).toBe('image');
    expect(detectMediaKind('video/mp4', 'a.mp4')).toBe('video');
    expect(detectMediaKind('application/pdf', 'a.pdf')).toBe('document');
    expect(detectMediaKind('application/octet-stream', 'notes.pdf')).toBe('document');
  });

  it('builds stable storage keys', () => {
    expect(
      buildMinistryMediaStorageKey({
        ministryId: 'min-media',
        assetId: 'asset-1',
        fileName: 'flyer.pdf',
      }),
    ).toBe('ministries/min-media/asset-1/flyer.pdf');
  });

  it('formats byte sizes', () => {
    expect(formatMediaBytes(500)).toBe('500 B');
    expect(formatMediaBytes(2048)).toBe('2.0 KB');
  });

  it('normalizes and joins folder paths', () => {
    expect(normalizeFolderPath('/2026//CLC Retreat/')).toBe('2026/CLC Retreat');
    expect(joinFolderPath('2026', 'CLC Retreat')).toBe('2026/CLC Retreat');
    expect(folderBreadcrumbs('2026/CLC Retreat')).toEqual([
      { label: '2026', path: '2026' },
      { label: 'CLC Retreat', path: '2026/CLC Retreat' },
    ]);
  });

  it('lists child folders and files in the current folder', () => {
    const assets = [
      asset('2026/CLC Retreat'),
      asset('2026/CLC Retreat'),
      asset('2026/VBS'),
      asset(''),
    ];

    expect(listChildFolders(assets, '')).toEqual([
      { name: '2026', path: '2026', fileCount: 3 },
    ]);
    expect(listChildFolders(assets, '2026').map((f) => f.name)).toEqual([
      'CLC Retreat',
      'VBS',
    ]);
    expect(assetsInFolder(assets, '').map((a) => a.folderPath)).toEqual(['']);
    expect(assetsInFolder(assets, '2026/CLC Retreat')).toHaveLength(2);
  });
});
