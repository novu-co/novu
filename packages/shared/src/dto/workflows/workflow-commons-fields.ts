import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

import { JSONSchema } from 'json-schema-to-ts';
import { WorkflowResponseDto } from './workflow-response-dto';
import { Slug, StepTypeEnum, WorkflowPreferences } from '../../types';

export type IdentifierOrInternalId = string;

export class ControlsSchema {
  schema: JSONSchema;
}

export class StepDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(StepTypeEnum)
  @IsNotEmpty()
  type: StepTypeEnum;

  @IsObject()
  @IsOptional()
  controlValues?: Record<string, unknown>;
}

export type StepResponseDto = StepDto & {
  _id: string;
  slug: Slug;
  stepId: string;
  controls: ControlsSchema;
};

export class StepUpdateDto extends StepDto {
  @IsString()
  @IsNotEmpty()
  _id: string;
}

export class StepCreateDto extends StepDto {}

export type ListWorkflowResponse = {
  workflows: WorkflowListResponseDto[];
  totalCount: number;
};

export type WorkflowListResponseDto = Pick<
  WorkflowResponseDto,
  'name' | 'tags' | 'updatedAt' | 'createdAt' | '_id' | 'slug' | 'status' | 'origin'
> & {
  stepTypeOverviews: StepTypeEnum[];
};

export class WorkflowCommonsFields {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  workflowId: string;

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
};
