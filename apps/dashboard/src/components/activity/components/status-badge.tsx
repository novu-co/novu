import { useState, useRef, useEffect } from 'react';
import { Badge, BadgeVariant } from '@/components/primitives/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { IActivityJob, JobStatusEnum } from '@novu/shared';
import { StatusPreviewCard } from './status-preview-card';
import { JOB_STATUS_CONFIG } from '../constants';

export interface StatusBadgeProps {
  jobs: IActivityJob[];
}

export function StatusBadge({ jobs }: StatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const errorCount = jobs.filter((job) => job.status === JobStatusEnum.FAILED).length;
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const status = getActivityStatus(jobs);

  const { variant, icon: Icon, label } = JOB_STATUS_CONFIG[status] || JOB_STATUS_CONFIG[JobStatusEnum.PENDING];
  const displayLabel =
    status === JobStatusEnum.FAILED ? `${errorCount} ${errorCount === 1 ? 'ERROR' : 'ERRORS'}` : label;

  return (
    <Popover open={isOpen}>
      <PopoverTrigger onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Badge variant={variant as BadgeVariant} className="cursor-pointer gap-1 px-1 py-0 leading-6">
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
