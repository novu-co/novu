import { IsArray, IsBoolean, IsDefined, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { JsonSchema } from '@novu/framework';
import { ChannelTypeEnum, StepTypeEnum, WorkflowOriginEnum } from '@novu/shared';

class Schema {
  schema: JsonSchema;
}
export type SingleChannelPreference = {
  defaultValue: boolean;
  readOnly: boolean;
};

export type WorkflowPreferencesDto = {
  defaultWorkflowPreference: SingleChannelPreference;
  channels: {
    [key in (typeof ChannelTypeEnum)[keyof typeof ChannelTypeEnum]]: SingleChannelPreference;
  };
};

export type CreateWorkflowDto = Omit<WorkflowDto, '_id'>;

export type UpdateWorkflowDto = Omit<WorkflowDto, '_id'>;

export type WorkflowResponseDto = WorkflowDto & {
  updatedAt: string;
};

export type ListWorkflowResponse = {
  workflowSummaries: MinifiedResponseWorkflowDto[];
  totalResults: number;
};

export type MinifiedResponseWorkflowDto = Pick<WorkflowResponseDto, 'workflowId' | 'tags' | 'updatedAt' | '_id'> & {
  stepSummery: StepTypeEnum[];
};

export class StepDto {
  @IsString()
  @IsDefined()
  code: string;

  @IsString()
  @IsDefined()
  stepId: string;

  @IsString()
  @IsDefined()
  type: StepTypeEnum;

  @IsOptional()
  @ValidateNested()
  @Type(() => Schema)
  controls?: Schema;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReplyCallbackDto)
  replyCallback?: ReplyCallbackDto;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsBoolean()
  shouldStopOnFail?: boolean;
}

export class WorkflowDto {
  @IsString()
  @IsDefined()
  _id: string;

  @IsString()
  @IsDefined()
  workflowId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Schema)
  payload?: Schema;

  @IsOptional()
  @ValidateNested()
  @Type(() => Schema)
  controls?: Schema;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  critical?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsDefined()
  @IsString()
  notificationGroupId: string;

  @IsDefined()
  preferences: WorkflowPreferencesDto;

  @IsString()
  @IsDefined()
  code: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: Array<StepDto>;

  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(WorkflowOriginEnum)
  @IsOptional()
  origin?: WorkflowOriginEnum;
}

export class ReplyCallbackDto {
  @IsBoolean()
  @IsDefined()
  active: boolean;

  @IsString()
  @IsDefined()
  url: string;
}
