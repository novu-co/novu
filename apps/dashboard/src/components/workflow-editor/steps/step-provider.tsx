import { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useFetchStep } from '@/hooks/use-fetch-step';
import { StepDataDto, StepIssuesDto, StepTypeEnum } from '@novu/shared';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { createContextHook } from '@/utils/context';
import { Step } from '@/utils/types';
import { STEP_DIVIDER, getEncodedId } from '@/utils/step';

export type StepEditorContextType = {
  isPending: boolean;
  step?: StepDataDto;
  issues?: StepIssuesDto;
  refetch: (options?: RefetchOptions) => Promise<QueryObserverResult<StepDataDto, Error>>;
};

export const StepContext = createContext<StepEditorContextType>({} as StepEditorContextType);

export const StepProvider = ({ children }: { children: ReactNode }) => {
  const { workflow } = useWorkflow();
  const { stepSlug = '' } = useParams<{
    workflowSlug: string;
    stepSlug: string;
  }>();
  const { step, isPending, refetch } = useFetchStep({
    workflowSlug: workflow?.slug,
    stepSlug,
  });

  /**
   * We need to get the issues from the workflow response
   * because the step is not refetched when workflow is updated
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

  const value = useMemo(() => ({ isPending, step, issues, refetch }), [isPending, step, issues, refetch]);

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
