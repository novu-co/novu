import { PageMeta } from '@/components/page-meta';
import { useEffect } from 'react';
import { CreateEnvironmentButton } from '../components/create-environment-button';
import { DashboardLayout } from '../components/dashboard-layout';
import { EnvironmentsList } from '../components/environments-list';
import { useTelemetry } from '../hooks/use-telemetry';
import { TelemetryEvent } from '../utils/telemetry';

export function EnvironmentsPage() {
  const track = useTelemetry();

  useEffect(() => {
    track(TelemetryEvent.ENVIRONMENTS_PAGE_VIEWED);
  }, [track]);

  return (
    <>
      <PageMeta title={`Environments`} />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950">Environments</h1>}>
        <div className="flex flex-col justify-between gap-2 px-2.5 py-2.5">
          <div className="flex justify-end">
            <CreateEnvironmentButton />
          </div>
          <EnvironmentsList />
        </div>
      </DashboardLayout>
    </>
  );
}
