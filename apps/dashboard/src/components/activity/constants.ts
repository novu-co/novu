import { IActivityJob, JobStatusEnum, StepTypeEnum } from '@novu/shared';

export const STATUS_CONFIG = {
  [JobStatusEnum.COMPLETED]: {
    color: 'text-success',
    label: 'Delivered',
  },
  [JobStatusEnum.MERGED]: {
    color: 'text-info',
    label: 'Merged',
  },
  [JobStatusEnum.FAILED]: {
    color: 'text-destructive',
    label: 'Failed',
  },
  [JobStatusEnum.PENDING]: {
    color: 'text-warning',
    label: 'Pending',
  },
  [JobStatusEnum.DELAYED]: {
    color: 'text-warning',
    label: 'Delayed',
  },
} as const;

export const STEP_TYPE_LABELS: Record<string, string> = {
  [StepTypeEnum.EMAIL]: 'Email',
  [StepTypeEnum.SMS]: 'SMS',
  [StepTypeEnum.IN_APP]: 'In-App',
  [StepTypeEnum.CHAT]: 'Chat',
  [StepTypeEnum.PUSH]: 'Push',
  [StepTypeEnum.DIGEST]: 'Digest',
};

export const STATUS_STYLES = {
  completed: 'border-[1px] border-[#b4e6c5] bg-[#e8f9ef] text-[#b4e6c5]',
  failed: 'border-[1px] border-[#fca5a5] bg-[#fde8e8] text-[#fca5a5]',
  delayed: 'border-[1px] border-[#f7d794] bg-[#fef9e7] text-[#f7d794]',
  default: 'border-[1px] border-[#e0e0e0] bg-[#f0f0f0] text-[#e0e0e0]',
} as const;

export const getActivityStatus = (jobs: IActivityJob[]) => {
  if (!jobs.length) return 'QUEUED';

  const lastJob = jobs[jobs.length - 1];

  switch (lastJob.status) {
    case JobStatusEnum.COMPLETED:
      return 'SUCCESS';
    case JobStatusEnum.FAILED:
      return 'ERROR';
    case JobStatusEnum.MERGED:
      return 'MERGED';
    default:
      return 'QUEUED';
  }
};
