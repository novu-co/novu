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
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';
import { buildDefaultValues, buildDefaultValuesOfDataSchema, buildDynamicZodSchema } from '@/utils/schema';
import { OtherStepTabs } from './other-steps-tabs';
import { Form } from '@/components/primitives/form/form';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { SaveFormContext } from '@/components/workflow-editor/steps/save-form-context';

const STEP_TYPE_TO_EDITOR: Record<StepTypeEnum, (args: StepEditorProps) => React.JSX.Element | null> = {
  [StepTypeEnum.EMAIL]: OtherStepTabs,
  [StepTypeEnum.CHAT]: OtherStepTabs,
  [StepTypeEnum.IN_APP]: InAppTabs,
  [StepTypeEnum.SMS]: OtherStepTabs,
  [StepTypeEnum.PUSH]: OtherStepTabs,
  [StepTypeEnum.DIGEST]: () => null,
  [StepTypeEnum.DELAY]: () => null,
  [StepTypeEnum.TRIGGER]: () => null,
  [StepTypeEnum.CUSTOM]: () => null,
};

// Use the UI Schema to build the default values if it exists else use the data schema (code-first approach) values
const calculateDefaultValues = (step: StepDataDto) => {
  if (Object.keys(step.controls.uiSchema ?? {}).length !== 0) {
    return merge(buildDefaultValues(step.controls.uiSchema ?? {}), step.controls.values);
  }

  return merge(buildDefaultValuesOfDataSchema(step.controls.dataSchema ?? {}), step.controls.values);
};

export type StepEditorProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
};

type ConfigureStepTemplateFormProps = StepEditorProps & {
  issues?: StepIssuesDto;
  update: (data: UpdateWorkflowDto) => void;
};

export const ConfigureStepTemplateForm = (props: ConfigureStepTemplateFormProps) => {
  const { workflow, step, issues, update } = props;
  const schema = useMemo(() => buildDynamicZodSchema(step.controls.dataSchema ?? {}), [step.controls.dataSchema]);

  const defaultValues = useMemo(() => {
    return calculateDefaultValues(step);
  }, [step]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
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
  }, [setIssuesFromStep]);

  const Editor = STEP_TYPE_TO_EDITOR[step.type];

  const value = useMemo(() => ({ saveForm }), [saveForm]);

  return (
    <Form {...form}>
      <form className="flex h-full flex-col" onBlur={onBlur}>
        <SaveFormContext.Provider value={value}>
          <Editor workflow={workflow} step={step} />
        </SaveFormContext.Provider>
      </form>
    </Form>
  );
};
