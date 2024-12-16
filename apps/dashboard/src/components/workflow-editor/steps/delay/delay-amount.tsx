import { AmountInput } from '@/components/amount-input';

import { FormLabel } from '@/components/primitives/form/form';
import { useMemo } from 'react';
import { TimeUnitEnum } from '@novu/shared';
import { useSaveForm } from '@/components/workflow-editor/steps/save-form-context';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';

const defaultUnitValues = Object.values(TimeUnitEnum);

const amountKey = 'amount';
const unitKey = 'unit';

export const DelayAmount = () => {
  const { step } = useWorkflow();
  const { saveForm } = useSaveForm();
  const { dataSchema, uiSchema } = step?.controls ?? {};

  const minAmountValue = useMemo(() => {
    if (typeof dataSchema === 'object') {
      const amountField = dataSchema.properties?.amount;

      if (typeof amountField === 'object' && amountField.type === 'number') {
        return amountField.minimum ?? 1;
      }
    }

    return 1;
  }, [dataSchema]);

  const unitOptions = useMemo(
    () => (dataSchema?.properties?.[unitKey] as any)?.enum ?? defaultUnitValues,
    [dataSchema?.properties]
  );

  const defaultUnitOption = useMemo(
    () => (uiSchema?.properties?.[unitKey] as any)?.placeholder ?? TimeUnitEnum.SECONDS,
    [uiSchema?.properties]
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <FormLabel tooltip="Delays workflow for the set time, then proceeds to the next step.">
        Delay execution by
      </FormLabel>
      <AmountInput
        fields={{ inputKey: `controlValues.${amountKey}`, selectKey: `controlValues.${unitKey}` }}
        options={unitOptions}
        defaultOption={defaultUnitOption}
        onValueChange={saveForm}
        min={minAmountValue}
      />
    </div>
  );
};
