import { LEGAL_HUB_PATH } from '@/modules/legal/constants/legal-routes.constants';

export function isLegalPublicPath(pathname: string): boolean {
  return pathname === LEGAL_HUB_PATH || pathname.startsWith(`${LEGAL_HUB_PATH}/`);
}
