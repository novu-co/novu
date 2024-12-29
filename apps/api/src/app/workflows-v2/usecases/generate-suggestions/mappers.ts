import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { IWorkflowSuggestion } from '../../dtos/workflow-suggestion.interface';
import { IWorkflow, IWorkflowStep } from './types';

export function mapSuggestionToDto(suggestion: IWorkflow): IWorkflowSuggestion {
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
    body: step.body,
  };
}
