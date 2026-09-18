'use client';

import { useActionState } from 'react';

import { signInAction, type SignInActionState } from '@/modules/auth/features/sign-in/sign-in.actions';

const initialState: SignInActionState = {};

export type SignInFormProps = {
  nextPath?: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
          Church email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-ebc-burgundy/30 focus:border-ebc-burgundy focus:ring-2"
          placeholder="you@ebenezerbc.org"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none ring-ebc-burgundy/30 focus:border-ebc-burgundy focus:ring-2"
        />
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-ebc-burgundy px-4 py-3 text-sm font-semibold text-white transition hover:bg-ebc-burgundy-dark disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
