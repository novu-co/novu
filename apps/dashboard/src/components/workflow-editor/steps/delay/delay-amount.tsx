import { NumberInputWithSelect } from '@/components/number-input-with-select';

import { FormLabel } from '@/components/primitives/form/form';
import { useMemo } from 'react';
import { JSONSchemaDto, TimeUnitEnum } from '@novu/shared';

const amountKey = 'amount';
const unitKey = 'unit';

const defaultUnitValues = Object.values(TimeUnitEnum);

export const DelayAmount = ({ dataSchema, isReadOnly }: { dataSchema: JSONSchemaDto; isReadOnly: boolean }) => {
  const unitOptions = useMemo(() => (dataSchema.properties?.unit as any)?.enum ?? defaultUnitValues, [dataSchema]);

  return (
    <div>
      <FormLabel tooltip="Delays workflow for the set time, then proceeds to the next step.">
        Delay execution by
      </FormLabel>
      <NumberInputWithSelect inputName={amountKey} selectName={unitKey} options={unitOptions} isReadOnly={isReadOnly} />
    </div>
  );
};
