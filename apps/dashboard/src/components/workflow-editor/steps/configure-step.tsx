import { StepTypeEnum } from '@/utils/enums';
import { useStep } from './use-step';
import { InApp } from './in-app';

export function ConfigureStep() {
  const { channel } = useStep();

  if (channel === StepTypeEnum.IN_APP) {
    return <InApp />;
  }

  return <div>hi</div>;
}
