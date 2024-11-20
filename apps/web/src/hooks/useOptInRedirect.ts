import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FeatureFlagsKeysEnum, NewDashboardOptInStatusEnum } from '@novu/shared';

import { useNewDashboardOptIn } from './useNewDashboardOptIn';
import { ROUTES } from '../constants/routes';
import { useFeatureFlag } from './useFeatureFlag';
import { IS_EE_AUTH_ENABLED } from '../config';

const ROUTES_THAT_REDIRECT_TO_DASHBOARD = [ROUTES.WORKFLOWS];

export const useOptInRedirect = () => {
  const { pathname } = useLocation();
  const isNewDashboardEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_NEW_DASHBOARD_ENABLED);
  const { status, isLoaded, redirectToNewDashboard } = useNewDashboardOptIn();
  const isUserOptedIn = isLoaded && status && status === NewDashboardOptInStatusEnum.OPTED_IN;
  const dashboardV2HostName = window.location.hostname.includes('dashboard-v2');

  const shouldHandleOptInRedirect = IS_EE_AUTH_ENABLED && isNewDashboardEnabled && isUserOptedIn && dashboardV2HostName;

  useLayoutEffect(() => {
    if (shouldHandleOptInRedirect) {
      const currentRoute = pathname.replace('/legacy', '');

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
  }, [shouldHandleOptInRedirect, pathname, redirectToNewDashboard]);
};
