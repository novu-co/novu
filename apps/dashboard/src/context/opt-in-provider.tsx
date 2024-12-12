import { PropsWithChildren, useLayoutEffect } from 'react';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { useNewDashboardOptIn } from '@/hooks/use-new-dashboard-opt-in';
import { useSearchParams } from 'react-router-dom';

export const OptInProvider = (props: PropsWithChildren) => {
  const { children } = props;
  const { status, isLoaded, redirectToLegacyDashboard, optIn } = useNewDashboardOptIn();
  const [searchParams] = useSearchParams();
  const hasV2OptIn = searchParams.has('v2_opt_in');

  useLayoutEffect(() => {
    if (isLoaded && status !== NewDashboardOptInStatusEnum.OPTED_IN) {
      if (hasV2OptIn) {
        (async () => {
          await optIn();
        })();
      } else {
        redirectToLegacyDashboard();
      }
    }

    // set light theme on the new domain for both legacy and new dashboard
    localStorage.setItem('mantine-theme', 'light');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, redirectToLegacyDashboard, isLoaded, hasV2OptIn]);

  return <>{children}</>;
};
