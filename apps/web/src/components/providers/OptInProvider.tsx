import { FeatureFlagsKeysEnum, NewDashboardOptInStatusEnum } from '@novu/shared';
import { PropsWithChildren, useEffect } from 'react';
import { useNewDashboardOptIn } from '../../hooks/useNewDashboardOptIn';

import { ROUTES } from '../../constants/routes';
import { IS_EE_AUTH_ENABLED } from '../../config';
import { useFeatureFlag } from '../../hooks';

const ROUTES_THAT_REDIRECT_TO_DASHBOARD = [ROUTES.WORKFLOWS];

export const OptInProvider = ({ children }: { children: React.ReactNode }) => {
  const isNewDashboardEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_ENABLED);

  if (IS_EE_AUTH_ENABLED && isNewDashboardEnabled) {
    return <_OptInProvider>{children}</_OptInProvider>;
  }

  return <>{children}</>;
};

export const _OptInProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { status, isLoaded, redirectToNewDashboard } = useNewDashboardOptIn();

  useEffect(() => {
    if (isLoaded && status === NewDashboardOptInStatusEnum.OPTED_IN) {
      const currentRoute = window.location.pathname.replace('/legacy', '');

      /**
       * if equivalent of current route (incl. subroutes) exits in new dashboard, redirect to it
       * - /legacy/workflows -> /workflows
       * - /legacy/workflows/edit/123 -> /workflows
       */
      if (ROUTES_THAT_REDIRECT_TO_DASHBOARD.some((route) => currentRoute.includes(route))) {
        /**
         * TODO: in order to redirect to the same route, we need to translate the
         * "dev_env_<id>" or wf/step slugs to legacy environment id and vice-versa
         *
         * note: /legacy is part of public URL, so we can't navigate() outside of that
         */
        redirectToNewDashboard();
      }
    }
  }, [status, redirectToNewDashboard, isLoaded]);

  return <>{children}</>;
};
