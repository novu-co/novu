import { StepTypeEnum, IActivityJob } from '@novu/shared';

export const STATUS_CONFIG = {
  completed: {
    color: 'text-success',
    label: 'Delivered',
  },
  merged: {
    color: 'text-info',
    label: 'Merged',
  },
  failed: {
    color: 'text-destructive',
    label: 'Failed',
  },
  pending: {
    color: 'text-warning',
    label: 'Pending',
  },
  delayed: {
    color: 'text-warning',
    label: 'Delayed',
  },
} as const;

export const STEP_TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  sms: 'SMS',
  in_app: 'In-App',
  chat: 'Chat',
  push: 'Push',
  digest: 'Digest',
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
    case 'completed':
      return 'SUCCESS';
    case 'failed':
      return 'ERROR';
    case 'merged':
      return 'MERGED';
    default:
      return 'QUEUED';
  }
};
