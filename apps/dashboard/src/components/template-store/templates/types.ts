import { CreateWorkflowDto } from '@novu/shared';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'events' | 'authentication' | 'social' | 'operational';
  isPopular?: boolean;
  workflowDefinition: CreateWorkflowDto;
}

export type IWorkflowSuggestion = WorkflowTemplate;
