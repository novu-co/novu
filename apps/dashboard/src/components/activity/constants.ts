import { JobStatusEnum } from '@novu/shared';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiForbidFill } from 'react-icons/ri';
import { BadgeVariant } from '../primitives/badge';
import { RiLoader3Line, RiLoader4Fill } from 'react-icons/ri';
import { IconType } from 'react-icons/lib';

export const STATUS_STYLES = {
  completed: 'border-[#99e3bb] bg-[#e9faf0] text-[#99e3bb]',
  failed: 'border-[#ec98a0] bg-[#ffebed] text-[#ec98a0]',
  delayed: 'border-[#F5A524] bg-[#FEF4E6] text-[#F8C16E]',
  default: 'border-[#e0e4ea] bg-[#fbfbfb] text-[#e0e4ea]',
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
