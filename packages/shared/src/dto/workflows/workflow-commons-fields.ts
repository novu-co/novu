import type { JSONSchema } from 'json-schema-to-ts';
import { WorkflowResponseDto } from './workflow-response-dto';
import { Slug, StepTypeEnum, WorkflowPreferences } from '../../types';
import { StepContentIssueEnum, StepIssueEnum } from './step-content-issue.enum';

export class ControlsSchema {
  schema: JSONSchema;
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
  tags: string[];
  active?: boolean;
  name: string;
  description?: string;
};

export type PreferencesResponseDto = {
  user: WorkflowPreferences | null;
  default: WorkflowPreferences;
};

export type PreferencesRequestDto = {
  user: WorkflowPreferences | null;
  workflow?: WorkflowPreferences | null;
};
