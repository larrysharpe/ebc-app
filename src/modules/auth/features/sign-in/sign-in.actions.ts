'use server';

import { redirect } from 'next/navigation';

import { signInSchema } from '@/modules/auth/schemas/auth.schemas';
import { signIn as signInService } from '@/modules/auth/services/auth.service';
import { resolveWelcomeNextPath } from '@/modules/auth/utils/welcome-destination.utils';

export type SignInActionState = {
  error?: string;
};

export async function signInAction(
  _prev: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const result = await signInService(parsed.data);
  if (!result.ok) {
    return { error: result.error };
  }

  const next = resolveWelcomeNextPath(formData.get('next'));
  redirect(`/welcome?next=${encodeURIComponent(next)}`);
}
