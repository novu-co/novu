import { RiErrorWarningLine, RiCheckboxCircleLine, RiLoader3Line } from 'react-icons/ri';
import { format } from 'date-fns';
import { type Activity } from '@/hooks/use-activities';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/ui';

interface ExecutionDetailItemProps {
  detail: Activity['jobs'][0]['executionDetails'][0];
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
  const [isExpanded, setIsExpanded] = useState(false);
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
      <div className="border-1 w-full rounded-lg border border-neutral-200">
        <div
          className="flex w-full cursor-pointer items-center px-3 py-2 hover:bg-neutral-50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-foreground-950 flex-1 text-left text-xs font-medium">{detail.detail}</span>
          <div className="flex items-center gap-2 pl-3">
            <span className="text-xs text-[#717784]">{format(new Date(detail.createdAt), 'HH:mm:ss')}</span>
            <ChevronDown className={cn('h-4 w-4 text-[#717784] transition-transform', isExpanded && 'rotate-180')} />
          </div>
        </div>
        {isExpanded && detail.raw && (
          <div className="border-t border-neutral-200 bg-neutral-50 p-3">
            <div className="text-foreground-600 text-xs">
              <div className="overflow-x-auto">
                <pre className="max-w-fullfont-mono min-w-0" style={{ width: '1px' }}>
                  {formatContent(detail.raw)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
