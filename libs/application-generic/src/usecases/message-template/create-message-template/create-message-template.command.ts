import {
  IsDefined,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  StepTypeEnum,
  IEmailBlock,
  IMessageCTA,
  ITemplateVariable,
  IActor,
  MessageTemplateContentType,
  WorkflowTypeEnum,
  JSONSchemaDto,
} from '@novu/shared';

import { EnvironmentWithUserCommand } from '../../../commands';

export class CreateMessageTemplateCommand extends EnvironmentWithUserCommand {
  @IsDefined()
  @IsEnum(StepTypeEnum)
  type: StepTypeEnum;

  @IsOptional()
  name?: string;

  @IsOptional()
  subject?: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  variables?: ITemplateVariable[];

  @IsOptional()
  content?: string | IEmailBlock[];

  @IsOptional()
  contentType?: MessageTemplateContentType;

  @IsOptional()
  @ValidateNested()
  cta?: IMessageCTA;

  @IsOptional()
  @IsString()
  feedId?: string;

  @IsOptional()
  @IsString()
  layoutId?: string | null;

  @IsMongoId()
  parentChangeId?: string;

  @IsOptional()
  @IsString()
  preheader?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  actor?: IActor;

  @IsOptional()
  _creatorId?: string;

  @IsOptional()
  controls?: {
    schema: JSONSchemaDto;
  };

  @IsOptional()
  output?: {
    schema: JSONSchemaDto;
  };

  @IsOptional()
  code?: string;

  @IsOptional()
  stepId?: string;

  @IsEnum(WorkflowTypeEnum)
  @IsDefined()
  workflowType: WorkflowTypeEnum;
}
