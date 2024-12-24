import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { ActivityPanel } from '@/components/activity/activity-panel';
import { WorkflowTriggerInboxIllustration } from '../../icons/workflow-trigger-inbox';
import { useFetchActivities } from '../../../hooks/use-fetch-activities';

type TestWorkflowLogsSidebarProps = {
  transactionId?: string;
};

export const TestWorkflowLogsSidebar = ({ transactionId }: TestWorkflowLogsSidebarProps) => {
  const [parentActivityId, setParentActivityId] = useState<string | undefined>(undefined);
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const { activities } = useFetchActivities(
    {
      filters: transactionId ? { transactionId } : undefined,
    },
    {
      enabled: !!transactionId,
      refetchInterval: shouldRefetch ? 1000 : false,
    }
  );
  const activityId: string | undefined = parentActivityId ?? activities?.[0]?._id;

  useEffect(() => {
    if (activityId) {
      setShouldRefetch(false);
    }
  }, [activityId]);

  // Reset refetch when transaction ID changes
  useEffect(() => {
    if (!transactionId) {
      return;
    }

    setShouldRefetch(true);
    setParentActivityId(undefined);
  }, [transactionId]);

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
          onActivitySelect={setParentActivityId}
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
