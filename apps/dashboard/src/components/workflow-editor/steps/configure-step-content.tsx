import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiPencilRuler2Fill } from 'react-icons/ri';
import { StepTypeEnum } from '@novu/shared';

import { DelayConfigure } from '@/components/workflow-editor/steps/delay/delay-configure';
import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent } from '@/components/side-navigation/sidebar';
import { getFirstBodyErrorMessage, getFirstControlsErrorMessage } from '@/components/workflow-editor/step-utils';
import { CommonFields } from '@/components/workflow-editor/steps/common-fields';
import { SdkBanner } from '@/components/workflow-editor/steps/sdk-banner';
import { useStep } from '@/components/workflow-editor/steps/use-step';
import { EXCLUDED_EDITOR_TYPES } from '@/utils/constants';
import { ConfigureInAppStepTemplate } from '@/components/workflow-editor/steps/in-app/configure-in-app-step-template';
import { useMemo } from 'react';

export const ConfigureStepContent = () => {
  const { step } = useStep();

  const firstError = useMemo(
    () => (step ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined),
    [step]
  );

  if (!step?.type) {
    return null;
  }

  if (step?.type === StepTypeEnum.IN_APP) {
    return <ConfigureInAppStepTemplate step={step} issue={firstError} />;
  }

  if (step.type === StepTypeEnum.DELAY) {
    return <DelayConfigure />;
  }

  const showTemplateEditor = !EXCLUDED_EDITOR_TYPES.includes(step.type);

  return (
    <>
      <SidebarContent>
        <CommonFields />
      </SidebarContent>
      <Separator />
      {showTemplateEditor && (
        <>
          <SidebarContent>
            <Link to={'./edit'} relative="path" state={{ stepType: step.type }}>
              <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
                <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
                Configure {step.type} template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
              </Button>
            </Link>
          </SidebarContent>
          <Separator />
        </>
      )}
      <SidebarContent>
        <SdkBanner />
      </SidebarContent>
    </>
  );
};
