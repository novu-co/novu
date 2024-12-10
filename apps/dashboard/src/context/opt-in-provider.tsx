import { PropsWithChildren, useLayoutEffect } from 'react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { useNewDashboardOptIn } from '@/hooks/use-new-dashboard-opt-in';

export const OptInProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { status, isLoaded, redirectToLegacyDashboard } = useNewDashboardOptIn();

  useLayoutEffect(() => {
    if (isLoaded && status !== NewDashboardOptInStatusEnum.OPTED_IN) {
      redirectToLegacyDashboard();
    }

    // set light theme on the new domain for both legacy and new dashboard
    localStorage.setItem('mantine-theme', 'light');
  }, [status, redirectToLegacyDashboard, isLoaded]);

  return <>{children}</>;
};
