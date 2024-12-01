import { ConfigureStep } from '@/components/workflow-editor/steps/configure-step';
import { StepProvider } from '@/components/workflow-editor/steps/step-provider';

export const EditStep = () => {
  return (
    <StepProvider>
      <ConfigureStep />
    </StepProvider>
  );
};
