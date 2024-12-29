import { CreateWorkflowDto } from '@novu/shared';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'popular' | 'events' | 'authentication' | 'social';
  workflowDefinition: CreateWorkflowDto;
}
