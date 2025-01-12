/* eslint-disable global-require */
import { DynamicModule, Logger, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import {
  BulkCreateExecutionDetails,
  CalculateLimitNovuIntegration,
  CompileEmailTemplate,
  CompileInAppTemplate,
  CompileTemplate,
  ConditionsFilter,
  CreateExecutionDetails,
  ExecutionLogRoute,
  GetDecryptedIntegrations,
  getFeatureFlag,
  GetLayoutUseCase,
  GetNovuLayout,
  GetNovuProviderCredentials,
  GetPreferences,
  GetSubscriberPreference,
  GetSubscriberTemplatePreference,
  GetTopicSubscribersUseCase,
  NormalizeVariables,
  ProcessTenant,
  SelectIntegration,
  SelectVariant,
  TierRestrictionsValidateUsecase,
  TriggerBroadcast,
  TriggerEvent,
  TriggerMulticast,
  WorkflowInMemoryProviderService,
} from '@novu/application-generic';
import { CommunityOrganizationRepository, JobRepository, PreferencesRepository } from '@novu/dal';

import { ForwardReference } from '@nestjs/common/interfaces/modules/forward-reference.interface';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { JobTopicNameEnum } from '@novu/shared';
import {
  Digest,
  ExecuteBridgeJob,
  GetDigestEventsBackoff,
  GetDigestEventsRegular,
  HandleLastFailedJob,
  QueueNextJob,
  RunJob,
  SendMessage,
  SendMessageChat,
  SendMessageDelay,
  SendMessageEmail,
  SendMessageInApp,
  SendMessagePush,
  SendMessageSms,
  SetJobAsCompleted,
  SetJobAsFailed,
  UpdateJobStatus,
  WebhookFilterBackoffStrategy,
} from './usecases';

import { ACTIVE_WORKERS, workersToProcess } from '../../config/worker-init.config';
import { SharedModule } from '../shared/shared.module';
import { AddDelayJob, AddJob, MergeOrCreateDigest } from './usecases/add-job';
import { InboundEmailParse } from './usecases/inbound-email-parse/inbound-email-parse.usecase';
import { ExecuteStepCustom } from './usecases/send-message/execute-step-custom.usecase';
import { Throttle } from './usecases/send-message/throttle/throttle.usecase';
import { StoreSubscriberJobs } from './usecases/store-subscriber-jobs';
import { SubscriberJobBound } from './usecases/subscriber-job-bound/subscriber-job-bound.usecase';

const enterpriseImports = (): Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference> => {
  const modules: Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference> = [];
  try {
    if (process.env.NOVU_ENTERPRISE === 'true' || process.env.CI_EE_TEST === 'true') {
      Logger.log('Importing enterprise modules', 'EnterpriseImport');
      if (require('@novu/ee-translation')?.EnterpriseTranslationModuleWithoutControllers) {
        Logger.log('Importing enterprise translations module', 'EnterpriseImport');
        modules.push(require('@novu/ee-translation')?.EnterpriseTranslationModuleWithoutControllers);
      }

      if (require('@novu/ee-billing')?.BillingModule) {
        Logger.log('Importing enterprise billing module', 'EnterpriseImport');
        const activeWorkers = workersToProcess.length ? workersToProcess : Object.values(JobTopicNameEnum);
        modules.push(require('@novu/ee-billing')?.BillingModule.forRoot(activeWorkers));
      }
    }
  } catch (e) {
    Logger.error(e, `Unexpected error while importing enterprise modules`, 'EnterpriseImport');
  }

  return modules;
};
const REPOSITORIES = [JobRepository, CommunityOrganizationRepository, PreferencesRepository];

const USE_CASES = [
  AddDelayJob,
  MergeOrCreateDigest,
  AddJob,
  TierRestrictionsValidateUsecase,
  CalculateLimitNovuIntegration,
  CompileEmailTemplate,
  CompileTemplate,
  CreateExecutionDetails,
  ConditionsFilter,
  NormalizeVariables,
  BulkCreateExecutionDetails,
  Digest,
  GetDecryptedIntegrations,
  GetDigestEventsBackoff,
  GetDigestEventsRegular,
  GetLayoutUseCase,
  GetNovuLayout,
  GetNovuProviderCredentials,
  SelectIntegration,
  SelectVariant,
  GetSubscriberPreference,
  GetSubscriberTemplatePreference,
  HandleLastFailedJob,
  ProcessTenant,
  QueueNextJob,
  RunJob,
  SendMessage,
  SendMessageChat,
  SendMessageDelay,
  SendMessageEmail,
  SendMessageInApp,
  SendMessagePush,
  SendMessageSms,
  Throttle,
  ExecuteStepCustom,
  StoreSubscriberJobs,
  SetJobAsCompleted,
  SetJobAsFailed,
  TriggerEvent,
  UpdateJobStatus,
  WebhookFilterBackoffStrategy,
  GetTopicSubscribersUseCase,
  getFeatureFlag,
  SubscriberJobBound,
  TriggerBroadcast,
  TriggerMulticast,
  CompileInAppTemplate,
  InboundEmailParse,
  ExecutionLogRoute,
  ExecuteBridgeJob,
  GetPreferences,
];

const PROVIDERS: Provider[] = [];
const activeWorkersToken: any = {
  provide: 'ACTIVE_WORKERS',
  useFactory: (...args: any[]) => {
    return args;
  },
  inject: ACTIVE_WORKERS,
};

const memoryQueueService = {
  provide: WorkflowInMemoryProviderService,
  useFactory: async () => {
    const memoryService = new WorkflowInMemoryProviderService();

    await memoryService.initialize();

    return memoryService;
  },
};

@Module({
  imports: [SharedModule, ...enterpriseImports()],
  controllers: [],
  providers: [memoryQueueService, ...ACTIVE_WORKERS, ...PROVIDERS, ...USE_CASES, ...REPOSITORIES, activeWorkersToken],
  exports: [...PROVIDERS, ...USE_CASES, ...REPOSITORIES, activeWorkersToken],
})
export class WorkflowModule implements OnApplicationShutdown {
  constructor(private workflowInMemoryProviderService: WorkflowInMemoryProviderService) {}

  async onApplicationShutdown() {
    await this.workflowInMemoryProviderService.shutdown();
  }
}
