import { JobStatusEnum, StepTypeEnum } from '@novu/shared';
import { RiForbidFill } from 'react-icons/ri';
import { RiErrorWarningLine } from 'react-icons/ri';
import { BadgeVariant } from '../primitives/badge';
import { RiCheckboxCircleLine, RiLoader3Line, RiLoader4Fill } from 'react-icons/ri';
import { IconType } from 'react-icons/lib';

export const STEP_TYPE_LABELS: Record<StepTypeEnum, string> = {
  [StepTypeEnum.EMAIL]: 'Email',
  [StepTypeEnum.SMS]: 'SMS',
  [StepTypeEnum.IN_APP]: 'In-App',
  [StepTypeEnum.CHAT]: 'Chat',
  [StepTypeEnum.PUSH]: 'Push',
  [StepTypeEnum.DIGEST]: 'Digest',
  [StepTypeEnum.DELAY]: 'Delay',
  [StepTypeEnum.TRIGGER]: 'Trigger',
  [StepTypeEnum.CUSTOM]: 'Custom',
};

export const STATUS_STYLES = {
  completed: 'border-[1px] border-[#b4e6c5] bg-[#e8f9ef] text-[#b4e6c5]',
  failed: 'border-[1px] border-[#fca5a5] bg-[#fde8e8] text-[#fca5a5]',
  delayed: 'border-[1px] border-[#f7d794] bg-[#fef9e7] text-[#f7d794]',
  default: 'border-[1px] border-[#e0e0e0] bg-[#f0f0f0] text-[#e0e0e0]',
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
    icon: RiCheckboxCircleLine,
    label: 'SUCCESS',
  },
  [JobStatusEnum.FAILED]: {
    variant: 'destructive' as const,
    color: 'destructive',
    icon: RiErrorWarningLine,
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
