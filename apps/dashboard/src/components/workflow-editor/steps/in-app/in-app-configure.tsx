import { RiArrowRightUpLine } from 'react-icons/ri';

import { Button } from '@/components/primitives/button';
import { RiArrowRightSLine } from 'react-icons/ri';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent } from '@/components/side-navigation/Sidebar';
import { CommonFields } from '@/components/workflow-editor/steps/common-fields';
import { RiPencilRuler2Fill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { ConfigureInAppPreview } from '@/components/workflow-editor/steps/configure-in-app-preview';
import { useStep } from '@/components/workflow-editor/steps/use-step';
import { getFirstControlsErrorMessage } from '@/components/workflow-editor/step-utils';
import { useMemo } from 'react';
import { getFirstBodyErrorMessage } from '@/components/workflow-editor/step-utils';

export const InAppConfigure = () => {
  const { step } = useStep();

  const firstError = useMemo(
    () => (step ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined),
    [step]
  );

  return (
    <>
      <SidebarContent>
        <CommonFields />
      </SidebarContent>
      <Separator />
      <SidebarContent>
        <Link to={'./edit'} relative="path" state={{ stepType: step?.type }}>
          <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
            <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
            Configure in-app template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
          </Button>
        </Link>

        {!firstError && <ConfigureInAppPreview />}
      </SidebarContent>
      {firstError && (
        <>
          <Separator />
          <SidebarContent>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Action required</span>
              <Link
                to="https://docs.novu.co/sdks/framework/typescript/steps/inApp"
                reloadDocument
                className="text-xs"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Help?</span>
              </Link>
            </div>
            <Link to={'./edit'} relative="path" state={{ stepType: step?.type }}>
              <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
                <span className="bg-destructive h-4 min-w-1 rounded-full" />
                <span className="overflow-hidden text-ellipsis">{firstError}</span>
                <RiArrowRightUpLine className="text-destructive ml-auto h-4 w-4" />
              </Button>
            </Link>
          </SidebarContent>
        </>
      )}
    </>
  );
};
