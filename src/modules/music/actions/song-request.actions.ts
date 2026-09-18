'use server';

import { revalidatePath } from 'next/cache';

import {
  PermissionDeniedError,
  requirePermission,
  requireSession,
} from '@/modules/auth/services/auth.service';
import {
  reviewSongRequestSchema,
  songRequestIdSchema,
  songRequestInputSchema,
  type ReviewSongRequestInput,
} from '@/modules/music/schemas/song-request.schemas';
import { createSong } from '@/modules/music/repository/music.repository';
import {
  createSongRequest,
  deleteSongRequest,
  getSongRequestById,
  updateSongRequest,
} from '@/modules/music/repository/song-request.repository';
import type { SongRequest } from '@/modules/music/types/song-request.types';
import {
  normalizeSongThemes,
  songFromApprovedRequest,
} from '@/modules/music/utils/song-request.utils';

function revalidateSongRequestPaths(): void {
  revalidatePath('/music');
  revalidatePath('/music/songs');
  revalidatePath('/music/song-requests');
}

async function guardRequestSongs(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await requirePermission('music.songs.request');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return {
        ok: false,
        error: 'You do not have permission to request songs.',
      };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

async function guardManageSongs(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    await requirePermission('music.songs.manage');
    return { ok: true };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return {
        ok: false,
        error: 'You do not have permission to manage song requests.',
      };
    }
    return { ok: false, error: 'You must be signed in.' };
  }
}

export async function submitSongRequestAction(
  input: unknown,
): Promise<{ ok: true; request: SongRequest } | { ok: false; error: string }> {
  const allowed = await guardRequestSongs();
  if (!allowed.ok) return allowed;

  const parsed = songRequestInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid song request.',
    };
  }

  const session = await requireSession();
  const data = parsed.data;
  const request = await createSongRequest({
    id: `song-req-${Date.now()}`,
    title: data.title,
    artist: data.artist,
    youtubeUrl: data.youtubeUrl,
    audioUrl: data.audioUrl,
    defaultKey: data.defaultKey,
    themes: normalizeSongThemes(data.themes),
    notes: data.notes,
    reason: data.reason,
    status: 'pending',
    requestedById: session.id,
    requestedByName: session.name,
  });

  revalidateSongRequestPaths();
  return { ok: true, request };
}

export async function approveSongRequestAction(
  input: ReviewSongRequestInput,
): Promise<{ ok: true; request: SongRequest } | { ok: false; error: string }> {
  const allowed = await guardManageSongs();
  if (!allowed.ok) return allowed;

  const parsed = reviewSongRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid song request.' };
  }

  const existing = await getSongRequestById(parsed.data.id);
  if (!existing) {
    return { ok: false, error: 'Song request not found.' };
  }
  if (existing.status === 'approved' && existing.songId) {
    return { ok: false, error: 'Already added to the catalog.' };
  }
  if (existing.status === 'declined') {
    return { ok: false, error: 'This request was declined.' };
  }

  const song = await createSong(songFromApprovedRequest(existing));
  const updated = await updateSongRequest({
    ...existing,
    status: 'approved',
    songId: song.id,
    reviewNotes: parsed.data.reviewNotes,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return {
      ok: false,
      error: 'Song created, but could not update the request status.',
    };
  }

  revalidateSongRequestPaths();
  return { ok: true, request: updated };
}

export async function declineSongRequestAction(
  input: ReviewSongRequestInput,
): Promise<{ ok: true; request: SongRequest } | { ok: false; error: string }> {
  const allowed = await guardManageSongs();
  if (!allowed.ok) return allowed;

  const parsed = reviewSongRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid song request.' };
  }

  const existing = await getSongRequestById(parsed.data.id);
  if (!existing) {
    return { ok: false, error: 'Song request not found.' };
  }
  if (existing.status !== 'pending') {
    return { ok: false, error: 'Only pending requests can be declined.' };
  }

  const updated = await updateSongRequest({
    ...existing,
    status: 'declined',
    reviewNotes: parsed.data.reviewNotes,
    updatedAt: new Date().toISOString(),
  });

  if (!updated) {
    return { ok: false, error: 'Could not update the request.' };
  }

  revalidateSongRequestPaths();
  return { ok: true, request: updated };
}

export async function deleteSongRequestAction(
  input: { id: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardManageSongs();
  if (!allowed.ok) return allowed;

  const parsed = songRequestIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid song request.' };
  }

  const existing = await getSongRequestById(parsed.data.id);
  if (!existing) {
    return { ok: false, error: 'Song request not found.' };
  }
  if (existing.status === 'approved') {
    return {
      ok: false,
      error: 'Approved requests stay linked to the catalog entry.',
    };
  }

  const deleted = await deleteSongRequest(parsed.data.id);
  if (!deleted) {
    return { ok: false, error: 'Could not delete the request.' };
  }

  revalidateSongRequestPaths();
  return { ok: true };
}
