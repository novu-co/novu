import { useState } from 'react';
import { CheckCircleIcon as CheckCircle, AlertCircleIcon as AlertCircle, ClockIcon as Clock } from 'lucide-react';
import { Badge } from '@/components/primitives/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { JobsList } from './jobs-list';
import { StatusBadgeProps } from '../types';

export function StatusBadge({ status, jobs }: StatusBadgeProps) {
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
