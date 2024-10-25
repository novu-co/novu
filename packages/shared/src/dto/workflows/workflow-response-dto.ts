import { IsArray, IsDefined, IsEnum, IsObject, IsString } from 'class-validator';
import { PreferencesResponseDto, StepResponseDto, WorkflowCommonsFields } from './workflow-commons-fields';
import { Slug, WorkflowOriginEnum } from '../../types';
import { WorkflowStatusEnum } from './workflow-status-enum';
import { RuntimeIssue, WorkflowIssueTypeEnum } from "../step-schemas";

class WorkflowIssues {
  bodyIssues: Record<string, RuntimeIssue[]>;
  stepsIssues: Record<string, RuntimeIssue[]>;
}
export class RuntimeIssue {
  issueType: WorkflowIssueTypeEnum;
  variableName?: string;
  message: string;
}
export enum WorkflowIssueTypeEnum {
  MISSING_VARIABLE_IN_PAYLOAD = 'MISSING_VARIABLE_IN_PAYLOAD',
  VARIABLE_TYPE_MISMATCH = 'VARIABLE_TYPE_MISMATCH',
  MISSING_VALUE = 'MISSING_VALUE',
  WORKFLOW_ID_ALREADY_EXIST = 'WORKFLOW_ID_ALREADY_EXIST',
  STEP_ID_ALREADY_EXIST = 'WORKFLOW_ID_ALREADY_EXIST',
}
export enum WorkflowStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
}
export class WorkflowResponseDto extends WorkflowCommonsFields {
  ...
  @IsEnum(WorkflowStatusEnum)
  @IsDefined()
  status: WorkflowStatusEnum;

  @IsDefined()
  issues: WorkflowIssues;
}
