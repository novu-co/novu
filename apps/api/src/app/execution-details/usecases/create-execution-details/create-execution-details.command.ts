import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { JobEntity } from '@novu/dal';
import { ExecutionDetailsSourceEnum, ExecutionDetailsStatusEnum, StepTypeEnum } from '@novu/shared';
import { EmailEventStatusEnum, SmsEventStatusEnum } from '@novu/stateless';

import { EnvironmentWithSubscriber } from '../../../shared/commands/project.command';

export enum DetailEnum {
  REPLY_CALLBACK_MISSING_REPLAY_CALLBACK_URL = 'Inbound mail - Missing replay callback URL',
  REPLY_CALLBACK_NOT_CONFIGURATION = 'Inbound mail - Missing configuration',
  REPLY_CALLBACK_MISSING_MX_RECORD_CONFIGURATION = 'Inbound mail - Missing MX Record configuration',
  REPLY_CALLBACK_MISSING_MX_ROUTE_DOMAIN_CONFIGURATION = 'Inbound mail - Missing MX route domain configuration',
  CHAT_WEBHOOK_URL_MISSING = 'Webhook URL for the chat channel is missing',
  STEP_CREATED = 'Step created',
  DIGEST_STEP_CREATED = 'Digest step created',
  STEP_QUEUED = 'Step queued',
  STEP_QUEUED_WITH_DELAY = 'Step queued with delay',
  MESSAGE_CONTENT_NOT_GENERATED = 'Message content could not be generated',
  MESSAGE_CONTENT_SYNTAX_ERROR = 'Message content could not be generated due to syntax error in email editor',
  MESSAGE_CREATED = 'Message created',
  SUBSCRIBER_NO_ACTIVE_INTEGRATION = 'Subscriber does not have an active integration',
  LIMIT_PASSED_NOVU_INTEGRATION = "Novu's provider limit has been reached",
  SUBSCRIBER_NO_CHANNEL_DETAILS = 'Subscriber missing recipient details',
  SUBSCRIBER_NO_ACTIVE_CHANNEL = 'Subscriber does not have a configured channel',
  MESSAGE_SENT = 'Message sent',
  PROVIDER_ERROR = 'Unexpected provider error',
  START_SENDING = 'Start sending message',
  START_DIGESTING = 'Start digesting',
  PROCESSING_STEP_FILTER = 'Processing step filter',
  FILTER_STEPS = 'Step was filtered based on steps filters',
  DIGESTED_EVENTS_PROVIDED = 'Steps to get digest events found',
  STEP_FILTERED_BY_PREFERENCES = 'Step filtered by subscriber preferences',
  WEBHOOK_FILTER_FAILED_RETRY = 'Webhook filter failed, retry will be executed',
  WEBHOOK_FILTER_FAILED_LAST_RETRY = 'Failed to get response from remote webhook filter on last retry',
  JOB_FAILED = 'Job Failed',
  PUSH_MISSING_DEVICE_TOKENS = 'Subscriber credentials is missing the tokens for sending a push notification message',
}

export class CreateExecutionDetailsCommand extends EnvironmentWithSubscriber {
  @IsOptional()
  jobId?: string;

  @IsNotEmpty()
  notificationId: string;

  @IsOptional()
  notificationTemplateId?: string;

  @IsOptional()
  messageId?: string;

  @IsOptional()
  providerId?: string;

  @IsNotEmpty()
  transactionId: string;

  @IsOptional()
  channel?: StepTypeEnum;

  @IsNotEmpty()
  detail: string;

  @IsNotEmpty()
  source: ExecutionDetailsSourceEnum;

  @IsNotEmpty()
  status: ExecutionDetailsStatusEnum;

  @IsNotEmpty()
  isTest: boolean;

  @IsNotEmpty()
  isRetry: boolean;

  @IsOptional()
  @IsString()
  raw?: string | null;

  webhookStatus?: EmailEventStatusEnum | SmsEventStatusEnum;

  static getDetailsFromJob(
    job: JobEntity
  ): Pick<
    CreateExecutionDetailsCommand,
    | 'environmentId'
    | 'organizationId'
    | 'subscriberId'
    | 'jobId'
    | 'notificationId'
    | 'notificationTemplateId'
    | 'providerId'
    | 'transactionId'
    | 'channel'
  > {
    return {
      environmentId: job._environmentId,
      organizationId: job._organizationId,
      subscriberId: job._subscriberId,
      jobId: job._id,
      notificationId: job._notificationId,
      notificationTemplateId: job._templateId,
      providerId: job.providerId,
      transactionId: job.transactionId,
      channel: job.type,
    };
  }
}
