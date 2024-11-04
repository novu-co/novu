import { IsArray, IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator';
import { WorkflowResponseDto } from './workflow-response-dto';
import { Slug, StepTypeEnum, WorkflowPreferences } from '../../types';

export type IdentifierOrInternalId = string;

export type StepResponseDto = StepDto & {
  _id: string;
  slug: Slug;
  stepId: string;
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

export class StepDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsDefined()
  type: StepTypeEnum;
}

export class WorkflowCommonsFields {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export type PreferencesResponseDto = {
  user: WorkflowPreferences | null;
  default: WorkflowPreferences;
};

export type PreferencesRequestDto = {
  user: WorkflowPreferences | null;
  workflow?: WorkflowPreferences | null;
};
