import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiArrowRightUpLine, RiPencilRuler2Fill } from 'react-icons/ri';
import { StepTypeEnum } from '@novu/shared';

import { Button } from '../../primitives/button';
import { Separator } from '../../primitives/separator';
import { CommonFields } from './common-fields';
import { SidebarContent } from '@/components/side-navigation/Sidebar';
import { ConfigureInAppPreview } from './configure-in-app-preview';
import { SdkBanner } from './sdk-banner';
import { useStep } from './use-step';
import { getFirstControlsErrorMessage, getFirstBodyErrorMessage } from '../step-utils';

export const ConfigureStepContent = () => {
  const { step } = useStep();

  const firstError = useMemo(
    () => (step ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined),
    [step]
  );

  if (step?.type === StepTypeEnum.IN_APP) {
    return (
      <>
        <SidebarContent>
          <CommonFields />
        </SidebarContent>
        <Separator />
        <SidebarContent>
          <Link to={'./edit'} relative="path">
            <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
              <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
              Configure in-app template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
            </Button>
          </Link>

          {!firstError && <ConfigureInAppPreview />}
        </SidebarContent>
        <Separator />
        {firstError && (
          <SidebarContent>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Action required</span>
              <Link to="https://docs.novu.co/sdks/framework/typescript/steps/inApp" reloadDocument className="text-xs">
                <span>Help?</span>
              </Link>
            </div>
            <Link to={'./edit'} relative="path">
              <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
                <span className="bg-destructive h-4 min-w-1 rounded-full" />
                <span className="overflow-hidden text-ellipsis">{firstError}</span>
                <RiArrowRightUpLine className="text-destructive ml-auto h-4 w-4" />
              </Button>
            </Link>
          </SidebarContent>
        )}
      </>
    );
  }

  return (
    <>
      <SidebarContent>
        <CommonFields />
      </SidebarContent>
      <Separator />
      <SidebarContent>
        <Link to={'./edit'} relative="path">
          <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
            <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
            Configure {step?.type} template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
          </Button>
        </Link>
      </SidebarContent>
      <Separator />
      <SidebarContent>
        <SdkBanner />
      </SidebarContent>
    </>
  );
};
