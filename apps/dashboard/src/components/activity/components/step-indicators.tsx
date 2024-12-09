import { cn } from '@/utils/ui';
import { STATUS_STYLES } from '../constants';
import { StepIndicatorsProps } from '../types';
import { StepTypeEnum } from '@novu/shared';
import { STEP_TYPE_TO_ICON } from '@/components/icons/utils';

function getStepIcon(type?: StepTypeEnum) {
  const Icon = STEP_TYPE_TO_ICON[type as keyof typeof STEP_TYPE_TO_ICON];
  return <Icon className="h-4 w-4" />;
}

export function StepIndicators({ jobs }: StepIndicatorsProps) {
  return (
    <div className="flex items-center">
      {jobs.map((job) => (
        <div
          key={job._id}
          className={cn(
            '-ml-2 flex h-7 w-7 items-center justify-center rounded-full first:ml-0',
            STATUS_STYLES[job.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.default
          )}
        >
          {getStepIcon(job.type)}
        </div>
      ))}
    </div>
  );
}
