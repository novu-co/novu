import { ConfigureInAppStepTemplateTabs } from '@/components/workflow-editor/steps/configure-in-app-template/configure-in-app-step-template-tabs';
import { StepTypeEnum } from '@novu/shared';

const STEP_TYPE_TO_EDITOR: Record<StepTypeEnum, () => React.JSX.Element> = {
  [StepTypeEnum.EMAIL]: () => <div>EMAIL Editor</div>,
  [StepTypeEnum.CHAT]: () => <div>CHAT Editor</div>,
  [StepTypeEnum.IN_APP]: ConfigureInAppStepTemplateTabs,
  [StepTypeEnum.SMS]: () => <div>SMS Editor</div>,
  [StepTypeEnum.PUSH]: () => <div>PUSH Editor</div>,
  [StepTypeEnum.DIGEST]: () => <div>DIGEST Editor</div>,
  [StepTypeEnum.DELAY]: () => <div>DELAY Editor</div>,
  [StepTypeEnum.TRIGGER]: () => <div>TRIGGER Editor</div>,
  [StepTypeEnum.CUSTOM]: () => <div>CUSTOM Editor</div>,
};

export const StepEditor = ({ stepType }: { stepType: StepTypeEnum }) => {
  const Editor = STEP_TYPE_TO_EDITOR[stepType];
  return <Editor />;
};
