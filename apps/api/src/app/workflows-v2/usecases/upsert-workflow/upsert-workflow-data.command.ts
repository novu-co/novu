import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MAX_NAME_LENGTH } from '@novu/application-generic';
import { WorkflowCreationSourceEnum } from '@novu/shared';
import { UpsertStepDataCommand } from './upsert-step-data.command';
import { PreferencesRequestUpsertDataCommand } from './preferences-request-upsert-data.command';

export class UpsertWorkflowDataCommand {
  @IsString()
  @IsOptional()
  workflowId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertStepDataCommand)
  steps: UpsertStepDataCommand[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesRequestUpsertDataCommand)
  preferences?: PreferencesRequestUpsertDataCommand;

  @IsString()
  @IsNotEmpty()
  @Length(1, MAX_NAME_LENGTH)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(16, { message: 'tags must contain no more than 16 elements' })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsEnum(WorkflowCreationSourceEnum)
  __source?: WorkflowCreationSourceEnum;
}
