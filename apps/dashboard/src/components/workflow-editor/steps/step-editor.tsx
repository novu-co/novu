import { type StepDataDto, StepTypeEnum, type WorkflowResponseDto } from '@novu/shared';
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';

const STEP_TYPE_TO_EDITOR: Record<
  StepTypeEnum,
  (args: { workflow: WorkflowResponseDto; step: StepDataDto }) => React.JSX.Element
> = {
  [StepTypeEnum.EMAIL]: () => <div>EMAIL Editor</div>,
  [StepTypeEnum.CHAT]: () => <div>CHAT Editor</div>,
  [StepTypeEnum.IN_APP]: InAppTabs,
  [StepTypeEnum.SMS]: () => <div>SMS Editor</div>,
  [StepTypeEnum.PUSH]: () => <div>PUSH Editor</div>,
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
