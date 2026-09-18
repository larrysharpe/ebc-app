'use server';

import { loginAsUserSchema } from '@/modules/auth/schemas/login-as.schemas';
import {
  loginAsUser,
  stopImpersonating,
} from '@/modules/auth/services/login-as.service';

export async function loginAsUserAction(
  input: { userId: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = loginAsUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid user.' };
  }

  const result = await loginAsUser(parsed.data.userId);
  if (!result.ok) return result;
  return { ok: true };
}

export async function stopImpersonatingAction(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const result = await stopImpersonating();
  if (!result.ok) return result;
  return { ok: true };
}
