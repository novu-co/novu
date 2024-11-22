import {
  type PreferencesRequestDto,
  type StepCreateDto,
  type StepUpdateDto,
  type WorkflowCommonsFields,
} from './workflow-commons-fields';

export type UpdateWorkflowDto = WorkflowCommonsFields & {
  /**
   * We allow to update workflow id only for code first workflows
   */
  workflowId?: string;

  steps: (StepCreateDto | StepUpdateDto)[];

  preferences: PreferencesRequestDto;
};
