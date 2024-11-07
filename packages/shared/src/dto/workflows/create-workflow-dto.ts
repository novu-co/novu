import { PreferencesRequestDto, StepCreateDto, WorkflowCommonsFields } from './workflow-commons-fields';
import { WorkflowCreationSourceEnum } from '../../types';

export type CreateWorkflowDto = WorkflowCommonsFields & {
  workflowId: string;

  steps: StepCreateDto[];

  __source: WorkflowCreationSourceEnum;

  preferences?: PreferencesRequestDto;
};
