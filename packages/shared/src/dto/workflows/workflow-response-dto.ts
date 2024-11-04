import { IsArray, IsDefined, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { PreferencesResponseDto, StepResponseDto, WorkflowCommonsFields } from './workflow-commons-fields';
import { Slug, WorkflowOriginEnum } from '../../types';
import { WorkflowStatusEnum } from './workflow-status-enum';

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

  // TODO: provide better types for issues
  @IsObject()
  @IsOptional()
  issues?: Record<string, unknown>;

  @IsString()
  @IsDefined()
  workflowId: string;
}
