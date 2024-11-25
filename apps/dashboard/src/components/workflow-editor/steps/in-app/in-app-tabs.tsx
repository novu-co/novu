import { zodResolver } from '@hookform/resolvers/zod';
import { ChannelTypeEnum, type StepDataDto, type StepUpdateDto, type WorkflowResponseDto } from '@novu/shared';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { RiEdit2Line, RiPencilRuler2Line } from 'react-icons/ri';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';
import merge from 'lodash.merge';

import { Notification5Fill } from '@/components/icons';
import { Button } from '@/components/primitives/button';
import { Form } from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import { ToastIcon } from '@/components/primitives/sonner';
import { showToast } from '@/components/primitives/sonner-helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { UnsavedChangesAlertDialog } from '@/components/unsaved-changes-alert-dialog';
import { InAppEditor } from '@/components/workflow-editor/steps/in-app/in-app-editor';
import { InAppEditorPreview } from '@/components/workflow-editor/steps/in-app/in-app-editor-preview';
import useDebouncedEffect from '@/hooks/use-debounced-effect';
import { usePreviewStep } from '@/hooks/use-preview-step';
import { useUpdateWorkflow } from '@/hooks/use-update-workflow';
import { buildDefaultValues, buildDynamicZodSchema } from '@/utils/schema';
import { useWorkflowEditorContext } from '../../hooks';
import { flattenIssues } from '../../step-utils';
import { CustomStepControls } from '../controls/custom-step-controls';
import { useStep } from '../use-step';
import { useStepEditorContext } from '@/components/workflow-editor/steps/hooks';
import { NovuApiError } from '@/api/api.client';

const tabsContentClassName = 'h-full w-full px-3 py-3.5 overflow-y-auto';

export const InAppTabs = ({ workflow, step }: { workflow: WorkflowResponseDto; step: StepDataDto }) => {
  const navigate = useNavigate();
  const { stepSlug = '', workflowSlug = '' } = useParams<{ workflowSlug: string; stepSlug: string }>();
  const { resetWorkflowForm } = useWorkflowEditorContext();
  const { refetch: refetchStep } = useStepEditorContext();
  const { step: workflowStep } = useStep();

  const { dataSchema, uiSchema, values } = step.controls;
  const schema = useMemo(() => buildDynamicZodSchema(dataSchema ?? {}), [dataSchema]);
  const newFormValues = useMemo(() => merge(buildDefaultValues(uiSchema ?? {}), values), [uiSchema, values]);

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
    values: newFormValues,
    shouldFocusError: true,
  });
  const [editorValue, setEditorValue] = useState('{}');
  const { formState, setError } = form;

  const controlErrors = useMemo(() => flattenIssues(workflowStep?.issues?.controls), [workflowStep]);

  useEffect(() => {
    if (Object.keys(controlErrors).length) {
      Object.entries(controlErrors).forEach(([key, value]) => {
        setError(key as string, { message: value }, { shouldFocus: true });
      });
    }
  }, [controlErrors, setError]);

  const { previewStep, data: previewData, isPending: isPreviewPending } = usePreviewStep();
  const { isPending, updateWorkflow } = useUpdateWorkflow({
    onSuccess: (data) => {
      resetWorkflowForm(data);
      refetchStep();
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
    const updatedValues = Object.keys(formState.dirtyFields).reduce(
      (acc, key) => {
        acc[key] = data[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

    await updateWorkflow({
      id: workflow._id,
      workflow: {
        ...workflow,
        steps: workflow.steps.map((step) =>
          step.slug === stepSlug
            ? ({
                ...step,
                controlValues: { ...values, ...updatedValues },
                issues: undefined,
              } as StepUpdateDto)
            : step
        ),
      },
    });
  };

  const preview = async (props: {
    controlValues: Record<string, unknown>;
    previewPayload: Record<string, unknown>;
  }) => {
    try {
      const res = await previewStep({
        workflowSlug,
        stepSlug,
        data: { controlValues: props.controlValues, previewPayload: props.previewPayload },
      });
      setEditorValue(JSON.stringify(res.previewPayloadExample, null, 2));
    } catch (err) {
      if (err instanceof NovuApiError) {
        showToast({
          children: () => (
            <>
              <ToastIcon variant="error" />
              <span className="text-sm">Failed to preview, Error: ${err.message}</span>
            </>
          ),
          options: {
            position: 'bottom-right',
            classNames: {
              toast: 'ml-10 mb-4',
            },
          },
        });
      }
    }
  };

  const formValues = useWatch(form);
  useDebouncedEffect(
    () => {
      preview({
        controlValues: form.getValues() as Record<string, unknown>,
        /**
         * Reset the preview payload to an empty object on form change
         * to prevent showing the previous payload
         */
        previewPayload: {},
      });
    },
    2000,
    [formValues]
  );

  const blocker = useBlocker(formState.isDirty || isPending);

  return (
    <>
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
                <TabsTrigger value="preview" className="gap-1.5">
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
              <InAppEditor uiSchema={uiSchema} />
              <CustomStepControls dataSchema={dataSchema} origin={workflow.origin} />
            </TabsContent>
            <TabsContent value="preview" className={tabsContentClassName}>
              {previewData === undefined ||
                (previewData.result?.type === ChannelTypeEnum.IN_APP && (
                  <InAppEditorPreview
                    value={editorValue}
                    onChange={setEditorValue}
                    preview={previewData?.result.preview}
                    isPreviewPending={isPreviewPending}
                    applyPreview={() => {
                      previewStep({
                        stepSlug,
                        workflowSlug,
                        data: {
                          controlValues: form.getValues() as FieldValues,
                          previewPayload: JSON.parse(editorValue),
                        },
                      });
                    }}
                  />
                ))}
            </TabsContent>
            <Separator />
            <footer className="flex justify-end px-3 py-3.5">
              <Button
                className="ml-auto"
                variant="default"
                type="submit"
                form="save-step"
                disabled={!formState.isDirty}
              >
                Save step
              </Button>
            </footer>
          </Tabs>
        </form>
      </Form>

      <UnsavedChangesAlertDialog
        blocker={blocker}
        description="This editor form has some unsaved changes. Save progress before you leave."
      />
    </>
  );
};
