'use server';

import { revalidatePath } from 'next/cache';

import { getSession } from '@/modules/auth/services/auth.service';
import {
  canAccessMinistrySlug,
  canManageMinistry,
} from '@/modules/auth/utils/ministry-scope.utils';
import { getMinistryBySlug } from '../repositories/ministry.repository';
import type { MinistryFileLibrary, MinistryMediaAsset } from '../types';
import {
  mediaFolderPathSchema,
  ministryFileLibrarySchema,
  updateMinistryMediaMetaSchema,
} from '../schemas/ministry-media.schemas';
import {
  listMediaForMinistry,
  removeMediaAsset,
  updateMediaMeta,
  uploadMediaForMinistry,
} from '../services/ministry-media.service';

async function guardMediaRead(
  slug: string,
): Promise<
  | { ok: true; ministryId: string }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const ministry = await getMinistryBySlug(slug);
  if (!ministry) {
    return { ok: false, error: 'Ministry not found.' };
  }

  if (!canAccessMinistrySlug(session, slug)) {
    return { ok: false, error: 'You do not have permission to view this ministry.' };
  }

  return { ok: true, ministryId: ministry.id };
}

async function guardMediaManage(
  slug: string,
): Promise<
  | { ok: true; ministryId: string; actorLabel: string }
  | { ok: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in.' };
  }

  const ministry = await getMinistryBySlug(slug);
  if (!ministry) {
    return { ok: false, error: 'Ministry not found.' };
  }

  if (!canManageMinistry(session, ministry.id)) {
    return { ok: false, error: 'You do not have permission to edit this ministry.' };
  }

  return {
    ok: true,
    ministryId: ministry.id,
    actorLabel: session.name || session.email,
  };
}

export async function listMinistryMediaAction(
  slug: string,
  library: MinistryFileLibrary = 'media',
): Promise<{ ok: true; assets: MinistryMediaAsset[] } | { ok: false; error: string }> {
  const allowed = await guardMediaRead(slug);
  if (!allowed.ok) return allowed;

  const parsedLibrary = ministryFileLibrarySchema.safeParse(library);
  const assets = await listMediaForMinistry(
    allowed.ministryId,
    parsedLibrary.success ? parsedLibrary.data : 'media',
  );
  return { ok: true, assets };
}

export async function uploadMinistryMediaAction(
  slug: string,
  formData: FormData,
): Promise<{ ok: true; assets: MinistryMediaAsset[] } | { ok: false; error: string }> {
  const allowed = await guardMediaManage(slug);
  if (!allowed.ok) return allowed;

  const files = formData
    .getAll('files')
    .filter((value): value is File => value instanceof File && value.size > 0);

  const folderRaw = String(formData.get('folderPath') ?? '');
  const folderParsed = mediaFolderPathSchema.safeParse(folderRaw);
  if (!folderParsed.success) {
    return {
      ok: false,
      error: folderParsed.error.issues[0]?.message ?? 'Invalid folder path',
    };
  }

  const libraryParsed = ministryFileLibrarySchema.safeParse(
    String(formData.get('library') ?? 'media'),
  );
  const library = libraryParsed.success ? libraryParsed.data : 'media';

  const result = await uploadMediaForMinistry({
    ministryId: allowed.ministryId,
    files,
    folderPath: folderParsed.data,
    library,
    uploadedBy: allowed.actorLabel,
  });

  if (!result.ok) return result;

  revalidatePath(`/ministries/${slug}`);
  return result;
}

export async function updateMinistryMediaMetaAction(
  slug: string,
  assetId: string,
  input: unknown,
): Promise<{ ok: true; asset: MinistryMediaAsset } | { ok: false; error: string }> {
  const allowed = await guardMediaManage(slug);
  if (!allowed.ok) return allowed;

  const parsed = updateMinistryMediaMetaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid media details',
    };
  }

  const existing = await listMediaForMinistry(allowed.ministryId);
  if (!existing.some((asset) => asset.id === assetId)) {
    return { ok: false, error: 'Media not found in this ministry.' };
  }

  const asset = await updateMediaMeta(assetId, parsed.data);
  if (!asset) {
    return { ok: false, error: 'Could not update media.' };
  }

  revalidatePath(`/ministries/${slug}`);
  return { ok: true, asset };
}

export async function deleteMinistryMediaAction(
  slug: string,
  assetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const allowed = await guardMediaManage(slug);
  if (!allowed.ok) return allowed;

  const existing = await listMediaForMinistry(allowed.ministryId);
  if (!existing.some((asset) => asset.id === assetId)) {
    return { ok: false, error: 'Media not found in this ministry.' };
  }

  const result = await removeMediaAsset(assetId);
  if (!result.ok) return result;

  revalidatePath(`/ministries/${slug}`);
  return { ok: true };
}

export async function moveMinistryMediaAction(
  slug: string,
  assetId: string,
  folderPath: unknown,
): Promise<{ ok: true; asset: MinistryMediaAsset } | { ok: false; error: string }> {
  return updateMinistryMediaMetaAction(slug, assetId, { folderPath });
}
