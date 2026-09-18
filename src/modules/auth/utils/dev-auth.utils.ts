/** Dev-only impersonation — never enable outside local development. */
export function isDevAuthEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}
