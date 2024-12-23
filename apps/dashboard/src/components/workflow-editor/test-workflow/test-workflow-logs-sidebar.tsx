import { ActivityPanel } from '@/components/activity/activity-panel';
import { useEffect, useState } from 'react';
import { JobStatusEnum } from '@novu/shared';
import { Loader2 } from 'lucide-react';
import { WorkflowTriggerInboxIllustration } from '../../icons/workflow-trigger-inbox';
import { useFetchActivities } from '../../../hooks/use-fetch-activities';
import { QueryKeys } from '../../../utils/query-keys';
import { useEnvironment } from '../../../context/environment/hooks';
import { useQueryClient } from '@tanstack/react-query';

type TestWorkflowLogsSidebarProps = {
  transactionId?: string;
};

export const TestWorkflowLogsSidebar = ({ transactionId }: TestWorkflowLogsSidebarProps) => {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const { activities } = useFetchActivities(
    {
      filters: transactionId ? { transactionId } : undefined,
    },
    {
      enabled: transactionId !== undefined,
      refetchInterval: shouldRefetch ? 1000 : false,
    }
  );

  useEffect(() => {
    if (!activities?.length) return;

    const activity = activities[0];
    const isPending = activity.jobs?.some(
      (job) =>
        job.status === JobStatusEnum.PENDING ||
        job.status === JobStatusEnum.QUEUED ||
        job.status === JobStatusEnum.RUNNING ||
        job.status === JobStatusEnum.DELAYED
    );

    // Only stop refetching if we have an activity and it's not pending
    setShouldRefetch(isPending || !activity?.jobs?.length);

    queryClient.invalidateQueries({
      queryKey: [QueryKeys.fetchActivity, currentEnvironment?._id, activity._id],
    });
  }, [activities]);

  // Reset refetch when transaction ID changes
  useEffect(() => {
    setShouldRefetch(true);
  }, [transactionId]);

  const activityId = activities?.[0]?._id;

  return (
    <aside className="flex h-full w-[500px] flex-col border-l">
      {transactionId && !activityId ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-neutral-500" />
            <div className="text-foreground-600 text-sm">Waiting for activity...</div>
          </div>
        </div>
      ) : activityId ? (
        <ActivityPanel
          activityId={activityId}
          onActivitySelect={() => {}}
          headerClassName="h-[49px]"
          overviewHeaderClassName="border-t-0"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
          <div>
            <WorkflowTriggerInboxIllustration />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-foreground-400 max-w-[30ch] text-sm">
              No logs to show, trigger test run to see event logs appear here
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
