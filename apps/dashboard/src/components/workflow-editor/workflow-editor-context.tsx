import { createContext } from 'react';
import { WorkflowResponseDto } from '@novu/shared';
import type { StepTypeEnum } from '@/utils/enums';

export type WorkflowEditorContextType = {
  addStep: (channelType: StepTypeEnum, stepIndex?: number) => void;
  deleteStep: (stepSlug: string) => void;
  isReadOnly: boolean;
  resetWorkflowForm: (workflow: WorkflowResponseDto) => void;
};

export const WorkflowEditorContext = createContext<WorkflowEditorContextType>({} as WorkflowEditorContextType);
