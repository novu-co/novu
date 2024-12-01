import { useMemo } from 'react';

import { FormLabel } from '@/components/primitives/form/form';
import { URLInput } from '../../url-input';
import { urlTargetTypes } from '@/utils/url';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { useStep } from '@/components/workflow-editor/steps/step-provider';

export const InAppRedirect = () => {
  const { step } = useStep();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  return (
    <div className="flex flex-col gap-1">
      <FormLabel tooltip="The redirect object defines the URL to visit when the notification is clicked. Alternatively, use an onNotificationClick handler in the <Inbox /> component.">
        Redirect URL
      </FormLabel>
      <URLInput
        options={urlTargetTypes}
        placeholder="/tasks/{{taskId}}"
        asEditor
        fields={{
          urlKey: 'redirect.url',
          targetKey: 'redirect.target',
        }}
        variables={variables}
      />
    </div>
  );
};
