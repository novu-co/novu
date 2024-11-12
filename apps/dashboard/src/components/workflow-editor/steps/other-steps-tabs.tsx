/**
 * This component is used as a placeholder for the other step configuration until the actual configuration is implemented.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { type StepDataDto, type WorkflowResponseDto } from '@novu/shared';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { RiEdit2Line, RiPencilRuler2Line } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';

import { Notification5Fill } from '@/components/icons';
import { Button } from '@/components/primitives/button';
import { Form } from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { useUpdateWorkflow } from '@/hooks/use-update-workflow';
import { buildDefaultValues, buildDynamicZodSchema } from '@/utils/schema';
import { CustomStepControls } from './controls/custom-step-controls';

const tabsContentClassName = 'h-full w-full px-3 py-3.5';

export const OtherStepTabs = ({ workflow, step }: { workflow: WorkflowResponseDto; step: StepDataDto }) => {
  const { stepSlug = '' } = useParams<{ workflowSlug: string; stepSlug: string }>();
  const { dataSchema, uiSchema } = step.controls;
  const navigate = useNavigate();
  const schema = buildDynamicZodSchema(dataSchema ?? {});
  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    resetOptions: { keepDirtyValues: true },
    defaultValues: buildDefaultValues(uiSchema ?? {}),
    values: step.controls.values,
  });

  const { reset, formState } = form;

  const { updateWorkflow } = useUpdateWorkflow({
    onSuccess: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Saved</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          classNames: {
            toast: 'ml-10 mb-4',
          },
        },
      });
    },
    onError: () => {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to save</span>
          </>
        ),
        options: {
          position: 'bottom-right',
          classNames: {
            toast: 'ml-10 mb-4',
          },
        },
      });
    },
  });

  const onSubmit = async (data: any) => {
    await updateWorkflow({
      id: workflow._id,
      workflow: {
        ...workflow,
        steps: workflow.steps.map((step) => (step.slug === stepSlug ? { ...step, controlValues: { ...data } } : step)),
      },
    });
    reset({ ...data });
  };

  return (
    <Form {...form}>
      <form
        id="save-step"
        className="flex h-full flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit(onSubmit)(event);
        }}
      >
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
          <footer className="flex justify-end px-3 py-3.5">
            <Button className="ml-auto" variant="default" type="submit" form="save-step" disabled={!formState.isDirty}>
              Save step
            </Button>
          </footer>
        </Tabs>
      </form>
    </Form>
  );
};
