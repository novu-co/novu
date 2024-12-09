import { useState } from 'react';
import { Badge, BadgeVariant } from '@/components/primitives/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { IActivityJob, JobStatusEnum } from '@novu/shared';
import { StatusPreviewCard } from './status-preview-card';
import { JOB_STATUS_CONFIG } from '../constants';

export type ActivityStatus = 'SUCCESS' | 'ERROR' | 'QUEUED' | 'MERGED';

export interface StatusBadgeProps {
  jobs: IActivityJob[];
}

export function StatusBadge({ jobs }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const errorCount = jobs.filter((job) => job.status === JobStatusEnum.FAILED).length;
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

  const status = getActivityStatus(jobs);

  const { variant, icon: Icon, label } = JOB_STATUS_CONFIG[status] || JOB_STATUS_CONFIG[JobStatusEnum.PENDING];
  const displayLabel =
    status === JobStatusEnum.FAILED ? `${errorCount} ${errorCount === 1 ? 'ERROR' : 'ERRORS'}` : label;

  return (
    <Popover open={isOpen}>
      <PopoverTrigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Badge variant={variant as BadgeVariant} className="cursor-pointer gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {displayLabel}
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        className="w-64"
        align="start"
        sideOffset={5}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={handleMouseLeave}
      >
        <StatusPreviewCard jobs={jobs} />
      </PopoverContent>
    </Popover>
  );
}
const getActivityStatus = (jobs: IActivityJob[]) => {
  if (!jobs.length) return JobStatusEnum.PENDING;

  const lastJob = jobs[jobs.length - 1];

  return lastJob.status;
};
