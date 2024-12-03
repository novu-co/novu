import { zodResolver } from '@hookform/resolvers/zod';
import {
  IEnvironment,
  StepDataDto,
  StepIssuesDto,
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
import {
  INLINE_CONFIGURABLE_STEP_TYPES,
  TEMPLATE_CONFIGURABLE_STEP_TYPES,
  UNSUPPORTED_STEP_TYPES,
} from '@/utils/constants';
import { STEP_NAME_BY_TYPE } from './step-provider';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { ConfigureStepInlineForm } from '@/components/workflow-editor/steps/configure-inline/configure-step-inline-form';

type ConfigureStepFormProps = {
  workflow: WorkflowResponseDto;
  environment: IEnvironment;
  step: StepDataDto;
  issues?: StepIssuesDto;
  update: (data: UpdateWorkflowDto) => void;
  updateStepCache: (step: Partial<StepDataDto>) => void;
};

export const ConfigureStepForm = (props: ConfigureStepFormProps) => {
  const { step, workflow, update, updateStepCache, environment, issues } = props;

  const isSupportedStep = !UNSUPPORTED_STEP_TYPES.includes(step.type);
  const isReadOnly = !isSupportedStep || workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const isTemplateConfigurableStep = isSupportedStep && TEMPLATE_CONFIGURABLE_STEP_TYPES.includes(step.type);
  const isInlineConfigurableStep = isSupportedStep && INLINE_CONFIGURABLE_STEP_TYPES.includes(step.type);

  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDeleteStep = () => {
    update({ ...workflow, steps: workflow.steps.filter((s) => s._id !== step._id) });
    navigate(buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug: environment.slug!, workflowSlug: workflow.slug }));
  };

  const form = useForm<z.infer<typeof stepSchema>>({
    defaultValues: {
      name: step.name,
      stepId: step.stepId,
    },
    resolver: zodResolver(stepSchema),
    shouldFocusError: false,
  });

  const { onBlur } = useFormAutosave({
    previousData: step,
    form,
    isReadOnly,
    save: (data) => {
      update(updateStepInWorkflow(workflow, data));
      updateStepCache(data);
    },
  });

  const firstError = useMemo(
    () =>
      step.issues ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined,
    [step]
  );

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
                        <Input placeholder="Untitled" {...field} disabled={isReadOnly} />
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

        {isInlineConfigurableStep && (
          <InlineConfigurableStep
            workflow={workflow}
            step={step}
            issues={issues}
            update={update}
            updateStepCache={updateStepCache}
          />
        )}

        {isTemplateConfigurableStep && <TemplateConfigurableStep step={step} firstError={firstError} />}

        {!isSupportedStep && (
          <>
            <SidebarContent>
              <SdkBanner />
            </SidebarContent>
          </>
        )}

        {!isReadOnly && (
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

const TemplateConfigurableStep = ({ step, firstError }: { step: StepDataDto; firstError: string | undefined }) => (
  <>
    <SidebarContent>
      <Link to={'./edit'} relative="path" state={{ stepType: step.type }}>
        <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
          <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
          Configure {STEP_NAME_BY_TYPE[step.type]} template{' '}
          <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
        </Button>
      </Link>
    </SidebarContent>
    <Separator />
    <ConfigureInAppStepTemplateCta step={step} issue={firstError} />
  </>
);

const InlineConfigurableStep = ({
  workflow,
  step,
  issues,
  update,
  updateStepCache,
}: {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
  issues?: StepIssuesDto;
  update: (data: UpdateWorkflowDto) => void;
  updateStepCache: (step: Partial<StepDataDto>) => void;
}) => {
  return (
    <>
      <SidebarContent>
        <ConfigureStepInlineForm
          workflow={workflow}
          step={step}
          issues={issues}
          update={update}
          updateStepCache={updateStepCache}
        />
      </SidebarContent>
      <Separator />
    </>
  );
};
