import { type PreferencesRequestDto, type StepCreateDto, type WorkflowCommonsFields } from './workflow-commons-fields';
import { type WorkflowCreationSourceEnum } from '../../types';

export type CreateWorkflowDto = WorkflowCommonsFields & {
  workflowId: string;

  steps: StepCreateDto[];

  __source: WorkflowCreationSourceEnum;

  preferences?: PreferencesRequestDto;
};
