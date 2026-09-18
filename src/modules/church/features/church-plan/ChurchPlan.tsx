import { getCursorConfig } from '@/lib/cursor';
import { GLOBAL_MINISTRY_ACCESS_ROLES } from '@/modules/auth/constants/ministry-scope.constants';
import { getSession } from '@/modules/auth/services/auth.service';
import { hasAnyRole } from '@/modules/auth/utils/roles.utils';

import { getChurchPlanViewModel } from '../../services/church-plan.service';
import { ChurchPlanPanel } from './ChurchPlanPanel';

export async function ChurchPlan(): Promise<React.ReactElement> {
  const session = await getSession();
  const view = await getChurchPlanViewModel();
  const canRefresh = session
    ? hasAnyRole(session.roles, [...GLOBAL_MINISTRY_ACCESS_ROLES])
    : false;
  const { enabled: cursorConfigured } = getCursorConfig();

  return (
    <ChurchPlanPanel
      view={view}
      canRefresh={canRefresh}
      cursorConfigured={cursorConfigured}
    />
  );
}
