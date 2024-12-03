import { useCallback, useEffect, useMemo } from 'react';
import merge from 'lodash.merge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type StepDataDto,
  StepIssuesDto,
  StepTypeEnum,
  UpdateWorkflowDto,
  type WorkflowResponseDto,
} from '@novu/shared';

import { flattenIssues, updateStepControlValuesInWorkflow } from '@/components/workflow-editor/step-utils';
import { buildDefaultValues, buildDefaultValuesOfDataSchema, buildDynamicZodSchema } from '@/utils/schema';
import { Form } from '@/components/primitives/form/form';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { SaveFormContext } from '@/components/workflow-editor/steps/save-form-context';
import { DelayForm } from '@/components/workflow-editor/steps/delay/delay-form';

const STEP_TYPE_TO_INLINE_FORM: Record<StepTypeEnum, (args: StepInlineFormProps) => React.JSX.Element | null> = {
  [StepTypeEnum.DELAY]: DelayForm,
  [StepTypeEnum.IN_APP]: () => null,
  [StepTypeEnum.EMAIL]: () => null,
  [StepTypeEnum.SMS]: () => null,
  [StepTypeEnum.CHAT]: () => null,
  [StepTypeEnum.PUSH]: () => null,
  [StepTypeEnum.CUSTOM]: () => null,
  [StepTypeEnum.TRIGGER]: () => null,
  [StepTypeEnum.DIGEST]: () => null,
};

// Use the UI Schema to build the default values if it exists else use the data schema (code-first approach) values
const calculateDefaultValues = (step: StepDataDto) => {
  if (Object.keys(step.controls.uiSchema ?? {}).length !== 0) {
    return merge(buildDefaultValues(step.controls.uiSchema ?? {}), step.controls.values);
  }

  return merge(buildDefaultValuesOfDataSchema(step.controls.dataSchema ?? {}), step.controls.values);
};

export type StepInlineFormProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
};

type ConfigureStepInlineFormProps = StepInlineFormProps & {
  issues?: StepIssuesDto;
  update: (data: UpdateWorkflowDto) => void;
};

export const ConfigureStepInlineForm = (props: ConfigureStepInlineFormProps) => {
  const { workflow, step, issues, update } = props;
  const schema = useMemo(() => buildDynamicZodSchema(step.controls.dataSchema ?? {}), [step.controls.dataSchema]);

  const defaultValues = useMemo(() => {
    return {
      ...calculateDefaultValues(step),
      ...step.controls.values,
    };
  }, [step]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    values: defaultValues,
    shouldFocusError: false,
  });

  const { onBlur, saveForm } = useFormAutosave({
    previousData: defaultValues,
    form,
    save: (data) => {
      update(updateStepControlValuesInWorkflow(workflow, step, data));
    },
  });

  const setIssuesFromStep = useCallback(() => {
    const stepIssues = flattenIssues(issues?.controls);
    Object.entries(stepIssues).forEach(([key, value]) => {
      form.setError(key as string, { message: value });
    });
  }, [form, issues]);

  useEffect(() => {
    setIssuesFromStep();
  }, [setIssuesFromStep, issues]);

  const InlineForm = STEP_TYPE_TO_INLINE_FORM[step.type];

  const value = useMemo(() => ({ saveForm }), [saveForm]);

  return (
    <Form {...form}>
      <form className="flex h-full flex-col" onBlur={onBlur}>
        <SaveFormContext.Provider value={value}>
          <InlineForm workflow={workflow} step={step} />
        </SaveFormContext.Provider>
      </form>
    </Form>
  );
};
