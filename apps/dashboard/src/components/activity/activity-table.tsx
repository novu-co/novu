import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { Badge } from '@/components/primitives/badge';
import { format } from 'date-fns';
import { cn } from '@/utils/ui';
import { IActivityJob, IActivity, StepTypeEnum } from '@novu/shared';
import { CheckCircleIcon as CheckCircle, AlertCircleIcon as AlertCircle, ClockIcon as Clock } from 'lucide-react';
import { STEP_TYPE_TO_ICON } from '../icons/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '@/context/environment/hooks';
import { getNotification } from '@/api/activity';
import { TimeDisplayHoverCard } from '../time-display-hover-card';
import { createSearchParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/primitives/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useActivities } from '@/hooks/use-activities';

type ActivityStatus = 'SUCCESS' | 'ERROR' | 'QUEUED' | 'MERGED';

function getActivityStatus(jobs: IActivityJob[]): ActivityStatus {
  if (!jobs.length) return 'QUEUED';

  const lastJob = jobs[jobs.length - 1];

  switch (lastJob.status) {
    case 'completed':
      return 'SUCCESS';
    case 'failed':
      return 'ERROR';
    case 'merged':
      return 'MERGED';
    default:
      return 'QUEUED';
  }
}

function JobsList({ jobs }: { jobs: IActivityJob[] }) {
  const statusConfig = {
    completed: {
      color: 'text-success',
      label: 'Delivered',
    },
    merged: {
      color: 'text-info',
      label: 'Merged',
    },
    failed: {
      color: 'text-destructive',
      label: 'Failed',
    },
    pending: {
      color: 'text-warning',
      label: 'Pending',
    },
    delayed: {
      color: 'text-warning',
      label: 'Delayed',
    },
  };

  const typeLabels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    in_app: 'In-App',
    chat: 'Chat',
    push: 'Push',
    digest: 'Digest',
  };

  return (
    <div className="flex flex-col gap-0.5">
      {jobs.map((job, index) => {
        const lastExecutionDetail = job.executionDetails?.at(-1);
        const status = job.status as keyof typeof statusConfig;
        const { color, label } = statusConfig[status] || {
          color: 'text-muted-700 bg-muted-50 border border-muted-200',
          label: 'Unknown',
        };
        const isLastItem = index === jobs.length - 1;

        return (
          <div
            key={job._id}
            className={cn(
              'hover:bg-muted-50 flex items-center gap-1.5 rounded px-1 py-1',
              !isLastItem && 'border-border/40 border-b'
            )}
          >
            <div className={cn('flex h-5 w-5 items-center justify-center rounded-full')}>{getStepIcon(job.type)}</div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium">{typeLabels[job.type || ''] || job.type}</span>
                <span className={cn('rounded-full text-[10px] font-medium', color)}>{label}</span>
              </div>

              {lastExecutionDetail?.detail && (
                <div className="text-foreground-500 truncate text-[11px]">{lastExecutionDetail.detail}</div>
              )}
            </div>

            <div className="text-foreground-400 text-[10px] tabular-nums">
              {format(new Date(job.createdAt), 'HH:mm')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, jobs }: { status: ActivityStatus; jobs: IActivityJob[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const errorCount = jobs.filter((job) => job.status === 'failed').length;
  let hoverTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout);

    hoverTimeout = setTimeout(() => {
      setIsOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setIsOpen(false);
  };

  const config = {
    SUCCESS: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: 'SUCCESS',
    },
    ERROR: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      label: `${errorCount} ${errorCount === 1 ? 'ERROR' : 'ERRORS'}`,
    },
    MERGED: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: 'MERGED',
    },
    QUEUED: {
      variant: 'warning' as const,
      icon: Clock,
      label: 'QUEUED',
    },
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Popover open={isOpen}>
      <PopoverTrigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Badge variant={variant} className="cursor-pointer gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        align="start"
        sideOffset={5}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={handleMouseLeave}
      >
        <JobsList jobs={jobs} />
      </PopoverContent>
    </Popover>
  );
}

function getStepIcon(type?: StepTypeEnum) {
  const Icon = STEP_TYPE_TO_ICON[type as keyof typeof STEP_TYPE_TO_ICON];

  return <Icon className="h-4 w-4" />;
}

function StepIndicators({ jobs }: { jobs: IActivityJob[] }) {
  const statusStyles = {
    completed: 'border-[1px] border-[#b4e6c5] bg-[#e8f9ef] text-[#b4e6c5]',
    failed: 'border-[1px] border-[#fca5a5] bg-[#fde8e8] text-[#fca5a5]',
    delayed: 'border-[1px] border-[#f7d794] bg-[#fef9e7] text-[#f7d794]',
    default: 'border-[1px] border-[#e0e0e0] bg-[#f0f0f0] text-[#e0e0e0]',
  } as const;

  return (
    <div className="flex items-center">
      {jobs.map((job) => (
        <div
          key={job._id}
          className={cn(
            '-ml-2 flex h-7 w-7 items-center justify-center rounded-full first:ml-0',
            statusStyles[job.status as keyof typeof statusStyles] ?? statusStyles.default
          )}
        >
          {getStepIcon(job.type)}
        </div>
      ))}
    </div>
  );
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM d yyyy, HH:mm:ss');
}

interface ActivityTableProps {
  selectedActivityId: string | null;
  onActivitySelect: (activity: IActivity) => void;
}

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="h-5 w-36 rounded bg-neutral-200" />
          <div className="h-2.5 w-20 rounded bg-neutral-100" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex h-7 w-28 items-center justify-center gap-1.5 rounded-full bg-neutral-100">
          <div className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
          <div className="h-3.5 w-16 rounded bg-neutral-200" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 first:ml-0"
            >
              <div className="h-4 w-4 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="h-4 w-36 rounded bg-neutral-100 font-mono" />
      </TableCell>
    </TableRow>
  );
}

export function ActivityTable({ selectedActivityId, onActivitySelect }: ActivityTableProps) {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { activities, isLoading, hasMore } = useActivities();

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');

  const navigateToOffset = (newOffset: number) => {
    const newParams = createSearchParams({
      ...Object.fromEntries(searchParams),
      offset: newOffset.toString(),
    });
    navigate(`${location.pathname}?${newParams}`);
  };

  const handleRowMouseEnter = (activity: IActivity) => {
    hoverTimerRef.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: [QueryKeys.fetchActivity, currentEnvironment?._id, activity._id],
        queryFn: () => getNotification(activity._id, currentEnvironment!),
      });
    }, 1000);
  };

  const handleRowMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-full min-w-[800px] flex-1 flex-col">
      <Table
        isLoading={isLoading}
        loadingRow={<SkeletonRow />}
        containerClassname="border-x-0 border-b-0 border-t border-t-neutral-200 rounded-none shadow-none"
      >
        <TableHeader>
          <TableRow>
            <TableHead className="h-9 py-0">Details</TableHead>
            <TableHead className="h-9 py-0">Status</TableHead>
            <TableHead className="h-9 py-0">Steps</TableHead>
            <TableHead className="h-9 py-0">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow
              key={activity._id}
              className={cn(
                'relative cursor-pointer hover:bg-neutral-50',
                selectedActivityId === activity._id &&
                  'bg-neutral-50 after:absolute after:right-0 after:top-0 after:h-[calc(100%-1px)] after:w-[5px] after:bg-neutral-200'
              )}
              onClick={() => onActivitySelect(activity)}
              onMouseEnter={() => handleRowMouseEnter(activity)}
              onMouseLeave={handleRowMouseLeave}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-foreground-950 font-medium">
                    {activity.template?.name || 'Deleted workflow'}
                  </span>
                  <span className="text-foreground-400 text-[10px]">{activity.transactionId}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={getActivityStatus(activity.jobs)} jobs={activity.jobs} />
              </TableCell>
              <TableCell>
                <StepIndicators jobs={activity.jobs} />
              </TableCell>
              <TableCell className="text-foreground-600">
                <TimeDisplayHoverCard date={new Date(activity.createdAt)}>
                  <span>{formatDate(activity.createdAt)}</span>
                </TimeDisplayHoverCard>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="bottom-0 mt-auto border-t border-t-neutral-200 bg-white py-3">
        <div className="flex items-center justify-end px-6">
          <div className="border-input inline-flex items-center rounded-lg border bg-transparent">
            <Button
              variant="ghost"
              size="icon"
              disabled={offset === 0}
              onClick={() => navigateToOffset(0)}
              className="rounded-r-none border-0"
            >
              <div className="flex items-center">
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="-ml-2 h-4 w-4" />
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={offset === 0}
              onClick={() => navigateToOffset(Math.max(0, offset - limit))}
              className="border-l-input rounded-none border-0 border-l"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasMore}
              onClick={() => navigateToOffset(offset + limit)}
              className="border-l-input rounded-none border-0 border-l"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!hasMore}
              onClick={() => navigateToOffset(offset + limit * 5)}
              className="border-l-input rounded-l-none border-0 border-l"
            >
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="-ml-2 h-4 w-4" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
