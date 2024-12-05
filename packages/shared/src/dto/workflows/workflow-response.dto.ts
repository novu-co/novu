import type { JSONSchemaDto } from './json-schema-dto';
import { Slug } from '../../types/utils';
import { WorkflowCreationSourceEnum, StepTypeEnum, WorkflowOriginEnum, WorkflowPreferences } from '../../types';
import { WorkflowStatusEnum } from './workflow-status-enum';
import { StepContentIssueEnum, StepIssueEnum } from './step-content-issue.enum';

export class ControlsSchema {
  schema: JSONSchemaDto;
}
export type StepCreateAndUpdateKeys = keyof StepCreateDto | keyof StepUpdateDto;

export class StepIssuesDto {
  body?: Record<StepCreateAndUpdateKeys, StepIssue>;
  controls?: Record<string, ContentIssue[]>;
}
// eslint-disable-next-line @typescript-eslint/naming-convention
interface Issue<T> {
  issueType: T;
  variableName?: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ContentIssue extends Issue<StepContentIssueEnum> {}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface StepIssue extends Issue<StepIssueEnum> {}

export type PatchStepDataDto = {
  name?: string;
  controlValues?: Record<string, unknown>;
};

export type PatchWorkflowDto = {
  active?: boolean;
  name?: string;
  description?: string;
  tags?: string[];
};

export type StepResponseDto = StepDto & {
  _id: string;
  slug: Slug;
  stepId: string;
  issues?: StepIssuesDto;
};

export type StepUpdateDto = StepCreateDto & {
  _id: string;
};

export type StepCreateDto = StepDto & {
  /**
   * @deprecated This field is deprecated and will be removed in future versions, use the patch step data.
   */
  controlValues?: Record<string, unknown>;
};

export type ListWorkflowResponse = {
  workflows: WorkflowListResponseDto[];
  totalCount: number;
};

export type WorkflowListResponseDto = Pick<
  WorkflowResponseDto,
  'name' | 'tags' | 'updatedAt' | 'createdAt' | '_id' | 'workflowId' | 'slug' | 'status' | 'origin'
> & {
  stepTypeOverviews: StepTypeEnum[];
};

export type StepDto = {
  name: string;
  type: StepTypeEnum;
};

export type WorkflowCommonsFields = {
  name: string;
  description?: string;
  tags?: string[];
  active?: boolean;
};

export type PreferencesResponseDto = {
  user: WorkflowPreferences | null;
  default: WorkflowPreferences;
};

export type PreferencesRequestDto = {
  user: WorkflowPreferences | null;
  workflow?: WorkflowPreferences | null;
};

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
  DUPLICATED_VALUE = 'DUPLICATED_VALUE',
  LIMIT_REACHED = 'LIMIT_REACHED',
}

export type CreateWorkflowDto = WorkflowCommonsFields & {
  workflowId: string;

  steps: StepCreateDto[];

  __source: WorkflowCreationSourceEnum;

  preferences?: PreferencesRequestDto;
};

export type UpdateWorkflowDto = WorkflowCommonsFields & {
  /**
   * We allow to update workflow id only for code first workflows
   */
  workflowId?: string;

  steps: (StepCreateDto | StepUpdateDto)[];

  preferences: PreferencesRequestDto;
};
