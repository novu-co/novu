import { PreferencesRequestDto, StepCreateDto, StepUpdateDto, WorkflowCommonsFields } from './workflow-commons-fields';

export type UpdateWorkflowDto = WorkflowCommonsFields & {
  steps: (StepCreateDto | StepUpdateDto)[];

  preferences: PreferencesRequestDto;
};
