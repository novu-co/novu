import { UiSchemaGroupEnum } from '@novu/shared';
import { getComponentByType } from '@/components/workflow-editor/steps/component-utils';
import { useStep } from '@/components/workflow-editor/steps/step-provider';

const amountKey = 'amount';
const unitKey = 'unit';
const typeKey = 'type';

export const DelayControlValues = () => {
  const { step } = useStep();
  const { uiSchema } = step?.controls ?? {};

  if (!uiSchema || uiSchema?.group !== UiSchemaGroupEnum.DELAY) {
    return null;
  }

  const { [amountKey]: amount, [typeKey]: type, [unitKey]: unit } = uiSchema.properties ?? {};

  return amount && type && unit && getComponentByType({ component: amount.component });
};
