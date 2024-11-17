import { useNewDashboardOptIn } from '@/hooks/use-new-dashboard-opt-in';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { PropsWithChildren, useEffect } from 'react';

export const OptInProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { status, isLoaded, redirectToLegacyDashboard } = useNewDashboardOptIn();

  useEffect(() => {
    if (isLoaded && status !== NewDashboardOptInStatusEnum.OPTED_IN) {
      redirectToLegacyDashboard();
    }
  }, [status, redirectToLegacyDashboard, isLoaded]);

  return <>{children}</>;
};
