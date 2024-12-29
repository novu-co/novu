import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';

interface IWorkflowStep {
  name: string;
  type: StepTypeEnum;
  subject?: string;
  body?: string | Record<string, any>;
  metadata?: {
    amount?: number;
    unit?: 'seconds' | 'minutes' | 'hours' | 'days';
    type?: 'regular' | 'scheduled';
  };
}

interface IGeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'popular' | 'events' | 'authentication' | 'social';
  steps: IWorkflowStep[];
}

export function mapSuggestionToDto(suggestion: IGeneratedWorkflow): IWorkflowSuggestion {
  const { id, name, description, category, steps } = suggestion;

  return {
    id,
    name,
    description,
    category,
    workflowDefinition: {
      name,
      description,
      workflowId: id,
      __source: WorkflowCreationSourceEnum.TEMPLATE_STORE,
      steps: steps.map(mapStepToDto),
    },
  };
}

function mapStepToDto(step: IWorkflowStep) {
  return {
    name: step.name,
    type: step.type,
    controlValues: step.type === StepTypeEnum.DELAY ? mapDelayStep(step) : mapContentStep(step),
  };
}

function mapDelayStep(step: IWorkflowStep) {
  return {
    amount: step.metadata?.amount,
    unit: step.metadata?.unit,
    type: step.metadata?.type || 'regular',
  };
}

function mapContentStep(step: IWorkflowStep) {
  return {
    subject: step.subject,
    body: step.type === StepTypeEnum.EMAIL ? JSON.stringify(step.body) : step.body,
  };
}
