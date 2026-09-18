/** Church-wide resources every signed-in user can reach (member + staff). */
export const GLOBAL_CHURCH_ROUTE_PREFIX = '/church' as const;

export function isGlobalChurchRoute(pathname: string): boolean {
  return (
    pathname === GLOBAL_CHURCH_ROUTE_PREFIX ||
    pathname.startsWith(`${GLOBAL_CHURCH_ROUTE_PREFIX}/`)
  );
}
