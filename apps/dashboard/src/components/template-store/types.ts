import { ComponentProps } from 'react';
import { DialogTrigger } from '@/components/primitives/dialog';
import { IWorkflowSuggestion } from './templates';

export enum WorkflowMode {
  TEMPLATES = 'templates',
  GENERATE = 'generate',
  FROM_PROMPT = 'from_prompt',
}

export type WorkflowTemplateModalProps = ComponentProps<typeof DialogTrigger>;

export interface WorkflowGenerateProps {
  mode: WorkflowMode;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  handleSubmit: () => void;
  suggestions: IWorkflowSuggestion[];
}
