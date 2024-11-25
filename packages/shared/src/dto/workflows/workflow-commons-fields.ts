import type { JSONSchemaDto } from './json-schema-dto';
import { WorkflowResponseDto } from './workflow-response-dto';
import { Slug, StepTypeEnum, WorkflowOriginEnum, WorkflowPreferences } from '../../types';
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

export type IdentifierOrInternalId = string;

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

export type StepUpdateDto = StepDto & {
  _id: string;
  /**
   * @deprecated This field is deprecated and will be removed in future versions, use the patch step data.
   */
  controlValues?: Record<string, unknown>;
  /**
   * for code-first workflows we allow to store the control/output schema on create/update step
   */
  controlSchema?: JSONSchemaDto;
  outputSchema?: JSONSchemaDto;
};

export type StepCreateDto = StepDto & {
  /**
   * @deprecated This field is deprecated and will be removed in future versions, use the patch step data.
   */
  controlValues?: Record<string, unknown>;
  /**
   * for code-first workflows we allow to store the control schema on create/update step
   */
  controlSchema?: JSONSchemaDto;
  outputSchema?: JSONSchemaDto;
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

/**
 * Common fields used by framework workflows to store schemas and metadata
 */
export type FrameworkCommonsFields = {
  workflowId?: string;
  controlsSchema?: JSONSchemaDto;
  payloadSchema?: JSONSchemaDto;
  origin?: WorkflowOriginEnum;
};

export type WorkflowCommonsFields = FrameworkCommonsFields & {
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
