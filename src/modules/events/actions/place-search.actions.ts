'use server';

import { z } from 'zod';

import {
  getSession,
  PermissionDeniedError,
} from '@/modules/auth/services/auth.service';
import { searchPlaces } from '@/modules/events/services/place-search.service';
import type { PlaceSearchResult } from '@/modules/events/types/place-search.types';

const searchSchema = z.object({
  query: z.string().trim().min(2).max(120),
});

export async function searchPlacesAction(
  raw: unknown,
): Promise<
  | { ok: true; results: PlaceSearchResult[] }
  | { ok: false; error: string }
> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, error: 'You must be signed in.' };
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      return { ok: false, error: 'You do not have permission for this action.' };
    }
    return { ok: false, error: 'You must be signed in.' };
  }

  const parsed = searchSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: true, results: [] };
  }

  try {
    const results = await searchPlaces(parsed.data.query);
    return { ok: true, results };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Place search is temporarily unavailable.',
    };
  }
}
