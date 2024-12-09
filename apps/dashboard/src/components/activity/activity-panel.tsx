import { Route, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { RiPlayCircleLine } from 'react-icons/ri';
import { ActivityJobItem } from './activity-job-item';
import { InlineToast } from '../primitives/inline-toast';
import { useFetchActivity } from '@/hooks/use-fetch-activity';
import { Link } from 'react-router-dom';
import { buildRoute, ROUTES } from '../../utils/routes';
import { useEnvironment } from '../../context/environment/hooks';
import { CopyButton } from '../primitives/copy-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../primitives/tooltip';
import { cn } from '@/utils/ui';
import { TimeDisplayHoverCard } from '../time-display-hover-card';
import { IActivity, IActivityJob } from '@novu/shared';

function LogsSection({ jobs }: { jobs: IActivityJob[] }): JSX.Element {
  return (
    <div className="flex flex-col gap-6 bg-white p-3">
      {jobs.map((job, index) => (
        <ActivityJobItem key={job._id} job={job} isFirst={index === 0} isLast={index === jobs.length - 1} />
      ))}
    </div>
  );
}

function Overview({ activity }: { activity: IActivity }) {
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
            <CopyButton
              valueToCopy={activity.template?.name ?? ''}
              variant="ghost"
              size="icon"
              className="text-foreground-600 mr-0 size-3 gap-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
            </CopyButton>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={activity.template?._id ? workflowPath : '#'}
                  className={cn('text-foreground-600 cursor-pointer font-mono text-xs group-hover:underline', {
                    'text-foreground-300 cursor-not-allowed': !activity.template?._id,
                  })}
                >
                  {activity.template?.name || 'Deleted workflow'}
                </Link>
              </TooltipTrigger>
              <TooltipContent>Navigate to workflow page</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="group flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">TransactionID</span>
          <div className="relative flex items-center gap-2">
            <CopyButton
              valueToCopy={activity.transactionId}
              variant="ghost"
              size="icon"
              className="text-foreground-600 mr-0 size-3 gap-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
            </CopyButton>
            <span className="text-foreground-600 font-mono text-xs">{activity.transactionId}</span>
          </div>
        </div>
        <div className="group flex items-center justify-between">
          <span className="text-foreground-950 text-xs font-medium">SubscriberID</span>
          <div className="relative flex items-center gap-2">
            <CopyButton
              valueToCopy={activity.subscriber?.subscriberId ?? ''}
              variant="ghost"
              size="icon"
              className="text-foreground-600 mr-0 size-3 gap-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
            </CopyButton>
            <span className="text-foreground-600 font-mono text-xs">{activity.subscriber?.subscriberId}</span>
          </div>
        </div>
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

interface ActivityPanelProps {
  activityId: string;
  onActivitySelect: (activityId: string) => void;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-2 border-b border-t border-neutral-200 border-b-neutral-100 p-2">
        <div className="h-3 w-3 rounded-full bg-neutral-200" />
        <div className="h-[20px] w-32 rounded bg-neutral-200" />
      </div>

      <div className="px-3 py-2">
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-neutral-200" />
              <div className="h-3 w-32 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-t border-neutral-100 p-2">
        <div className="h-3 w-3 rounded-full bg-neutral-200" />
        <div className="h-4 w-16 rounded bg-neutral-200" />
      </div>

      <div className="flex flex-col gap-6 bg-white p-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 rounded bg-neutral-200" />
              <div className="h-4 w-24 rounded bg-neutral-200" />
            </div>
            <div className="h-16 w-full rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityPanel({ activityId, onActivitySelect }: ActivityPanelProps) {
  const { activity, isPending, error } = useFetchActivity({ activityId });

  if (isPending) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <LoadingSkeleton />
      </motion.div>
    );
  }

  if (error || !activity) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-foreground-600 text-sm">Failed to load activity details</div>
        </div>
      </motion.div>
    );
  }

  const isMerged = activity.jobs.some((job) => job.status === 'merged');

  return (
    <motion.div
      key={activityId}
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-full"
    >
      <div>
        <div className="flex items-center gap-2 border-b border-t border-neutral-200 border-b-neutral-100 p-2 px-3">
          <Route className="h-3 w-3" />
          <span className="text-foreground-950 text-sm font-medium">
            {activity.template?.name || 'Deleted workflow'}
          </span>
        </div>
        <Overview activity={activity} />

        <div className="flex items-center gap-2 border-b border-t border-neutral-100 p-2 px-3">
          <RiPlayCircleLine className="h-3 w-3" />
          <span className="text-foreground-950 text-sm font-medium">Logs</span>
        </div>

        {isMerged && (
          <div className="px-3 py-3">
            <InlineToast
              ctaClassName="text-foreground-950"
              variant={'tip'}
              ctaLabel="View Execution"
              onCtaClick={() => {
                if (activity._digestedNotificationId) {
                  onActivitySelect(activity._digestedNotificationId);
                }
              }}
              description="Remaining execution has been merged to an active Digest of an existing workflow execution."
            />
          </div>
        )}
        <LogsSection jobs={activity.jobs} />
      </div>
    </motion.div>
  );
}
