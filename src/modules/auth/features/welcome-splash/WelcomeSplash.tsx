'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactElement } from 'react';

import { CHURCH } from '@/lib/church';

export type WelcomeSplashProps = {
  displayName: string;
  roleLabel: string;
  nextPath: string;
};

export function WelcomeSplash({
  displayName,
  roleLabel,
  nextPath,
}: WelcomeSplashProps): ReactElement {
  const router = useRouter();
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      const timer = window.setTimeout(() => {
        router.replace(nextPath);
      }, 400);
      return () => window.clearTimeout(timer);
    }

    const holdTimer = window.setTimeout(() => setPhase('hold'), 700);
    const exitTimer = window.setTimeout(() => setPhase('exit'), 2400);
    const navTimer = window.setTimeout(() => {
      router.replace(nextPath);
    }, 3000);

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(navTimer);
    };
  }, [nextPath, router]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-ebc-burgundy via-ebc-burgundy-dark to-[#4a0e12] px-6 transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Welcome"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(235,191,95,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08), transparent 40%)',
        }}
      />

      <div
        className={`relative max-w-lg text-center transition-all duration-700 ease-out ${
          phase === 'enter'
            ? 'translate-y-6 scale-95 opacity-0'
            : phase === 'exit'
              ? '-translate-y-4 scale-105 opacity-0'
              : 'translate-y-0 scale-100 opacity-100'
        }`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-ebc-gold/90">
          {CHURCH.name}
        </p>
        <p
          className={`mt-6 font-display text-4xl leading-tight text-ebc-gold sm:text-5xl ${
            phase === 'hold' ? 'welcome-zion-pulse' : ''
          }`}
        >
          {CHURCH.themeLine}
        </p>
        <p className="mt-4 text-lg font-medium text-white/90 sm:text-xl">
          {CHURCH.mission}
        </p>
        <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-ebc-gold to-transparent" />
        <p className="mt-8 text-base text-white/85">
          Welcome, <span className="font-semibold text-white">{displayName}</span>
        </p>
        <p className="mt-1 text-sm text-white/65">{roleLabel}</p>
        <p className="mt-8 text-sm font-medium tracking-wide text-ebc-gold/80">
          Taking you home…
        </p>
      </div>
    </div>
  );
}
