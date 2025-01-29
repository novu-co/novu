import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ActivityPanel } from '@/components/activity/activity-panel';
import { WorkflowResponseDto } from '@novu/shared';
import { useFormContext, useWatch } from 'react-hook-form';
import { RiCheckboxCircleFill, RiCheckboxCircleLine } from 'react-icons/ri';
import { useFetchActivities } from '../../../hooks/use-fetch-activities';
import { WorkflowTriggerInboxIllustration } from '../../icons/workflow-trigger-inbox';
import { Button } from '../../primitives/button';
import { TestWorkflowFormType } from '../schema';
import { TestWorkflowInstructions } from './test-workflow-instructions';

type TestWorkflowLogsSidebarProps = {
  transactionId?: string;
  workflow?: WorkflowResponseDto;
};

export const TestWorkflowLogsSidebar = ({ transactionId, workflow }: TestWorkflowLogsSidebarProps) => {
  const { control } = useFormContext<TestWorkflowFormType>();
  const [parentActivityId, setParentActivityId] = useState<string | undefined>(undefined);
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const to = useWatch({ name: 'to', control });
  const payload = useWatch({ name: 'payload', control });
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
    <aside className="flex h-full max-h-full flex-1 flex-col overflow-auto">
      {transactionId && !activityId ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-neutral-500" />
            <div className="text-foreground-600 text-sm">Waiting for activity...</div>
          </div>
        </div>
      ) : activityId ? (
        <>
          <ActivityPanel
            activityId={activityId}
            onActivitySelect={setParentActivityId}
            headerClassName="h-[49px]"
            overviewHeaderClassName="border-t-0"
          />
          {!workflow?.lastTriggeredAt && (
            <div className="p-3">
              <div className="border-stroke-soft bg-bg-weak rounded-8 flex items-center justify-between gap-3 border p-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="bg-success-100 flex size-6 items-center justify-center rounded-full">
                    <RiCheckboxCircleFill className="text-success size-5" />
                  </div>
                  <div>
                    <div className="text-success text-label-xs">You have triggered the workflow!</div>
                    <div className="text-text-sub text-label-xs">Now integrate the workflow in your application.</div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  mode="outline"
                  size="2xs"
                  className="whitespace-nowrap"
                  onClick={() => setShowInstructions(true)}
                >
                  Integrate workflow
                </Button>
              </div>
            </div>
          )}
        </>
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

      <TestWorkflowInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        workflow={workflow}
        to={to}
        payload={payload}
      />
    </aside>
  );
};
