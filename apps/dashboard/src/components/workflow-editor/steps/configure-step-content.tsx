import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiPencilRuler2Fill } from 'react-icons/ri';
import { StepTypeEnum } from '@novu/shared';

import { Button } from '../../primitives/button';
import { Separator } from '../../primitives/separator';
import { CommonFields } from './common-fields';
import { SidebarContent } from '@/components/side-navigation/Sidebar';
import { SdkBanner } from './sdk-banner';
import { useStep } from './use-step';
import { EXCLUDED_EDITOR_TYPES } from '@/utils/constants';
import { InAppConfigure } from '@/components/workflow-editor/steps/in-app/in-app-configure';
import { DelayConfigure } from '@/components/workflow-editor/steps/delay/delay-configure';

export const ConfigureStepContent = () => {
  const { step } = useStep();

  if (!step?.type) {
    return null;
  }

  if (step.type === StepTypeEnum.IN_APP) {
    return <InAppConfigure />;
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
