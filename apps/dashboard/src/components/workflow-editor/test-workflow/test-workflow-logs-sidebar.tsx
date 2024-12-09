import { RiSendPlaneFill } from 'react-icons/ri';
import { ActivityPanel } from '@/components/activity/activity-panel';
import { useActivities } from '@/hooks/use-activities';
import { useEffect, useState } from 'react';
import { JobStatusEnum } from '@novu/shared';
import { Loader2 } from 'lucide-react';

interface TestWorkflowLogsSidebarProps {
  transactionId?: string;
}

export const TestWorkflowLogsSidebar = ({ transactionId }: TestWorkflowLogsSidebarProps) => {
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const { activities } = useActivities(
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
    const isPending = activity.jobs?.some((job) => job.status === JobStatusEnum.PENDING);

    // Only stop refetching if we have an activity and it's not pending
    setShouldRefetch(!activity || isPending);
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
        <ActivityPanel activityId={activityId} onActivitySelect={() => {}} headerClassName="h-[49px]" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
          <div className="rounded-full bg-neutral-100 p-4">
            <RiSendPlaneFill className="size-8 text-neutral-500" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-foreground-400 max-w-[30ch] text-sm">
              Fill in the form and click "Test workflow" to see the execution logs here.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
