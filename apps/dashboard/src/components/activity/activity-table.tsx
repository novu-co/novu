import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/primitives/table';
import { format } from 'date-fns';
import { cn } from '@/utils/ui';
import { IActivity, ISubscriber } from '@novu/shared';
import { TimeDisplayHoverCard } from '@/components/time-display-hover-card';
import { createSearchParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/utils/query-keys';
import { useEnvironment } from '@/context/environment/hooks';
import { getNotification } from '@/api/activity';
import { useActivities } from '@/hooks/use-activities';
import { StatusBadge } from './components/status-badge';
import { StepIndicators } from './components/step-indicators';
import { Pagination } from './components/pagination';
import { useRef, useEffect } from 'react';
import { IActivityFilters } from '@/api/activity';

export interface ActivityTableProps {
  selectedActivityId: string | null;
  onActivitySelect: (activity: IActivity) => void;
  filters?: IActivityFilters;
}

export function ActivityTable({ selectedActivityId, onActivitySelect, filters }: ActivityTableProps) {
  const queryClient = useQueryClient();
  const { currentEnvironment } = useEnvironment();
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { activities, isLoading, hasMore } = useActivities({ filters });

  const offset = parseInt(searchParams.get('offset') || '0');
  const limit = parseInt(searchParams.get('limit') || '10');

  const handleOffsetChange = (newOffset: number) => {
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
            <TableHead className="h-9 px-3 py-0">Event</TableHead>
            <TableHead className="h-9 px-3 py-0">Status</TableHead>
            <TableHead className="h-9 px-3 py-0">Steps</TableHead>
            <TableHead className="h-9 px-3 py-0">Triggered Date</TableHead>
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
              <TableCell className="px-3">
                <div className="flex flex-col">
                  <span className="text-foreground-950 font-medium">
                    {activity.template?.name || 'Deleted workflow'}
                  </span>
                  <span className="text-foreground-400 text-[10px] leading-[14px]">
                    {activity.transactionId} {getSubscriberDisplay(activity.subscriber)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3">
                <StatusBadge jobs={activity.jobs} />
              </TableCell>
              <TableCell className="px-3">
                <StepIndicators jobs={activity.jobs} />
              </TableCell>
              <TableCell className="text-foreground-600 px-3">
                <TimeDisplayHoverCard date={new Date(activity.createdAt)}>
                  <span>{formatDate(activity.createdAt)}</span>
                </TimeDisplayHoverCard>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination offset={offset} limit={limit} hasMore={hasMore} onOffsetChange={handleOffsetChange} />
    </div>
  );
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM d yyyy, HH:mm:ss');
}

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse">
      <TableCell className="px-3">
        <div className="flex flex-col gap-1">
          <div className="h-5 w-36 rounded bg-neutral-200" />
          <div className="h-2.5 w-20 rounded bg-neutral-100" />
        </div>
      </TableCell>
      <TableCell className="px-3">
        <div className="flex h-7 w-28 items-center justify-center gap-1.5 rounded-full bg-neutral-100">
          <div className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
          <div className="h-3.5 w-16 rounded bg-neutral-200" />
        </div>
      </TableCell>
      <TableCell className="px-3">
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
      <TableCell className="px-3">
        <div className="h-4 w-36 rounded bg-neutral-100 font-mono" />
      </TableCell>
    </TableRow>
  );
}

function getSubscriberDisplay(subscriber?: Pick<ISubscriber, '_id' | 'subscriberId'>) {
  if (!subscriber) return '';

  return subscriber.subscriberId ? `• ${subscriber.subscriberId}` : '';
}
