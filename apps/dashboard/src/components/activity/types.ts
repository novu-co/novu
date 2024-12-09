import { IActivity, IActivityJob, StepTypeEnum } from '@novu/shared';

export type ActivityStatus = 'SUCCESS' | 'ERROR' | 'QUEUED' | 'MERGED';

export interface ActivityTableProps {
  selectedActivityId: string | null;
  onActivitySelect: (activity: IActivity) => void;
}

export interface ActivityPanelProps {
  activityId: string;
  onActivitySelect: (activityId: string) => void;
}

export interface JobsListProps {
  jobs: IActivityJob[];
}

export interface StepIndicatorsProps {
  jobs: IActivityJob[];
}

export interface StatusBadgeProps {
  status: ActivityStatus;
  jobs: IActivityJob[];
}

export interface ActivityOverviewProps {
  activity: IActivity;
}
