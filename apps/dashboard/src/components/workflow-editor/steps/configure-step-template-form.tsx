import { flattenIssues } from '@/components/workflow-editor/step-utils';
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';
import { buildDefaultValues, buildDefaultValuesOfDataSchema, buildDynamicZodSchema } from '@/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { type StepDataDto, StepTypeEnum, UpdateWorkflowDto, type WorkflowResponseDto } from '@novu/shared';
import merge from 'lodash.merge';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { OtherStepTabs } from './other-steps-tabs';
import { Form } from '@/components/primitives/form/form';
import { useFormAutosave } from '@/hooks';

const STEP_TYPE_TO_EDITOR: Record<StepTypeEnum, (args: ConfigureStepTemplateFormProps) => React.JSX.Element | null> = {
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

export type ConfigureStepTemplateFormProps = StepEditorProps & {
  debouncedUpdate: (data: UpdateWorkflowDto) => void;
};
export const ConfigureStepTemplateForm = (props: ConfigureStepTemplateFormProps) => {
  const { workflow, step, debouncedUpdate } = props;

  const schema = useMemo(() => buildDynamicZodSchema(step.controls.dataSchema ?? {}), [step.controls.dataSchema]);

  const defaultValues = useMemo(() => {
    return calculateDefaultValues(step);
  }, []);

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(schema),
    shouldFocusError: true,
    defaultValues,
  });

  const setIssuesFromStep = (step: StepDataDto) => {
    const issues = flattenIssues(step.issues?.controls);
    Object.entries(issues).forEach(([key, value]) => {
      form.setError(key as string, { message: value }, { shouldFocus: true });
    });
  };

  useEffect(() => {
    form.reset(calculateDefaultValues(step));
    setIssuesFromStep(step);
  }, [step]);

  useFormAutosave(form, (data) => {
    debouncedUpdate({
      ...workflow,
      steps: workflow.steps.map((s) => {
        if (s._id === step._id) {
          return { ...s, controlValues: data };
        }
        return s;
      }),
    });
  });

  const Editor = STEP_TYPE_TO_EDITOR[step.type];
  return (
    <Form {...form}>
      <form className="flex h-full flex-col">
        <Editor workflow={workflow} step={step} debouncedUpdate={debouncedUpdate} />
      </form>
    </Form>
  );
};
