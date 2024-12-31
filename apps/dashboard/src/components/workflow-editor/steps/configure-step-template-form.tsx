import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  type StepDataDto,
  StepTypeEnum,
  StepUpdateDto,
  UpdateWorkflowDto,
  type WorkflowResponseDto,
} from '@novu/shared';

import { flattenIssues, updateStepInWorkflow } from '@/components/workflow-editor/step-utils';
import { Form } from '@/components/primitives/form/form';
import { EmailTabs } from '@/components/workflow-editor/steps/email/email-tabs';
import { getStepDefaultValues } from '@/components/workflow-editor/step-default-values';
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';
import { PushTabs } from '@/components/workflow-editor/steps/push/push-tabs';
import { SaveFormContext } from '@/components/workflow-editor/steps/save-form-context';
import { SmsTabs } from '@/components/workflow-editor/steps/sms/sms-tabs';
import { ChatTabs } from '@/components/workflow-editor/steps/chat/chat-tabs';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { CommonCustomControlValues } from '@/components/workflow-editor/steps/common/common-custom-control-values';

const STEP_TYPE_TO_TEMPLATE_FORM: Record<StepTypeEnum, (args: StepEditorProps) => React.JSX.Element | null> = {
  [StepTypeEnum.EMAIL]: EmailTabs,
  [StepTypeEnum.CHAT]: ChatTabs,
  [StepTypeEnum.IN_APP]: InAppTabs,
  [StepTypeEnum.SMS]: SmsTabs,
  [StepTypeEnum.PUSH]: PushTabs,
  [StepTypeEnum.DIGEST]: CommonCustomControlValues,
  [StepTypeEnum.DELAY]: CommonCustomControlValues,
  [StepTypeEnum.TRIGGER]: () => null,
  [StepTypeEnum.CUSTOM]: () => null,
};

export type StepEditorProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
};

type ConfigureStepTemplateFormProps = StepEditorProps & {
  update: (data: UpdateWorkflowDto) => void;
};

export const ConfigureStepTemplateForm = (props: ConfigureStepTemplateFormProps) => {
  const { workflow, step, update } = props;

  const defaultValues = useMemo(() => getStepDefaultValues(step), [step]);

  const form = useForm({
    defaultValues,
    shouldFocusError: false,
  });

  const { onBlur, saveForm } = useFormAutosave({
    previousData: defaultValues,
    form,
    save: (data) => {
      const updateStepData: Partial<StepUpdateDto> = {
        controlValues: data,
      };
      update(updateStepInWorkflow(workflow, step.stepId, updateStepData));
    },
  });

  const setIssuesFromStep = useCallback(() => {
    const stepIssues = flattenIssues(step.issues?.controls);
    const currentErrors = form.formState.errors;

    // Clear errors that are not in stepIssues
    Object.keys(currentErrors).forEach((key) => {
      if (!stepIssues[key]) {
        form.clearErrors(key);
      }
    });

    // Set new errors from stepIssues
    Object.entries(stepIssues).forEach(([key, value]) => {
      form.setError(key as string, { message: value });
    });
  }, [form, step]);

  useEffect(() => {
    setIssuesFromStep();
  }, [setIssuesFromStep]);

  const TemplateForm = STEP_TYPE_TO_TEMPLATE_FORM[step.type];

  const value = useMemo(() => ({ saveForm }), [saveForm]);

  return (
    <Form {...form}>
      <form className="flex h-full flex-col" onBlur={onBlur}>
        <SaveFormContext.Provider value={value}>
          <TemplateForm workflow={workflow} step={step} />
        </SaveFormContext.Provider>
      </form>
    </Form>
  );
};
