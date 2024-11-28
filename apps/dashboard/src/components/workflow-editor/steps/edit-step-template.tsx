import { ConfigureStepTemplate } from '@/components/workflow-editor/steps/configure-step-template';
import { StepProvider } from '@/components/workflow-editor/steps/step-provider';

export const EditStepTemplate = () => {
  return (
    <StepProvider>
      <ConfigureStepTemplate />
    </StepProvider>
  );
};
