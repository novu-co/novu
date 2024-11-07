import { IsArray, IsDefined, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PreferencesResponseDto, StepResponseDto, WorkflowCommonsFields } from './workflow-commons-fields';
import { Slug, WorkflowOriginEnum } from '../../types';
import { WorkflowStatusEnum } from './workflow-status-enum';
import { CreateWorkflowDto } from './create-workflow-dto';
import { UpdateWorkflowDto } from './update-workflow-dto';

export class WorkflowResponseDto extends WorkflowCommonsFields {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsDefined()
  slug: Slug;

  @IsString()
  @IsDefined()
  updatedAt: string;

  @IsString()
  @IsDefined()
  createdAt: string;

  @IsArray()
  @IsDefined()
  steps: StepResponseDto[];

  @IsEnum(WorkflowOriginEnum)
  @IsDefined()
  origin: WorkflowOriginEnum;

  @IsObject()
  @IsDefined()
  preferences: PreferencesResponseDto;

  @IsEnum(WorkflowStatusEnum)
  @IsDefined()
  status: WorkflowStatusEnum;

  @IsObject()
  @IsOptional()
  issues?: Record<WorkflowCreateAndUpdateKeys, RuntimeIssue>;

  @IsString()
  @IsDefined()
  workflowId: string;
}
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
