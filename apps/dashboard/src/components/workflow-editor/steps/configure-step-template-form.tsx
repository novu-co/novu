import { flattenIssues } from '@/components/workflow-editor/step-utils';
import { InAppTabs } from '@/components/workflow-editor/steps/in-app/in-app-tabs';
import { buildDefaultValues, buildDynamicZodSchema } from '@/utils/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { type StepDataDto, StepTypeEnum, UpdateWorkflowDto, type WorkflowResponseDto } from '@novu/shared';
import merge from 'lodash.merge';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { OtherStepTabs } from './other-steps-tabs';
import { Form } from '@/components/primitives/form/form';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { FlashFormUpdatesContext } from './flush-form-updates-context';

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

export type StepEditorProps = {
  workflow: WorkflowResponseDto;
  step: StepDataDto;
};

type ConfigureStepTemplateFormProps = StepEditorProps & {
  update: (data: UpdateWorkflowDto) => void;
};

export const ConfigureStepTemplateForm = (props: ConfigureStepTemplateFormProps) => {
  const { workflow, step, update } = props;
  const schema = useMemo(() => buildDynamicZodSchema(step.controls.dataSchema ?? {}), [step.controls.dataSchema]);
  const defaultValues = useMemo(
    () => merge(buildDefaultValues(step.controls.uiSchema ?? {}), step.controls.values),
    [step]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    shouldFocusError: false,
  });

  const { onBlur, flushFormUpdates } = useFormAutosave({
    previousData: defaultValues,
    form,
    save: (data) => {
      update({
        ...workflow,
        steps: workflow.steps.map((s) => {
          if (s._id === step._id) {
            return { ...s, controlValues: data };
          }
          return s;
        }),
      });
    },
  });

  const setIssuesFromStep = useCallback(
    (step: StepDataDto) => {
      const issues = flattenIssues(step.issues?.controls);
      Object.entries(issues).forEach(([key, value]) => {
        form.setError(key as string, { message: value });
      });
    },
    [form]
  );

  useEffect(() => {
    form.reset(merge(buildDefaultValues(step.controls.uiSchema ?? {}), step?.controls.values));
    setIssuesFromStep(step);
  }, [form, step, setIssuesFromStep]);

  const Editor = STEP_TYPE_TO_EDITOR[step.type];

  const value = useMemo(() => ({ flushFormUpdates }), [flushFormUpdates]);

  return (
    <Form {...form}>
      <form className="flex h-full flex-col" onBlur={onBlur}>
        <FlashFormUpdatesContext.Provider value={value}>
          <Editor workflow={workflow} step={step} />
        </FlashFormUpdatesContext.Provider>
      </form>
    </Form>
  );
};
