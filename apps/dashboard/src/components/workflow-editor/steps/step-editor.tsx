import { type StepDataDto, StepTypeEnum, type WorkflowResponseDto } from '@novu/shared';
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';
import { OtherStepTabs } from './other-steps-tabs';

const STEP_TYPE_TO_EDITOR: Record<
  StepTypeEnum,
  (args: { workflow: WorkflowResponseDto; step: StepDataDto }) => React.JSX.Element
> = {
  [StepTypeEnum.EMAIL]: OtherStepTabs,
  [StepTypeEnum.CHAT]: OtherStepTabs,
  [StepTypeEnum.IN_APP]: InAppTabs,
  [StepTypeEnum.SMS]: OtherStepTabs,
  [StepTypeEnum.PUSH]: OtherStepTabs,
  [StepTypeEnum.DIGEST]: () => <div>DIGEST Editor</div>,
  [StepTypeEnum.DELAY]: () => <div>DELAY Editor</div>,
  [StepTypeEnum.TRIGGER]: () => <div>TRIGGER Editor</div>,
  [StepTypeEnum.CUSTOM]: () => <div>CUSTOM Editor</div>,
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
