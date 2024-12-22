import { useEffect } from 'react';

import { WorkflowList } from '@/components/workflow-list';
import { DashboardLayout } from '@/components/dashboard-layout';
import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { OptInModal } from '@/components/opt-in-modal';
import { PageMeta } from '@/components/page-meta';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { Badge } from '@/components/primitives/badge';
import { Button } from '../components/primitives/button';

export const WorkflowsPage = () => {
  const track = useTelemetry();

  useEffect(() => {
    track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
  }, [track]);

  return (
    <>
      <PageMeta title="Workflows" />
      <DashboardLayout
        headerStartItems={
          <h1 className="text-foreground-950 flex items-center gap-1">
            <span>Workflows</span>
            <Badge kind="pill" size="2xs">
              BETA
            </Badge>
          </h1>
        }
      >
        <OptInModal />
        <div className="flex justify-between px-2.5 py-2.5">
          <div className="invisible flex w-[20ch] items-center gap-2 rounded-lg bg-neutral-50 p-2"></div>

          <CreateWorkflowButton asChild>
            <Button variant="primary" size="xs">
              Create workflow
            </Button>
          </CreateWorkflowButton>
        </div>
        <WorkflowList />
      </DashboardLayout>
    </>
  );
};
