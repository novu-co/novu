import { Badge, BadgeContent } from '@/components/primitives/badge';
import { WorkflowStatusEnum } from '@/utils/enums';
import { ComponentProps } from 'react';

type WorkflowStatusProps = {
  status: WorkflowStatusEnum;
};

const statusRenderData: Record<
  WorkflowStatusEnum,
  {
    badgeVariant: ComponentProps<typeof Badge>['variant'];
    badgeContentVariant: ComponentProps<typeof BadgeContent>['variant'];
    text: string;
  }
> = {
  [WorkflowStatusEnum.ACTIVE]: { badgeVariant: 'success-light', badgeContentVariant: 'success', text: 'Active' },
  [WorkflowStatusEnum.INACTIVE]: { badgeVariant: 'warning-light', badgeContentVariant: 'warning', text: 'Inactive' },
  [WorkflowStatusEnum.ERROR]: {
    badgeVariant: 'destructive-light',
    badgeContentVariant: 'destructive',
    text: 'Action required',
  },
};

export const WorkflowStatus = (props: WorkflowStatusProps) => {
  const { status } = props;
  const badgeVariant = statusRenderData[status].badgeVariant;
  const badgeContentVariant = statusRenderData[status].badgeContentVariant;

  return (
    <Badge variant={badgeVariant}>
      <BadgeContent variant={badgeContentVariant}>{statusRenderData[status].text}</BadgeContent>
    </Badge>
  );
};
