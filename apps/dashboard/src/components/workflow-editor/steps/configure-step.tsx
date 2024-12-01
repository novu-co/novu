import { ConfigureStepForm } from '@/components/workflow-editor/steps/configure-step-form';
import { useStep } from '@/components/workflow-editor/steps/step-provider';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useEnvironment } from '@/context/environment/hooks';

export const ConfigureStep = () => {
  const { step } = useStep();
  const { workflow, update } = useWorkflow();
  const { currentEnvironment } = useEnvironment();
  if (!currentEnvironment || !step || !workflow) {
    return null;
  }

  return <ConfigureStepForm workflow={workflow} step={step} environment={currentEnvironment} update={update} />;
};
