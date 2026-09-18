'use server';

import { redirect } from 'next/navigation';

import { switchDevAccountSchema } from '@/modules/auth/schemas/dev-auth.schemas';
import { signInAsDevUser } from '@/modules/auth/services/dev-auth.service';
import { listDevAccountOptions } from '@/modules/auth/utils/dev-account-options.utils';
import { resolveWelcomeNextPath } from '@/modules/auth/utils/welcome-destination.utils';

export async function getDevAccountOptionsAction() {
  return listDevAccountOptions();
}

export async function switchDevAccountAction(
  input: { email: string; returnPath?: string; stayOnPage?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = switchDevAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Invalid account selection.' };
  }

  const result = await signInAsDevUser(parsed.data.email);
  if (!result.ok) {
    return result;
  }

  if (parsed.data.stayOnPage) {
    return { ok: true };
  }

  const next = resolveWelcomeNextPath(parsed.data.returnPath ?? '/');
  redirect(`/welcome?next=${encodeURIComponent(next)}`);
}
