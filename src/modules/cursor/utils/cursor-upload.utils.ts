import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { CursorFileAttachment, CursorImageAttachment } from '../types/cursor.types';

const UPLOAD_ROOT = path.join(process.cwd(), '.data', 'cursor-uploads');
const MAX_FILES = 5;

/** Default / docs / misc attachments. */
const MAX_BYTES_DEFAULT = 25 * 1024 * 1024;
/** Images sent inline to the model as base64. */
const MAX_BYTES_IMAGE = 10 * 1024 * 1024;
/** Videos saved to disk and referenced by path for the agent. */
const MAX_BYTES_VIDEO = 200 * 1024 * 1024;

const IMAGE_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

const VIDEO_MIME = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
]);

export type ParsedCursorUploads = {
  images: CursorImageAttachment[];
  files: CursorFileAttachment[];
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'upload';
}

function isVideoFile(mimeType: string, fileName: string): boolean {
  if (VIDEO_MIME.has(mimeType) || mimeType.startsWith('video/')) return true;
  return /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(fileName);
}

function maxBytesForFile(mimeType: string, fileName: string): number {
  if (IMAGE_MIME.has(mimeType)) return MAX_BYTES_IMAGE;
  if (isVideoFile(mimeType, fileName)) return MAX_BYTES_VIDEO;
  return MAX_BYTES_DEFAULT;
}

function formatMb(bytes: number): string {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}

export async function parseCursorUploadFiles(
  formFiles: File[],
): Promise<{ ok: true; uploads: ParsedCursorUploads } | { ok: false; error: string }> {
  if (formFiles.length > MAX_FILES) {
    return { ok: false, error: `Attach at most ${MAX_FILES} files.` };
  }

  const images: CursorImageAttachment[] = [];
  const files: CursorFileAttachment[] = [];

  await mkdir(UPLOAD_ROOT, { recursive: true });

  for (const file of formFiles) {
    if (file.size <= 0) continue;

    const mimeType = file.type || 'application/octet-stream';
    const fileName = sanitizeFileName(file.name);
    const maxBytes = maxBytesForFile(mimeType, file.name);

    if (file.size > maxBytes) {
      return {
        ok: false,
        error: `${file.name} is too large (max ${formatMb(maxBytes)} for this file type).`,
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (IMAGE_MIME.has(mimeType)) {
      images.push({
        data: buffer.toString('base64'),
        mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType,
        fileName,
      });
      continue;
    }

    const storedName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${fileName}`;
    const absolutePath = path.join(UPLOAD_ROOT, storedName);
    await writeFile(absolutePath, buffer);
    files.push({
      absolutePath,
      fileName,
      mimeType,
      sizeBytes: file.size,
    });
  }

  return { ok: true, uploads: { images, files } };
}
