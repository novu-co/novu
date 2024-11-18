import { ComponentProps } from 'react';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiForbidFill } from 'react-icons/ri';
import { Badge } from '@/components/primitives/badge';
import { WorkflowStatusEnum } from '@/utils/enums';
import { type IconType } from 'react-icons/lib';

type WorkflowStatusProps = {
  status: WorkflowStatusEnum;
};

const statusRenderData: Record<
  WorkflowStatusEnum,
  {
    badgeVariant: ComponentProps<typeof Badge>['variant'];
    text: string;
    icon: IconType;
  }
> = {
  [WorkflowStatusEnum.ACTIVE]: {
    badgeVariant: 'success',
    text: 'Active',
    icon: RiCheckboxCircleFill,
  },
  [WorkflowStatusEnum.INACTIVE]: {
    badgeVariant: 'soft',
    text: 'Inactive',
    icon: RiForbidFill,
  },
  [WorkflowStatusEnum.ERROR]: {
    badgeVariant: 'destructive',
    text: 'Action required',
    icon: RiErrorWarningFill,
  },
};

export const WorkflowStatus = (props: WorkflowStatusProps) => {
  const { status } = props;
  const badgeVariant = statusRenderData[status].badgeVariant;
  const Icon = statusRenderData[status].icon;
  const text = statusRenderData[status].text;

  return (
    <Badge variant={badgeVariant} className="border-none">
      <Icon className="size-4" /> {text}
    </Badge>
  );
};
