import { RiErrorWarningLine, RiCheckboxCircleLine, RiLoader3Line } from 'react-icons/ri';
import { format } from 'date-fns';
import { cn } from '@/utils/ui';
import { ActivityDetailCard } from './activity-detail-card';
import { IExecutionDetail } from '@novu/shared';

interface ExecutionDetailItemProps {
  detail: IExecutionDetail;
}

function getStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case 'success':
      return {
        icon: RiCheckboxCircleLine,
        colorClass: 'text-success',
      };
    case 'failed':
    case 'error':
      return {
        icon: RiErrorWarningLine,
        colorClass: 'text-destructive',
      };
    case 'pending':
    case 'queued':
      return {
        icon: RiLoader3Line,
        colorClass: 'text-neutral-300',
      };
    default:
      return {
        icon: RiCheckboxCircleLine,
        colorClass: 'text-success',
      };
  }
}

export function ExecutionDetailItem({ detail }: ExecutionDetailItemProps) {
  const { icon: StatusIcon, colorClass } = getStatusConfig(detail.status);

  const formatContent = (raw: unknown): string => {
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return JSON.stringify(parsed, null, 2)
          .split('\n')
          .map((line) => line.trimEnd())
          .join('\n');
      } catch {
        return raw;
      }
    }

    if (typeof raw === 'object') {
      return JSON.stringify(raw, null, 2)
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');
    }

    return String(raw);
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-full items-center pt-2">
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]',
            colorClass
          )}
        >
          <StatusIcon className={cn('h-4 w-4', colorClass)} />
        </div>
      </div>
      <ActivityDetailCard
        title={detail.detail}
        timestamp={format(new Date(detail.createdAt), 'HH:mm:ss')}
        expandable={!!detail.raw}
      >
        {detail.raw && (
          <pre className="min-w-0 max-w-full font-mono" style={{ width: '1px' }}>
            {formatContent(detail.raw)}
          </pre>
        )}
      </ActivityDetailCard>
    </div>
  );
}
