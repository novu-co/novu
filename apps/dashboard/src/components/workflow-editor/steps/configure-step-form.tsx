import { zodResolver } from '@hookform/resolvers/zod';
import {
  FeatureFlagsKeysEnum,
  IEnvironment,
  StepDataDto,
  StepIssuesDto,
  StepTypeEnum,
  StepUpdateDto,
  UpdateWorkflowDto,
  WorkflowOriginEnum,
  WorkflowResponseDto,
} from '@novu/shared';
import { motion } from 'motion/react';
import { useEffect, useCallback, useMemo, useState, HTMLAttributes, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseFill, RiDeleteBin2Line, RiPencilRuler2Fill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';

import { ConfirmationModal } from '@/components/confirmation-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { CopyButton } from '@/components/primitives/copy-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent, SidebarFooter, SidebarHeader } from '@/components/side-navigation/sidebar';
import TruncatedText from '@/components/truncated-text';
import { buildStepSchema } from '@/components/workflow-editor/schema';
import {
  flattenIssues,
  getFirstBodyErrorMessage,
  getFirstControlsErrorMessage,
  updateStepInWorkflow,
} from '@/components/workflow-editor/step-utils';
import { SdkBanner } from '@/components/workflow-editor/steps/sdk-banner';
import { buildRoute, ROUTES } from '@/utils/routes';
import { INLINE_CONFIGURABLE_STEP_TYPES, TEMPLATE_CONFIGURABLE_STEP_TYPES } from '@/utils/constants';
import { STEP_NAME_BY_TYPE } from './step-provider';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { buildDefaultValuesOfDataSchema, buildDynamicZodSchema } from '@/utils/schema';
import { buildDefaultValues } from '@/utils/schema';
import merge from 'lodash.merge';
import { DelayControlValues } from '@/components/workflow-editor/steps/delay/delay-control-values';
import { ConfigureStepTemplateCta } from '@/components/workflow-editor/steps/configure-step-template-cta';
import { ConfigureInAppStepPreview } from '@/components/workflow-editor/steps/in-app/configure-in-app-step-preview';
import { ConfigureEmailStepPreview } from '@/components/workflow-editor/steps/email/configure-email-step-preview';
import { useFeatureFlag } from '@/hooks/use-feature-flag';

const STEP_TYPE_TO_INLINE_CONTROL_VALUES: Record<StepTypeEnum, () => React.JSX.Element | null> = {
  [StepTypeEnum.DELAY]: DelayControlValues,
  [StepTypeEnum.IN_APP]: () => null,
  [StepTypeEnum.EMAIL]: () => null,
  [StepTypeEnum.SMS]: () => null,
  [StepTypeEnum.CHAT]: () => null,
  [StepTypeEnum.PUSH]: () => null,
  [StepTypeEnum.CUSTOM]: () => null,
  [StepTypeEnum.TRIGGER]: () => null,
  [StepTypeEnum.DIGEST]: () => null,
};

const STEP_TYPE_TO_PREVIEW: Record<StepTypeEnum, (props: HTMLAttributes<HTMLDivElement>) => ReactNode> = {
  [StepTypeEnum.IN_APP]: ConfigureInAppStepPreview,
  [StepTypeEnum.EMAIL]: ConfigureEmailStepPreview,
  [StepTypeEnum.SMS]: () => null,
  [StepTypeEnum.CHAT]: () => null,
  [StepTypeEnum.PUSH]: () => null,
  [StepTypeEnum.CUSTOM]: () => null,
  [StepTypeEnum.TRIGGER]: () => null,
  [StepTypeEnum.DIGEST]: () => null,
  [StepTypeEnum.DELAY]: () => null,
};

const calculateDefaultControlsValues = (step: StepDataDto) => {
  if (Object.keys(step.controls.uiSchema ?? {}).length !== 0) {
    return merge(buildDefaultValues(step.controls.uiSchema ?? {}), step.controls.values);
  }

  return merge(buildDefaultValuesOfDataSchema(step.controls.dataSchema ?? {}), step.controls.values);
};

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
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const areNewStepsEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_ND_DELAY_DIGEST_EMAIL_ENABLED);

  // we allow some form of configuration in the dashboard
  let supportedStepTypes = [
    StepTypeEnum.IN_APP,
    StepTypeEnum.SMS,
    StepTypeEnum.CHAT,
    StepTypeEnum.PUSH,
    StepTypeEnum.EMAIL,
  ];

  if (areNewStepsEnabled) {
    supportedStepTypes = [...supportedStepTypes, StepTypeEnum.DIGEST, StepTypeEnum.DELAY];
  }

  const isSupportedStep = supportedStepTypes.includes(step.type);
  const isReadOnly = !isSupportedStep || workflow.origin === WorkflowOriginEnum.EXTERNAL;

  const isTemplateConfigurableStep = isSupportedStep && TEMPLATE_CONFIGURABLE_STEP_TYPES.includes(step.type);
  const isInlineConfigurableStep = isSupportedStep && INLINE_CONFIGURABLE_STEP_TYPES.includes(step.type);

  const onDeleteStep = () => {
    update({ ...workflow, steps: workflow.steps.filter((s) => s._id !== step._id) });
    navigate(buildRoute(ROUTES.EDIT_WORKFLOW, { environmentSlug: environment.slug!, workflowSlug: workflow.slug }));
  };

  const registerInlineControlValues = useMemo(() => {
    return (step: StepDataDto) => {
      if (isInlineConfigurableStep) {
        return {
          controlValues: calculateDefaultControlsValues(step),
        };
      }

      return {};
    };
  }, [isInlineConfigurableStep]);

  const controlsSchema = useMemo(
    () => (isInlineConfigurableStep ? buildDynamicZodSchema(step.controls.dataSchema ?? {}) : undefined),
    [step.controls.dataSchema, isInlineConfigurableStep]
  );

  const defaultValues = useMemo(
    () => ({
      name: step.name,
      stepId: step.stepId,
      ...registerInlineControlValues(step),
    }),
    [step, registerInlineControlValues]
  );

  const form = useForm({
    defaultValues,
    resolver: zodResolver(buildStepSchema(controlsSchema)),
    shouldFocusError: false,
  });

  const { onBlur } = useFormAutosave({
    previousData: defaultValues,
    form,
    isReadOnly,
    save: (data) => {
      // transform form fields to step update dto
      const updateStepData: Partial<StepUpdateDto> = {
        name: data.name,
        ...(data.controlValues ? { controlValues: data.controlValues } : {}),
      };
      update(updateStepInWorkflow(workflow, step.stepId, updateStepData));
      updateStepCache(updateStepData);
    },
  });

  const firstError = useMemo(
    () =>
      step.issues ? getFirstBodyErrorMessage(step.issues) || getFirstControlsErrorMessage(step.issues) : undefined,
    [step]
  );

  const setControlValuesIssues = useCallback(() => {
    const stepIssues = flattenIssues(issues?.controls);
    Object.entries(stepIssues).forEach(([key, value]) => {
      form.setError(`controlValues.${key}`, { message: value });
    });
  }, [form, issues]);

  useEffect(() => {
    setControlValuesIssues();
  }, [setControlValuesIssues]);

  const Preview = STEP_TYPE_TO_PREVIEW[step.type];
  const InlineControlValues = STEP_TYPE_TO_INLINE_CONTROL_VALUES[step.type];

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

            {isInlineConfigurableStep && (
              <>
                <Separator />
                <SidebarContent>
                  <InlineControlValues />
                </SidebarContent>
              </>
            )}
          </form>
        </Form>
        <Separator />

        {isTemplateConfigurableStep && (
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
            <ConfigureStepTemplateCta step={step} issue={firstError}>
              <Preview />
            </ConfigureStepTemplateCta>
          </>
        )}

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
