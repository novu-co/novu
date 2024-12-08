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

type ActivityStatus = 'SUCCESS' | 'ERROR' | 'QUEUED';

function getActivityStatus(jobs: Activity['jobs']): ActivityStatus {
  if (!jobs.length) return 'QUEUED';

  const lastJob = jobs[jobs.length - 1];
  switch (lastJob.status) {
    case 'completed':
      return 'SUCCESS';
    case 'failed':
      return 'ERROR';
    default:
      return 'QUEUED';
  }
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const config = {
    SUCCESS: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: 'SUCCESS',
    },
    ERROR: {
      variant: 'destructive' as const,
      icon: AlertCircle,
      label: '2 ERRORS',
    },
    QUEUED: {
      variant: 'warning' as const,
      icon: Clock,
      label: 'QUEUED',
    },
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Badge variant={variant} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
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
          title={`${job.type} - ${job.status}`}
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
      <Table containerClassname="border-x-0 border-b-0 border-t border-t-neutral-alpha-200 rounded-none shadow-none">
        <TableHeader>
          <TableRow>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Steps</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow
              key={activity._id}
              className={cn('hover:bg-muted/50 cursor-pointer', selectedActivity?._id === activity._id && 'bg-muted')}
              onClick={() => onActivitySelect(activity)}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{activity.template?.name}</span>
                  <span className="text-foreground-600 text-sm">{activity.transactionId}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={getActivityStatus(activity.jobs)} />
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
