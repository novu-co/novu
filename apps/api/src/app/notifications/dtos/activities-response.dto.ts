import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DigestUnitEnum,
  ExecutionDetailsSourceEnum,
  ExecutionDetailsStatusEnum,
  MessageTemplateDto,
  ProvidersIdEnum,
  ProvidersIdEnumConst,
  StepTypeEnum,
  TriggerTypeEnum,
} from '@novu/shared';
import { StepFilter } from '@novu/dal';
import { IsEnum, IsString } from 'class-validator';
import { StepFilterDto } from '../../shared/dtos/step-filter-dto';

// Base DTO for Digest Metadata
export class DigestBaseMetadataDto {
  @ApiPropertyOptional({ description: 'Optional key for the digest' })
  digestKey?: string;

  @ApiPropertyOptional({ description: 'Amount for the digest', type: Number })
  amount?: number;

  @ApiPropertyOptional({ description: 'Unit of the digest', enum: DigestUnitEnum })
  unit?: DigestUnitEnum;
}

// DTO for Digest including events
export class DigestWithEventsDto extends DigestBaseMetadataDto {
  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
    },
    description: 'Optional array of events associated with the digest, represented as key-value pairs',
  })
  events?: Record<string, unknown>[]; // Optional array of events as key-value pairs
}

// Activity Notification Step Response DTO
export class ActivityNotificationStepResponseDto {
  @ApiProperty({ description: 'Unique identifier of the step', type: String })
  _id: string;

  @ApiProperty({ description: 'Whether the step is active or not', type: Boolean })
  active: boolean;

  @ApiProperty({ description: 'Filter criteria for the step', isArray: true, type: StepFilter })
  filters: StepFilterDto[];

  @ApiPropertyOptional({ description: 'Optional template for the step', type: MessageTemplateDto })
  template?: MessageTemplateDto;
}

// Activity Notification Execution Detail Response DTO
export class ActivityNotificationExecutionDetailResponseDto {
  @ApiProperty({ description: 'Unique identifier of the execution detail', type: String })
  _id: string;

  @ApiProperty({
    enum: ExecutionDetailsStatusEnum,
    description: 'Status of the execution detail',
    type: String, // Explicit type reference for enum
  })
  status: ExecutionDetailsStatusEnum;

  @ApiProperty({ description: 'Detailed information about the execution', type: String })
  detail: string;

  @ApiProperty({ description: 'Whether the execution is a retry or not', type: Boolean })
  isRetry: boolean;

  @ApiProperty({ description: 'Whether the execution is a test or not', type: Boolean })
  isTest: boolean;

  @ApiProperty({
    enum: [...Object.values(ProvidersIdEnumConst).flatMap((enumObj) => Object.values(enumObj))],
    enumName: 'ProvidersIdEnum',
    description: 'Provider ID of the execution',
    type: String,
  })
  @IsString()
  @IsEnum(ProvidersIdEnumConst)
  providerId: ProvidersIdEnum;

  @ApiPropertyOptional({ description: 'Raw data of the execution', type: String })
  raw?: string;

  @ApiProperty({
    enum: ExecutionDetailsSourceEnum,
    description: 'Source of the execution detail',
    type: String, // Explicit type reference for enum
  })
  source: ExecutionDetailsSourceEnum;
}

// Activity Notification Job Response DTO
export class ActivityNotificationJobResponseDto {
  @ApiProperty({ description: 'Unique identifier of the job', type: String })
  _id: string;

  @ApiProperty({ description: 'Type of the job', type: String })
  type: StepTypeEnum;

  @ApiPropertyOptional({
    description: 'Optional digest for the job, including metadata and events',
    type: DigestWithEventsDto,
  })
  digest?: DigestWithEventsDto; // Use the new DTO

  @ApiProperty({
    description: 'Execution details of the job',
    type: [ActivityNotificationExecutionDetailResponseDto],
  })
  executionDetails: ActivityNotificationExecutionDetailResponseDto[];

  @ApiProperty({
    description: 'Step details of the job',
    type: ActivityNotificationStepResponseDto,
  })
  step: ActivityNotificationStepResponseDto;

  @ApiPropertyOptional({ description: 'Optional payload for the job', type: Object }) // Use Object for unknown structure
  payload?: Record<string, unknown>;

  @ApiProperty({
    enum: [...Object.values(ProvidersIdEnumConst).flatMap((enumObj) => Object.values(enumObj))],
    enumName: 'ProvidersIdEnum',
    description: 'Provider ID of the job',
    type: String, // Explicit type reference for enum
  })
  providerId: ProvidersIdEnum;

  @ApiProperty({ description: 'Status of the job', type: String })
  status: string;

  @ApiPropertyOptional({ description: 'Updated time of the notification', type: String })
  updatedAt?: string;
}

// Activity Notification Subscriber Response DTO
export class ActivityNotificationSubscriberResponseDto {
  @ApiPropertyOptional({ description: 'First name of the subscriber', type: String })
  firstName?: string;

  @ApiProperty({ description: 'External unique identifier of the subscriber', type: String })
  _id: string;

  @ApiPropertyOptional({ description: 'Last name of the subscriber', type: String })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Email address of the subscriber', type: String })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number of the subscriber', type: String })
  phone?: string;
}

// Notification Trigger Variable DTO
export class NotificationTriggerVariable {
  @ApiProperty({ description: 'Name of the variable', type: String })
  name: string;
}

// Notification Trigger DTO
export class NotificationTrigger {
  @ApiProperty({
    enum: TriggerTypeEnum,
    description: 'Type of the trigger',
    type: String, // Explicit type reference for enum
  })
  type: TriggerTypeEnum;

  @ApiProperty({ description: 'Identifier of the trigger', type: String })
  identifier: string;

  @ApiProperty({
    description: 'Variables of the trigger',
    type: [NotificationTriggerVariable],
  })
  variables: NotificationTriggerVariable[];

  @ApiPropertyOptional({
    description: 'Subscriber variables of the trigger',
    type: [NotificationTriggerVariable],
  })
  subscriberVariables?: NotificationTriggerVariable[];
}

// Activity Notification Template Response DTO
class ActivityNotificationTemplateResponseDto {
  @ApiPropertyOptional({ description: 'Unique identifier of the template', type: String })
  _id?: string;

  @ApiProperty({ description: 'Name of the template', type: String })
  name: string;

  @ApiProperty({
    description: 'Triggers of the template',
    type: [NotificationTrigger],
  })
  triggers: NotificationTrigger[];
}

// Activity Notification Response DTO
export class ActivityNotificationResponseDto {
  @ApiPropertyOptional({ description: 'Unique identifier of the notification', type: String })
  _id?: string;

  @ApiProperty({ description: 'Environment ID of the notification', type: String })
  _environmentId: string;

  @ApiProperty({ description: 'Organization ID of the notification', type: String })
  _organizationId: string;

  @ApiProperty({ description: 'Transaction ID of the notification', type: String })
  transactionId: string;

  @ApiPropertyOptional({ description: 'Creation time of the notification', type: String })
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Channels of the notification',
    enum: [...Object.values(StepTypeEnum)],
    enumName: 'StepTypeEnum',
    isArray: true,
    type: String, // Explicit type reference for enum
  })
  channels?: StepTypeEnum[];

  @ApiPropertyOptional({
    description: 'Subscriber of the notification',
    type: ActivityNotificationSubscriberResponseDto,
  })
  subscriber?: ActivityNotificationSubscriberResponseDto;

  @ApiPropertyOptional({
    description: 'Template of the notification',
    type: ActivityNotificationTemplateResponseDto,
  })
  template?: ActivityNotificationTemplateResponseDto;

  @ApiPropertyOptional({
    description: 'Jobs of the notification',
    type: [ActivityNotificationJobResponseDto],
  })
  jobs?: ActivityNotificationJobResponseDto[];
}

// Activities Response DTO
export class ActivitiesResponseDto {
  @ApiProperty({ description: 'Indicates if there are more activities in the result set', type: Boolean })
  hasMore: boolean;

  @ApiProperty({
    description: 'Array of activity notifications',
    type: [ActivityNotificationResponseDto],
  })
  data: ActivityNotificationResponseDto[];

  @ApiProperty({ description: 'Page size of the activities', type: Number })
  pageSize: number;

  @ApiProperty({ description: 'Current page of the activities', type: Number })
  page: number;
}
