import { Route, ChevronDown } from 'lucide-react';
import { Button } from '@/components/primitives/button';
import { Badge } from '@/components/primitives/badge';
import { Card, CardContent, CardHeader } from '../primitives/card';
import {
  RiCheckLine,
  RiMailLine,
  RiMessage2Line,
  RiSmartphoneLine,
  RiNotification3Line,
  RiTimeLine,
  RiShadowLine,
} from 'react-icons/ri';
import { type Activity } from '@/hooks/use-activities';
import { format } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/utils/ui';
import { ExecutionDetailItem } from './execution-detail-item';

interface ActivityJobItemProps {
  job: Activity['jobs'][0];
  isLast: boolean;
}

function getJobIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'delay':
      return <RiTimeLine className="h-3.5 w-3.5" />;
    case 'in_app':
      return <RiNotification3Line className="h-3.5 w-3.5" />;
    case 'push':
      return <RiSmartphoneLine className="h-3.5 w-3.5" />;
    case 'email':
      return <RiMailLine className="h-3.5 w-3.5" />;
    case 'sms':
      return <RiMessage2Line className="h-3.5 w-3.5" />;
    case 'chat':
      return <RiMessage2Line className="h-3.5 w-3.5" />;
    case 'digest':
      return <RiShadowLine className="h-3.5 w-3.5" />;
    default:
      return <Route className="h-3.5 w-3.5" />;
  }
}

function getJobColor(status: string) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'destructive';
    default:
      return 'muted';
  }
}

function hasDigestAmount(job: any): job is { digestAmount: number } {
  return 'digestAmount' in job && typeof job.digestAmount === 'number';
}

function JobDetails({ job }: { job: Activity['jobs'][0] }) {
  return (
    <div className="border-t border-neutral-100 p-4">
      <div className="flex flex-col gap-4">
        {job.executionDetails && job.executionDetails.length > 0 && (
          <div className="flex flex-col gap-2">
            {job.executionDetails.map((detail, index) => (
              <ExecutionDetailItem key={index} detail={detail} />
            ))}
          </div>
        )}
        {hasDigestAmount(job) && job.digestAmount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-foreground-950 text-xs font-medium">Digest Count</span>
            <span className="text-foreground-600 font-mono text-xs">{job.digestAmount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityJobItem({ job, isLast }: ActivityJobItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const jobColor = getJobColor(job.status);

  return (
    <div className="relative flex items-center gap-4">
      {!isLast && <div className="absolute left-[11px] top-[50%] h-[calc(100%+24px)] w-[1px] bg-neutral-200" />}

      <div className="relative flex-shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]">
          <div className={`bg-${jobColor} flex h-4 w-4 items-center justify-center rounded-full`}>
            <RiCheckLine className="h-3.5 w-3.5 text-white" />
          </div>
        </div>
      </div>

      <Card className="border-1 flex-1 border-neutral-200 p-1 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between p-3">
          <div className="flex items-center gap-1.5">
            <div className={`h-5 w-5 rounded-full border border-${jobColor}`}>
              <div className={`h-full w-full rounded-full text-${jobColor} flex items-center justify-center`}>
                {getJobIcon(job.type)}
              </div>
            </div>
            <span className="text-foreground-950 text-xs capitalize">{job.type}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-foreground-600 !mt-0 h-5 gap-0 p-0 leading-[12px] hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            Show more
            <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
          </Button>
        </CardHeader>

        {!isExpanded && (
          <CardContent className="rounded-lg bg-neutral-50 p-2">
            <div className="flex items-center justify-between">
              <span className="text-foreground-400 text-xs capitalize">{job.status}</span>
              <Badge variant="soft" className="bg-foreground-50 px-2 py-0.5 text-[11px] leading-3">
                {format(new Date(job.updatedAt), 'MMM d yyyy, HH:mm:ss')}
              </Badge>
            </div>
          </CardContent>
        )}

        {isExpanded && <JobDetails job={job} />}
      </Card>
    </div>
  );
}
