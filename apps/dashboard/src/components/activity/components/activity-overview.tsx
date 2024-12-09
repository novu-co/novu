import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/ui';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useEnvironment } from '@/context/environment/hooks';
import { TimeDisplayHoverCard } from '@/components/time-display-hover-card';
import { CopyableField } from './copyable-field';
import { IActivity } from '@novu/shared';

export interface ActivityOverviewProps {
  activity: IActivity;
}

export function ActivityOverview({ activity }: ActivityOverviewProps) {
  const { currentEnvironment } = useEnvironment();
  const status = activity.jobs[activity?.jobs?.length - 1]?.status;

  const workflowPath = buildRoute(ROUTES.EDIT_WORKFLOW, {
    environmentSlug: currentEnvironment?.slug ?? '',
    workflowSlug: activity?.template?._id ?? '',
  });

  return (
    <div className="px-3 py-2">
      <div className="mb-2 flex flex-col gap-[14px]">
        <div className="group flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">Workflow Identifier</span>
          <div className="group relative flex items-center gap-2">
            <Link
              to={activity.template?._id ? workflowPath : '#'}
              className={cn('text-foreground-600 cursor-pointer font-mono text-xs group-hover:underline', {
                'text-foreground-300 cursor-not-allowed': !activity.template?._id,
              })}
            >
              {activity.template?.name || 'Deleted workflow'}
            </Link>
          </div>
        </div>

        <CopyableField label="TransactionID" value={activity.transactionId} />
        <CopyableField label="SubscriberID" value={activity.subscriber?.subscriberId ?? ''} />

        <div className="group flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">Triggered at</span>
          <div className="relative flex items-center gap-2">
            <TimeDisplayHoverCard date={new Date(activity.createdAt)}>
              <span className="text-foreground-600 font-mono text-xs">
                {format(new Date(activity.createdAt), 'MMM d yyyy, HH:mm:ss')}
              </span>
            </TimeDisplayHoverCard>
          </div>
        </div>

        <div className="group flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">Status</span>
          <div className="relative flex items-center gap-2">
            <span
              className={cn('font-mono text-xs uppercase', {
                'text-success': status === 'completed' || status === 'merged',
                'text-destructive': status === 'failed',
                'text-neutral-300': ['pending', 'queued', 'delayed', 'canceled', 'skipped'].includes(status || ''),
              })}
            >
              {status || 'QUEUED'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
