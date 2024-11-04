import { StepTypeEnum } from '@novu/shared';
import { InAppEditor } from './in-app-editor';

const STEP_TYPE_TO_EDITOR: Record<StepTypeEnum, () => React.JSX.Element> = {
  [StepTypeEnum.EMAIL]: () => <div>EMAIL Editor</div>,
  [StepTypeEnum.CHAT]: () => <div>CHAT Editor</div>,
  [StepTypeEnum.IN_APP]: InAppEditor,
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
