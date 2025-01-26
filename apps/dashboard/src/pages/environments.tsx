import { PageMeta } from '@/components/page-meta';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useEffect } from 'react';
import { CreateEnvironmentButton } from '../components/create-environment-button';
import { DashboardLayout } from '../components/dashboard-layout';
import { FreeTierState } from '../components/environments-free-state';
import { EnvironmentsList } from '../components/environments-list';
import { useAuth } from '../context/auth/hooks';
import { useFetchEnvironments } from '../context/environment/hooks';
import { useFetchSubscription } from '../hooks/use-fetch-subscription';
import { useTelemetry } from '../hooks/use-telemetry';
import { TelemetryEvent } from '../utils/telemetry';

export function EnvironmentsPageSkeleton() {
  return (
    <>
      <div className="flex flex-col justify-between gap-2 px-2.5 py-2.5">
        <div className="flex justify-end">
          <CreateEnvironmentButton />
        </div>
        <EnvironmentsList environments={[]} />
      </div>
      <FreeTierState />
    </>
  );
}

export function EnvironmentsPage() {
  const { currentOrganization } = useAuth();
  const { environments = [], areEnvironmentsInitialLoading } = useFetchEnvironments({
    organizationId: currentOrganization?._id,
  });
  const track = useTelemetry();
  const { subscription } = useFetchSubscription();
  const isPaidTier = subscription?.apiServiceLevel !== ApiServiceLevelEnum.FREE && subscription?.trial?.isActive;

  useEffect(() => {
    track(TelemetryEvent.ENVIRONMENTS_PAGE_VIEWED);
  }, [track]);

  return (
    <>
      <PageMeta title={`Environments`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Environments</h1>}>
        {areEnvironmentsInitialLoading ? (
          <EnvironmentsPageSkeleton />
        ) : isPaidTier ? (
          <div className="flex flex-col justify-between gap-2 px-2.5 py-2.5">
            <div className="flex justify-end">
              <CreateEnvironmentButton />
            </div>
            <EnvironmentsList environments={environments} />
          </div>
        ) : (
          <FreeTierState />
        )}
      </DashboardLayout>
    </>
  );
}
