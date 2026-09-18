import { prisma } from '@/lib/db';

import type {
  SongRequest,
  SongRequestStatus,
} from '../types/song-request.types';

function mapRow(row: {
  id: string;
  title: string;
  artist: string | null;
  youtubeUrl: string | null;
  audioUrl: string | null;
  defaultKey: string | null;
  themes: string[];
  notes: string | null;
  reason: string | null;
  status: string;
  requestedById: string | null;
  requestedByName: string | null;
  songId: string | null;
  reviewNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SongRequest {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist ?? undefined,
    youtubeUrl: row.youtubeUrl ?? undefined,
    audioUrl: row.audioUrl ?? undefined,
    defaultKey: row.defaultKey ?? undefined,
    themes: row.themes,
    notes: row.notes ?? undefined,
    reason: row.reason ?? undefined,
    status: row.status as SongRequestStatus,
    requestedById: row.requestedById ?? undefined,
    requestedByName: row.requestedByName ?? undefined,
    songId: row.songId ?? undefined,
    reviewNotes: row.reviewNotes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listSongRequests(options?: {
  status?: SongRequestStatus;
}): Promise<SongRequest[]> {
  const rows = await prisma.songRequest.findMany({
    where: options?.status ? { status: options.status } : undefined,
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
  return rows.map(mapRow);
}

export async function getSongRequestById(
  id: string,
): Promise<SongRequest | undefined> {
  const row = await prisma.songRequest.findUnique({ where: { id } });
  return row ? mapRow(row) : undefined;
}

export async function createSongRequest(
  request: Omit<SongRequest, 'createdAt' | 'updatedAt'>,
): Promise<SongRequest> {
  const row = await prisma.songRequest.create({
    data: {
      id: request.id,
      title: request.title,
      artist: request.artist ?? null,
      youtubeUrl: request.youtubeUrl ?? null,
      audioUrl: request.audioUrl ?? null,
      defaultKey: request.defaultKey ?? null,
      themes: request.themes,
      notes: request.notes ?? null,
      reason: request.reason ?? null,
      status: request.status,
      requestedById: request.requestedById ?? null,
      requestedByName: request.requestedByName ?? null,
      songId: request.songId ?? null,
      reviewNotes: request.reviewNotes ?? null,
    },
  });
  return mapRow(row);
}

export async function updateSongRequest(
  request: SongRequest,
): Promise<SongRequest | null> {
  try {
    const row = await prisma.songRequest.update({
      where: { id: request.id },
      data: {
        title: request.title,
        artist: request.artist ?? null,
        youtubeUrl: request.youtubeUrl ?? null,
        audioUrl: request.audioUrl ?? null,
        defaultKey: request.defaultKey ?? null,
        themes: request.themes,
        notes: request.notes ?? null,
        reason: request.reason ?? null,
        status: request.status,
        requestedById: request.requestedById ?? null,
        requestedByName: request.requestedByName ?? null,
        songId: request.songId ?? null,
        reviewNotes: request.reviewNotes ?? null,
      },
    });
    return mapRow(row);
  } catch {
    return null;
  }
}

export async function deleteSongRequest(id: string): Promise<boolean> {
  try {
    await prisma.songRequest.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function countPendingSongRequests(): Promise<number> {
  return prisma.songRequest.count({ where: { status: 'pending' } });
}
