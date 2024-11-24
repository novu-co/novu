/* eslint-disable max-len */
/* eslint-disable no-console */

import '../../src/config';

import { NestFactory } from '@nestjs/core';
import {
  SubscriberPreferenceRepository,
  NotificationTemplateRepository,
  PreferenceLevelEnum,
  NotificationTemplateEntity,
  SubscriberPreferenceEntity,
} from '@novu/dal';
import {
  UpsertPreferences,
  UpsertWorkflowPreferencesCommand,
  UpsertUserWorkflowPreferencesCommand,
  UpsertSubscriberGlobalPreferencesCommand,
  UpsertSubscriberWorkflowPreferencesCommand,
} from '@novu/application-generic';
import { buildWorkflowPreferencesFromPreferenceChannels, DEFAULT_WORKFLOW_PREFERENCES } from '@novu/shared';
import async from 'async';

import { AppModule } from '../../src/app.module';

const RETRIEVAL_BATCH_SIZE = 1000;
const PROCESS_BATCH_SIZE = 2500;
const MAX_QUEUE_DEPTH = 25000;
const MAX_QUEUE_TIMEOUT = 100;

const counter: Record<string, { success: number; error: number }> = {
  subscriberGlobal: { success: 0, error: 0 },
  subscriberWorkflow: { success: 0, error: 0 },
  subscriberUnknown: { success: 0, error: 0 },
  workflow: { success: 0, error: 0 },
};

let lastProcessedWorkflowId: string | undefined;
let lastProcessedSubscriberId: string | undefined;

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT (Ctrl+C)');
  console.log({ counter });
  if (lastProcessedWorkflowId) {
    console.log(`Last processed workflow preference ID: ${lastProcessedWorkflowId}`);
  }
  if (lastProcessedSubscriberId) {
    console.log(`Last processed subscriber preference ID: ${lastProcessedSubscriberId}`);
  }
  process.exit();
});

/**
 * Migration to centralize workflow and subscriber preferences.
 * Preferences are migrated in the following order:
 *
 * - workflow preferences
 *   -> preferences with workflow-resource type
 *   -> preferences with user-workflow type
 * - subscriber global preference
 *    -> preferences with subscriber global type
 * - subscriber workflow preferences
 *    -> preferences with subscriber workflow type
 *
 * Subscriber workflow preferences must be migrated after global preferences because
 * the upsert subscriber global preferences will delete the subscriber workflow preferences
 * with a matching channel.
 *
 * Depending on the size of your dataset, the following additional indexes will help with of the
 * Subscriber Preference Migration:
 * - { level: 1 }
 * - { level: 1, _id: 1 }
 */
export async function preferenceCentralization(startWorkflowId?: string, startSubscriberId?: string) {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  console.log('start migration - preference centralization');

  const upsertPreferences = app.get(UpsertPreferences);
  const subscriberPreferenceRepository = app.get(SubscriberPreferenceRepository);
  const workflowPreferenceRepository = app.get(NotificationTemplateRepository);

  // Set up a logging interval to log the counter and last processed IDs every 10 seconds
  const logInterval = setInterval(() => {
    console.log('Current migration status:');
    console.log({ timestamp: new Date().toISOString(), counter });
    if (lastProcessedWorkflowId) {
      console.log(`Last processed workflow preference ID: ${lastProcessedWorkflowId}`);
    }
    if (lastProcessedSubscriberId) {
      console.log(`Last processed subscriber preference ID: ${lastProcessedSubscriberId}`);
    }
  }, 1000); // 10 seconds

  await migrateWorkflowPreferences(workflowPreferenceRepository, upsertPreferences, startWorkflowId);
  console.log({ counter });
  await migrateSubscriberPreferences(subscriberPreferenceRepository, upsertPreferences, startSubscriberId);

  // Clear the logging interval once migration is complete
  clearInterval(logInterval);

  console.log('end migration - preference centralization');
  console.log({ counter });
  console.log(`Processed workflow preference with ID: ${lastProcessedWorkflowId}`);
  console.log(`Processed subscriber preference with ID: ${lastProcessedSubscriberId}`);

  app.close();
}

/**
 * Migrate workflow preferences.
 * - workflow preferences
 *   -> preferences with workflow-resource type
 *   -> preferences with user-workflow type
 */
async function migrateWorkflowPreferences(
  workflowPreferenceRepository: NotificationTemplateRepository,
  upsertPreferences: UpsertPreferences,
  startWorkflowId?: string
) {
  console.log('start workflow preference migration');
  let query = {};
  if (startWorkflowId) {
    console.log(`Starting from workflow preference ID: ${startWorkflowId}`);
    query = { _id: { $gt: startWorkflowId } };
  }

  const recordQueue = async.queue<NotificationTemplateEntity>(async (record, callback) => {
    await processWorkflowRecord(record, upsertPreferences, workflowPreferenceRepository);
    callback();
  }, PROCESS_BATCH_SIZE);

  let hasMore = true;
  let skip = 0;
  while (hasMore) {
    if (recordQueue.length() >= MAX_QUEUE_DEPTH) {
      await new Promise((resolve) => {
        setTimeout(resolve, MAX_QUEUE_TIMEOUT);
      });
      continue;
    }
    const batch = await workflowPreferenceRepository._model
      .find(query)
      .select({
        _id: 1,
        _environmentId: 1,
        _organizationId: 1,
        _creatorId: 1,
        critical: 1,
        preferenceSettings: 1,
      })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(RETRIEVAL_BATCH_SIZE)
      .read('secondaryPreferred');

    if (batch.length > 0) {
      recordQueue.push(batch as unknown as NotificationTemplateEntity[]);
      skip += RETRIEVAL_BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  // Wait for all records to be processed
  await recordQueue.drain();

  console.log('end workflow preference migration');
}

async function processWorkflowRecord(
  workflowPreference: NotificationTemplateEntity,
  upsertPreferences: UpsertPreferences,
  workflowPreferenceRepository: NotificationTemplateRepository
) {
  try {
    await workflowPreferenceRepository.withTransaction(async (tx) => {
      const workflowPreferenceToUpsert = UpsertWorkflowPreferencesCommand.create({
        templateId: workflowPreference._id.toString(),
        environmentId: workflowPreference._environmentId.toString(),
        organizationId: workflowPreference._organizationId.toString(),
        preferences: DEFAULT_WORKFLOW_PREFERENCES,
      });

      await upsertPreferences.upsertWorkflowPreferences(workflowPreferenceToUpsert);

      const userWorkflowPreferenceToUpsert = UpsertUserWorkflowPreferencesCommand.create({
        userId: workflowPreference._creatorId.toString(),
        templateId: workflowPreference._id.toString(),
        environmentId: workflowPreference._environmentId.toString(),
        organizationId: workflowPreference._organizationId.toString(),
        preferences: buildWorkflowPreferencesFromPreferenceChannels(
          workflowPreference.critical,
          workflowPreference.preferenceSettings
        ),
      });

      await upsertPreferences.upsertUserWorkflowPreferences(userWorkflowPreferenceToUpsert);
    });

    counter.workflow.success += 1;
    lastProcessedWorkflowId = workflowPreference._id.toString();
  } catch (error) {
    console.error(error);
    console.error({
      failedWorkflowId: workflowPreference._id,
    });
    counter.workflow.error += 1;
  }
}

/**
 * Migrate subscriber preferences.
 * - global subscriber preferences
 *    -> preferences with subscriber global type
 * - template subscriber preferences
 *    -> preferences with subscriber template type
 */
async function migrateSubscriberPreferences(
  subscriberPreferenceRepository: SubscriberPreferenceRepository,
  upsertPreferences: UpsertPreferences,
  startSubscriberId?: string
) {
  console.log('start subscriber preference migration');

  console.log('start processing global subscriber preferences');
  // Process global level preferences first
  await processSubscriberPreferencesByLevel(
    subscriberPreferenceRepository,
    upsertPreferences,
    PreferenceLevelEnum.GLOBAL,
    startSubscriberId
  );
  console.log('end processing global subscriber preferences');

  console.log('start processing template subscriber preferences');
  // Then process template level preferences
  await processSubscriberPreferencesByLevel(
    subscriberPreferenceRepository,
    upsertPreferences,
    PreferenceLevelEnum.TEMPLATE,
    startSubscriberId
  );
  console.log('end processing template subscriber preferences');

  console.log('end subscriber preference migration');
}

async function processSubscriberPreferencesByLevel(
  subscriberPreferenceRepository: SubscriberPreferenceRepository,
  upsertPreferences: UpsertPreferences,
  level: PreferenceLevelEnum,
  startSubscriberId?: string
) {
  console.log(`start processing subscriber preferences with level: ${level}`);
  let query: { level: PreferenceLevelEnum; _id?: { $gt: string } } = {
    level,
  };
  if (startSubscriberId) {
    console.log(`Starting from subscriber preference ID: ${startSubscriberId}`);
    query = { ...query, _id: { $gt: startSubscriberId } };
  }

  const recordQueue = async.queue<SubscriberPreferenceEntity>(async (record, callback) => {
    await processSubscriberRecord(record, upsertPreferences);
    callback();
  }, PROCESS_BATCH_SIZE);

  let hasMore = true;
  let skip = 0;
  while (hasMore) {
    if (recordQueue.length() >= MAX_QUEUE_DEPTH) {
      await new Promise((resolve) => {
        setTimeout(resolve, MAX_QUEUE_TIMEOUT);
      });
      continue;
    }

    const batch = await subscriberPreferenceRepository._model
      .find(query)
      .select({
        _id: 1,
        _environmentId: 1,
        _organizationId: 1,
        _subscriberId: 1,
        _templateId: 1,
        level: 1,
        channels: 1,
      })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(RETRIEVAL_BATCH_SIZE)
      .read('secondaryPreferred');

    if (batch.length > 0) {
      recordQueue.push(batch as unknown as SubscriberPreferenceEntity[]);
      skip += RETRIEVAL_BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  // Wait for all records to be processed
  await recordQueue.drain();

  console.log(`end processing subscriber preferences with level: ${level}`);
}

async function processSubscriberRecord(
  subscriberPreference: SubscriberPreferenceEntity,
  upsertPreferences: UpsertPreferences
) {
  try {
    if (subscriberPreference.level === PreferenceLevelEnum.GLOBAL) {
      const preferenceToUpsert = UpsertSubscriberGlobalPreferencesCommand.create({
        _subscriberId: subscriberPreference._subscriberId.toString(),
        environmentId: subscriberPreference._environmentId.toString(),
        organizationId: subscriberPreference._organizationId.toString(),
        preferences: buildWorkflowPreferencesFromPreferenceChannels(false, subscriberPreference.channels),
      });

      await upsertPreferences.upsertSubscriberGlobalPreferences(preferenceToUpsert);

      counter.subscriberGlobal.success += 1;
    } else if (subscriberPreference.level === PreferenceLevelEnum.TEMPLATE) {
      if (!subscriberPreference._templateId) {
        console.error(
          `Invalid templateId ${subscriberPreference._templateId} for id ${subscriberPreference._id} for subscriber ${subscriberPreference._subscriberId}`
        );
        counter.subscriberWorkflow.error += 1;

        return;
      }
      const preferenceToUpsert = UpsertSubscriberWorkflowPreferencesCommand.create({
        _subscriberId: subscriberPreference._subscriberId.toString(),
        templateId: subscriberPreference._templateId.toString(),
        environmentId: subscriberPreference._environmentId.toString(),
        organizationId: subscriberPreference._organizationId.toString(),
        preferences: buildWorkflowPreferencesFromPreferenceChannels(false, subscriberPreference.channels),
      });

      await upsertPreferences.upsertSubscriberWorkflowPreferences(preferenceToUpsert);

      counter.subscriberWorkflow.success += 1;
    } else {
      console.error(
        `Invalid preference level ${subscriberPreference.level} for id ${subscriberPreference._subscriberId}`
      );
      counter.subscriberUnknown.error += 1;
    }
    lastProcessedSubscriberId = subscriberPreference._id.toString();
  } catch (error) {
    console.error(error);
    console.error({
      failedSubscriberPreferenceId: subscriberPreference._id,
      failedSubscriberId: subscriberPreference._subscriberId,
    });
    if (subscriberPreference.level === PreferenceLevelEnum.GLOBAL) {
      counter.subscriberGlobal.error += 1;
    } else if (subscriberPreference.level === PreferenceLevelEnum.TEMPLATE) {
      counter.subscriberWorkflow.error += 1;
    }
  }
}

// Call the function with optional starting IDs
preferenceCentralization(process.argv[2], process.argv[3]);
