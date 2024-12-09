import { format } from 'date-fns';
import { cn } from '@/utils/ui';
import { STEP_TYPE_TO_ICON } from '@/components/icons/utils';
import { STATUS_CONFIG, STEP_TYPE_LABELS } from '../constants';
import { IActivityJob, StepTypeEnum } from '@novu/shared';

function getStepIcon(type?: StepTypeEnum) {
  const Icon = STEP_TYPE_TO_ICON[type as keyof typeof STEP_TYPE_TO_ICON];
  return <Icon className="h-4 w-4" />;
}

export interface JobsListProps {
  jobs: IActivityJob[];
}

export function JobsList({ jobs }: JobsListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {jobs.map((job, index) => {
        const lastExecutionDetail = job.executionDetails?.at(-1);
        const status = job.status as keyof typeof STATUS_CONFIG;
        const { color, label } = STATUS_CONFIG[status] || {
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
                <span className="font-medium">{STEP_TYPE_LABELS[job.type || ''] || job.type}</span>
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
