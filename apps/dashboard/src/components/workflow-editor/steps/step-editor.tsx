import { type StepDataDto, StepTypeEnum, type WorkflowResponseDto } from '@novu/shared';
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';
import { OtherStepTabs } from './other-steps-tabs';

const STEP_TYPE_TO_EDITOR: Record<
  StepTypeEnum,
  (args: { workflow: WorkflowResponseDto; step: StepDataDto }) => React.JSX.Element | null
> = {
  [StepTypeEnum.EMAIL]: OtherStepTabs,
  [StepTypeEnum.CHAT]: OtherStepTabs,
  [StepTypeEnum.IN_APP]: InAppTabs,
  [StepTypeEnum.SMS]: OtherStepTabs,
  [StepTypeEnum.PUSH]: OtherStepTabs,
  [StepTypeEnum.DIGEST]: () => null,
  [StepTypeEnum.DELAY]: () => null,
  [StepTypeEnum.TRIGGER]: () => null,
  [StepTypeEnum.CUSTOM]: () => null,
};

export const StepEditor = ({
  workflow,
  step,
  stepType,
}: {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  stepType: StepTypeEnum;
}) => {
  const Editor = STEP_TYPE_TO_EDITOR[stepType];
  return <Editor workflow={workflow} step={step} />;
};
