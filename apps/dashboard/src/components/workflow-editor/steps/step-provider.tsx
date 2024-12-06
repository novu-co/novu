import { createContext, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { useFetchStep } from '@/hooks/use-fetch-step';
import { StepDataDto, StepIssuesDto, StepTypeEnum } from '@novu/shared';
import { createContextHook } from '@/utils/context';
import { Step } from '@/utils/types';
import { STEP_DIVIDER } from '@/utils/step';
import { getEncodedId } from '@/utils/step';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';

export type StepEditorContextType = {
  isPending: boolean;
  step?: StepDataDto;
  issues?: StepIssuesDto;
  updateStepCache: (step: Partial<StepDataDto>) => void;
};

export const StepContext = createContext<StepEditorContextType>({} as StepEditorContextType);

export const StepProvider = ({ children }: { children: ReactNode }) => {
  const { workflow } = useWorkflow();
  const { stepSlug = '', workflowSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const { step, isPending, updateStepCache } = useFetchStep({
    workflowSlug,
    stepSlug,
  });

  /**
   * We need to get the issues from the workflow response
   * because the step is not re-fetched when workflow is updated
   *
   * TODO:
   * 1. add all step data to workflow response
   * 2. remove StepProvider and keep just the WorkflowProvider with step value
   */
  const issues = useMemo(() => {
    const newIssues = workflow?.steps.find(
      (s) =>
        getEncodedId({ slug: s.slug, divider: STEP_DIVIDER }) ===
        getEncodedId({ slug: stepSlug, divider: STEP_DIVIDER })
    )?.issues;

    return { ...newIssues };
  }, [workflow, stepSlug]);

  const value = useMemo(
    () => ({ isPending, step, issues, updateStepCache }),
    [isPending, step, issues, updateStepCache]
  );

  return <StepContext.Provider value={value}>{children}</StepContext.Provider>;
};

export const useStep = createContextHook(StepContext);

export const STEP_NAME_BY_TYPE: Record<StepTypeEnum, string> = {
  email: 'Email Step',
  chat: 'Chat Step',
  in_app: 'In-App Step',
  sms: 'SMS Step',
  push: 'Push Step',
  digest: 'Digest Step',
  delay: 'Delay Step',
  trigger: 'Trigger Step',
  custom: 'Custom Step',
};

export const createStep = (type: StepTypeEnum): Step => ({
  name: STEP_NAME_BY_TYPE[type],
  stepId: '',
  slug: '_st_',
  type,
  _id: crypto.randomUUID(),
});
