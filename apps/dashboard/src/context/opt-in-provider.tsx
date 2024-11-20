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
  }, [status, redirectToLegacyDashboard, isLoaded]);

  return <>{children}</>;
};
