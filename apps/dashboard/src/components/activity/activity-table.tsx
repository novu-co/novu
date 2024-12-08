import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { Badge } from '@/components/primitives/badge';
import { format } from 'date-fns';
import { cn } from '@/utils/ui';
import { type Activity } from '@/hooks/use-activities';
import {
  BellIcon,
  SmartphoneIcon,
  MonitorIcon,
  MailIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  CheckCircleIcon as CheckCircle,
  AlertCircleIcon as AlertCircle,
  ClockIcon as Clock,
  HourglassIcon,
} from 'lucide-react';
import { STEP_TYPE_TO_ICON } from '../icons/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { useState } from 'react';

type ActivityStatus = 'SUCCESS' | 'ERROR' | 'QUEUED' | 'MERGED';

function getActivityStatus(jobs: Activity['jobs']): ActivityStatus {
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

function JobsList({ jobs }: { jobs: Activity['jobs'] }) {
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
                <span className="font-medium">{typeLabels[job.type] || job.type}</span>
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

function StatusBadge({ status, jobs }: { status: ActivityStatus; jobs: Activity['jobs'] }) {
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

function getStepIcon(type: string) {
  const Icon = STEP_TYPE_TO_ICON[type as keyof typeof STEP_TYPE_TO_ICON];

  return <Icon className="h-4 w-4" />;
}

function StepIndicators({ jobs }: { jobs: Activity['jobs'] }) {
  return (
    <div className="flex items-center">
      {jobs.map((job) => (
        <div
          key={job._id}
          className={cn(
            '-ml-2 flex h-7 w-7 items-center justify-center rounded-full first:ml-0',
            job.status === 'completed'
              ? 'border-[1px] border-[#b4e6c5] bg-[#e8f9ef] text-[#b4e6c5]'
              : job.status === 'failed'
                ? 'border-[1px] border-[#fca5a5] bg-[#fde8e8] text-[#fca5a5]'
                : 'border-[1px] border-[#e0e0e0] bg-[#f0f0f0] text-[#e0e0e0]'
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
  activities: Activity[];
  selectedActivity: Activity | null;
  onActivitySelect: (activity: Activity) => void;
}

export function ActivityTable({ activities, selectedActivity, onActivitySelect }: ActivityTableProps) {
  return (
    <div className="min-w-[800px]">
      <Table containerClassname="border-x-0 border-b-0 border-t border-t-neutral-200 rounded-none shadow-none">
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
                'cursor-pointer hover:bg-neutral-50',
                selectedActivity?._id === activity._id && 'bg-neutral-50'
              )}
              onClick={() => onActivitySelect(activity)}
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
              <TableCell className="text-foreground-600">{formatDate(activity.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
