import { UiSchemaGroupEnum } from '@novu/shared';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { useStep } from '@/components/workflow-editor/steps/step-provider';
import { CustomStepControls } from '@/components/workflow-editor/steps/controls/custom-step-controls';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';

const amountKey = 'amount';
const unitKey = 'unit';
const typeKey = 'type';

export const DelayControlValues = () => {
  const { step } = useStep();
  const { workflow } = useWorkflow();
  const { uiSchema, dataSchema } = step?.controls ?? {};

  if (!uiSchema || !workflow || uiSchema?.group !== UiSchemaGroupEnum.DELAY) {
    return null;
  }

  const { [amountKey]: amount, [typeKey]: type, [unitKey]: unit } = uiSchema.properties ?? {};

  return (
    <>
      {amount && type && unit && getComponentByType({ component: amount.component })}
      <CustomStepControls className="text-xs" dataSchema={dataSchema} origin={workflow.origin} />
    </>
  );
};
