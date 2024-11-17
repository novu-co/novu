import { createContext } from 'react';
import { WorkflowResponseDto } from '@novu/shared';
import type { StepTypeEnum } from '@/utils/enums';

export type WorkflowEditorContextType = {
  isPendingWorkflow: boolean;
  workflow?: WorkflowResponseDto;
  isReadOnly: boolean;
  addStep: (channelType: StepTypeEnum, stepIndex?: number) => void;
  deleteStep: (stepSlug: string) => void;
  resetWorkflowForm: (workflow: WorkflowResponseDto) => void;
};

export const WorkflowEditorContext = createContext<WorkflowEditorContextType>({} as WorkflowEditorContextType);
