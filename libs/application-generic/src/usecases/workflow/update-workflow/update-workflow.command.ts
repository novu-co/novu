import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {
  JSONSchemaDto,
  NotificationTemplateCustomData,
  WorkflowStatusEnum,
  WorkflowTypeEnum,
} from '@novu/shared';

import { Type } from 'class-transformer';
import { EnvironmentWithUserCommand } from '../../../commands';
import { PreferencesRequired } from '../../upsert-preferences';
import { ContentIssue, NotificationStep } from '../..';

export class UpdateWorkflowCommand extends EnvironmentWithUserCommand {
  @IsDefined()
  @IsMongoId()
  id: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  workflowId?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PreferencesRequired)
  @ValidateIf((object, value) => value !== null)
  @IsOptional()
  userPreferences?: PreferencesRequired | null;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesRequired)
  defaultPreferences: PreferencesRequired;

  @IsBoolean()
  @IsOptional()
  critical?: boolean;

  @IsOptional()
  @IsMongoId({
    message: 'Bad group id name',
  })
  notificationGroupId?: string;

  @IsArray()
  @ValidateNested()
  @IsOptional()
  steps?: NotificationStep[];

  @ValidateNested()
  @IsOptional()
  replyCallback?: {
    active: boolean;
    url: string;
  };

  @IsOptional()
  data?: NotificationTemplateCustomData;

  @IsOptional()
  inputs?: IStepControl;

  @IsOptional()
  controls?: IStepControl;

  @IsOptional()
  rawData?: any;

  @IsOptional()
  payloadSchema?: JSONSchemaDto;

  @IsEnum(WorkflowTypeEnum)
  @IsDefined()
  type: WorkflowTypeEnum;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ContentIssue)
  issues?: Record<string, ContentIssue[]>;

  @IsEnum(WorkflowStatusEnum)
  @IsOptional()
  status?: WorkflowStatusEnum;
}

export interface IStepControl {
  schema: JSONSchemaDto;
}
