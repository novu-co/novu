import { zodResolver } from '@hookform/resolvers/zod';
import {
  IEnvironment,
  StepDataDto,
  StepTypeEnum,
  UpdateWorkflowDto,
  WorkflowOriginEnum,
  WorkflowResponseDto,
} from '@novu/shared';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseFill, RiDeleteBin2Line, RiPencilRuler2Fill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { ConfirmationModal } from '@/components/confirmation-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { CopyButton } from '@/components/primitives/copy-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent, SidebarFooter, SidebarHeader } from '@/components/side-navigation/sidebar';
import TruncatedText from '@/components/truncated-text';
import { stepSchema } from '@/components/workflow-editor/schema';
import {
  getFirstBodyErrorMessage,
  getFirstControlsErrorMessage,
  updateStepInWorkflow,
} from '@/components/workflow-editor/step-utils';
import { ConfigureInAppStepTemplateCta } from '@/components/workflow-editor/steps/in-app/configure-in-app-step-template-cta';
import { SdkBanner } from '@/components/workflow-editor/steps/sdk-banner';
import { buildRoute, ROUTES } from '@/utils/routes';
import { EXCLUDED_EDITOR_TYPES } from '@/utils/constants';
import { STEP_NAME_BY_TYPE } from './step-provider';
import { useFormAutosave } from '@/hooks/use-form-autosave';

const SUPPORTED_STEP_TYPES = [StepTypeEnum.IN_APP];

type ConfigureStepFormProps = {
  workflow: WorkflowResponseDto;
  environment: IEnvironment;
  step: StepDataDto;
  update: (data: UpdateWorkflowDto) => void;
  updateStepCache: (step: Partial<StepDataDto>) => void;
};

export const ConfigureStepForm = (props: ConfigureStepFormProps) => {
  const { step, workflow, update, updateStepCache, environment } = props;
  const navigate = useNavigate();
  const isCodeCreatedWorkflow = workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteStep = () => {
    update({ ...workflow, steps: workflow.steps.filter((s) => s._id !== step._id) });
    navigate(buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug: environment.slug!, workflowSlug: workflow.slug }));
  };

  const defaultValues = {
    name: step.name,
    stepId: step.stepId,
  };

  const form = useForm<z.infer<typeof stepSchema>>({
    defaultValues,
    resolver: zodResolver(stepSchema),
    shouldFocusError: false,
  });

  const { onBlur } = useFormAutosave({
    previousData: step,
    form,
    isReadOnly: isCodeCreatedWorkflow,
    save: (data) => {
      update(updateStepInWorkflow(workflow, data));
      updateStepCache(data);
    },
  });

  const firstError = useMemo(
    () => (step ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined),
    [step]
  );

  const isDashboardStepThatSupportsEditor = !isCodeCreatedWorkflow && SUPPORTED_STEP_TYPES.includes(step.type);
  const isCodeStepThatSupportsEditor = isCodeCreatedWorkflow && !EXCLUDED_EDITOR_TYPES.includes(step.type);
  const isStepSupportsEditor = isDashboardStepThatSupportsEditor || isCodeStepThatSupportsEditor;

  return (
    <>
      <PageMeta title={`Configure ${step.name}`} />
      <motion.div
        className="flex h-full w-full flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.1 }}
        transition={{ duration: 0.1 }}
      >
        <SidebarHeader className="flex items-center gap-2.5 text-sm font-medium">
          <Link
            to={buildRoute(ROUTES.EDIT_WORKFLOW, {
              environmentSlug: environment.slug!,
              workflowSlug: workflow.slug,
            })}
            className="flex items-center"
          >
            <Button variant="link" size="icon" className="size-4" type="button">
              <RiArrowLeftSLine />
            </Button>
          </Link>
          <span>Configure Step</span>
          <Link
            to={buildRoute(ROUTES.EDIT_WORKFLOW, {
              environmentSlug: environment.slug!,
              workflowSlug: workflow.slug,
            })}
            className="ml-auto flex items-center"
          >
            <Button variant="link" size="icon" className="size-4" type="button">
              <RiCloseFill />
            </Button>
          </Link>
        </SidebarHeader>

        <Separator />

        <Form {...form}>
          <form onBlur={onBlur}>
            <SidebarContent>
              <FormField
                control={form.control}
                name={'name'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <InputField>
                        <Input placeholder="Untitled" {...field} disabled={isCodeCreatedWorkflow} />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'stepId'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <InputField className="flex overflow-hidden pr-0">
                        <Input placeholder="Untitled" className="cursor-default" {...field} readOnly />
                        <CopyButton valueToCopy={field.value} size="input-right" />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SidebarContent>
          </form>
        </Form>
        <Separator />

        {isStepSupportsEditor && (
          <>
            <SidebarContent>
              <Link to={'./edit'} relative="path" state={{ stepType: step.type }}>
                <Button
                  variant="outline"
                  className="flex w-full justify-start gap-1.5 text-xs font-medium"
                  type="button"
                >
                  <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
                  Configure {STEP_NAME_BY_TYPE[step.type]} template{' '}
                  <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
                </Button>
              </Link>
            </SidebarContent>
            <Separator />
          </>
        )}

        {step.type === StepTypeEnum.IN_APP && <ConfigureInAppStepTemplateCta step={step} issue={firstError} />}

        {!isCodeCreatedWorkflow && !SUPPORTED_STEP_TYPES.includes(step.type) && (
          <>
            <SidebarContent>
              <SdkBanner />
            </SidebarContent>
          </>
        )}

        {!isCodeCreatedWorkflow && (
          <>
            <SidebarFooter>
              <Separator />
              <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                onConfirm={onDeleteStep}
                title="Proceeding will delete the step"
                description={
                  <>
                    You're about to delete the{' '}
                    <TruncatedText className="max-w-[32ch] font-bold">{step.name}</TruncatedText> step, this action is
                    permanent.
                  </>
                }
                confirmButtonText="Delete"
              />
              <Button
                variant="ghostDestructive"
                className="gap-1.5 text-xs"
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <RiDeleteBin2Line className="size-4" />
                Delete step
              </Button>
            </SidebarFooter>
          </>
        )}
      </motion.div>
    </>
  );
};
