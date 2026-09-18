/** Safe post-login destination (never login/welcome loops). */
export function resolveWelcomeNextPath(next: unknown): string {
  if (
    typeof next === 'string' &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.startsWith('/login') &&
    !next.startsWith('/welcome')
  ) {
    return next;
  }
  return '/';
}
