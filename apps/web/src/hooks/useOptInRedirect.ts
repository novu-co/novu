import { useCallback, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FeatureFlagsKeysEnum, NewDashboardOptInStatusEnum } from '@novu/shared';

import { useNewDashboardOptIn } from './useNewDashboardOptIn';
import { ROUTES } from '../constants/routes';
import { useFeatureFlag } from './useFeatureFlag';
import { IS_EE_AUTH_ENABLED } from '../config';

const ROUTES_THAT_REDIRECT_TO_DASHBOARD = [ROUTES.WORKFLOWS];

export const useOptInRedirect = () => {
  const { pathname } = useLocation();
  const { status, isLoaded, redirectToNewDashboard } = useNewDashboardOptIn();

  const checkAndRedirect = useCallback(() => {
    if (!IS_EE_AUTH_ENABLED) return false;
    if (!isLoaded || !status || status !== NewDashboardOptInStatusEnum.OPTED_IN) return false;

    const currentRoute = pathname.replace('/legacy', '');
    const isRedirectableRoute = ROUTES_THAT_REDIRECT_TO_DASHBOARD.some((route) => currentRoute.includes(route));

    if (!isRedirectableRoute) return false;

    redirectToNewDashboard();

    return true;
  }, [isLoaded, status, pathname, redirectToNewDashboard]);

  // handling of updates to deps
  useLayoutEffect(() => {
    checkAndRedirect();
  }, [checkAndRedirect]);

  // immediate redirect check for initial render
  return checkAndRedirect();
};
