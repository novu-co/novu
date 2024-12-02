/**
 * This component is used as a placeholder for the other step configuration until the actual configuration is implemented.
 */
import { Cross2Icon } from '@radix-ui/react-icons';
import { RiEdit2Line, RiPencilRuler2Line } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

import { Notification5Fill } from '@/components/icons';
import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { CustomStepControls } from '@/components/workflow-editor/steps/controls/custom-step-controls';
import type { StepEditorProps } from '@/components/workflow-editor/steps/configure-step-template-form';

const tabsContentClassName = 'h-full w-full px-3 py-3.5 overflow-y-auto';

export const OtherStepTabs = ({ workflow, step }: StepEditorProps) => {
  const { dataSchema } = step.controls;
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="editor" className="flex h-full flex-1 flex-col">
      <header className="flex flex-row items-center gap-3 px-3 py-1.5">
        <div className="mr-auto flex items-center gap-2.5 text-sm font-medium">
          <RiEdit2Line className="size-4" />
          <span>Configure Template</span>
        </div>
        <TabsList className="w-min">
          <TabsTrigger value="editor" className="gap-1.5">
            <RiPencilRuler2Line className="size-5 p-0.5" />
            <span>Editor</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5" disabled>
            <Notification5Fill className="size-5 p-0.5" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>

        <Button
          variant="ghost"
          size="xs"
          className="size-6"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate('../', { relative: 'path' });
          }}
        >
          <Cross2Icon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </header>
      <Separator />
      <TabsContent value="editor" className={tabsContentClassName}>
        <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
      </TabsContent>
      <Separator />
    </Tabs>
  );
};
