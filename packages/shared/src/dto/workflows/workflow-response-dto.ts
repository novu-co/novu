import { PreferencesResponseDto, StepResponseDto, WorkflowCommonsFields } from './workflow-commons-fields';
import { Slug, WorkflowOriginEnum } from '../../types';
import { WorkflowStatusEnum } from './workflow-status-enum';
import { CreateWorkflowDto } from './create-workflow-dto';
import { UpdateWorkflowDto } from './update-workflow-dto';

export type WorkflowResponseDto = WorkflowCommonsFields & {
  _id: string;
  workflowId: string;
  slug: Slug;
  updatedAt: string;
  createdAt: string;
  steps: StepResponseDto[];
  origin: WorkflowOriginEnum;
  preferences: PreferencesResponseDto;
  status: WorkflowStatusEnum;
  issues?: Record<WorkflowCreateAndUpdateKeys, RuntimeIssue>;
};
export type WorkflowCreateAndUpdateKeys = keyof CreateWorkflowDto | keyof UpdateWorkflowDto;
export class RuntimeIssue {
  issueType: WorkflowIssueTypeEnum;
  variableName?: string;
  message: string;
}
export enum WorkflowIssueTypeEnum {
  MISSING_VALUE = 'MISSING_VALUE',
  MAX_LENGTH_ACCESSED = 'MAX_LENGTH_ACCESSED',
  WORKFLOW_ID_ALREADY_EXISTS = 'WORKFLOW_ID_ALREADY_EXISTS',
}
