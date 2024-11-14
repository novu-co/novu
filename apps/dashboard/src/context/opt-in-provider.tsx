import { useNewDashboardOptIn } from '@/hooks/use-new-dashboard-opt-in';
import { NewDashboardOptInStatusEnum } from '@novu/shared';
import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const OptInProvider = (props: PropsWithChildren) => {
  const navigate = useNavigate();
  const { children } = props;
  const { status, isLoaded } = useNewDashboardOptIn();

  useEffect(() => {
    if (isLoaded && status !== NewDashboardOptInStatusEnum.OPTED_IN) {
      window.location.href = '/legacy/workflows';
    }
  }, [status, navigate, isLoaded]);

  return <>{children}</>;
};
