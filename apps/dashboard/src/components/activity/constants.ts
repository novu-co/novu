import { JobStatusEnum } from '@novu/shared';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiForbidFill } from 'react-icons/ri';
import { BadgeVariant } from '../primitives/badge';
import { RiLoader3Line, RiLoader4Fill } from 'react-icons/ri';
import { IconType } from 'react-icons/lib';

export const STATUS_STYLES = {
  completed: 'border-[1px] border-success/40 bg-success/10 text-success/40',
  failed: 'border-[1px] border-destructive/40 bg-destructive/10 text-destructive/40',
  delayed: 'border-[1px] border-warning/40 bg-warning/10 text-warning/40',
  default: 'border-[1px] border-neutral-200 bg-neutral-50 text-neutral-200',
} as const;

export const JOB_STATUS_CONFIG: Record<
  JobStatusEnum,
  {
    variant: BadgeVariant;
    color: string;
    icon: IconType;
    label: string;
    animationClass?: string;
  }
> = {
  [JobStatusEnum.COMPLETED]: {
    variant: 'success' as const,
    color: 'success',
    icon: RiCheckboxCircleFill,
    label: 'SUCCESS',
  },
  [JobStatusEnum.FAILED]: {
    variant: 'destructive' as const,
    color: 'destructive',
    icon: RiErrorWarningFill,
    label: `ERROR`,
  },
  [JobStatusEnum.MERGED]: {
    variant: 'success' as const,
    color: 'success',
    icon: RiForbidFill,
    label: 'MERGED',
  },
  [JobStatusEnum.PENDING]: {
    variant: 'warning' as const,
    icon: RiLoader3Line,
    color: 'neutral-300',
    label: 'PENDING',
  },
  [JobStatusEnum.CANCELED]: {
    variant: 'warning' as const,
    icon: RiLoader3Line,
    color: 'neutral-300',
    label: 'CANCELED',
  },
  [JobStatusEnum.SKIPPED]: {
    variant: 'warning' as const,
    icon: RiLoader3Line,
    color: 'neutral-300',
    label: 'SKIPPED',
  },
  [JobStatusEnum.RUNNING]: {
    variant: 'warning' as const,
    icon: RiLoader3Line,
    color: 'warning',
    label: 'RUNNING',
  },
  [JobStatusEnum.DELAYED]: {
    variant: 'warning' as const,
    icon: RiLoader4Fill,
    label: 'DELAYED',
    color: 'warning',
    animationClass: 'animate-spin-slow',
  },
  [JobStatusEnum.QUEUED]: {
    variant: 'warning' as const,
    icon: RiLoader3Line,
    color: 'warning',
    label: 'QUEUED',
  },
};
