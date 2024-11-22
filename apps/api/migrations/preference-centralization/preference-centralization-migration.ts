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

import { AppModule } from '../../src/app.module';

const BATCH_SIZE = 2500;

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
 * - subscriber global preference
 *    -> preferences with subscriber global type
 * - subscriber workflow preferences
 *    -> preferences with subscriber workflow type
 * - workflow preferences
 *   -> preferences with workflow-resource type
 *   -> preferences with user-workflow type
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
    console.log({ counter });
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

async function processWorkflowBatch(
  batch: NotificationTemplateEntity[],
  upsertPreferences: UpsertPreferences,
  workflowPreferenceRepository: NotificationTemplateRepository
) {
  await Promise.all(
    batch.map(async (workflowPreference) => {
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
    })
  );
}

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

  let hasMore = true;
  let skip = 0;

  /**
   * Promise to handle the processing of the current batch.
   *
   * This promise is only awaited after the batch becomes full, enabling the batch
   * refill to occur in the background while the previous batch is being processed.
   */
  let processingPromise: Promise<void> | null = null;

  while (hasMore) {
    const batch = await workflowPreferenceRepository._model
      .find(query)
      .select({ _id: 1, _environmentId: 1, _organizationId: 1, _creatorId: 1, critical: 1, preferenceSettings: 1 })
      .sort({ _id: 1 })
      .skip(skip)
      .limit(BATCH_SIZE)
      .read('secondaryPreferred');

    if (batch.length > 0) {
      if (processingPromise) {
        await processingPromise;
      }
      processingPromise = processWorkflowBatch(
        batch as unknown as NotificationTemplateEntity[],
        upsertPreferences,
        workflowPreferenceRepository
      );
      skip += BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  // Ensure the last batch is processed
  if (processingPromise) {
    await processingPromise;
  }

  console.log('end workflow preference migration');
}

async function processSubscriberBatch(batch: SubscriberPreferenceEntity[], upsertPreferences: UpsertPreferences) {
  await Promise.all(
    batch.map(async (subscriberPreference) => {
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
    })
  );
}

async function migrateSubscriberPreferences(
  subscriberPreferenceRepository: SubscriberPreferenceRepository,
  upsertPreferences: UpsertPreferences,
  startSubscriberId?: string
) {
  console.log('start subscriber preference migration');
  let query = {};
  if (startSubscriberId) {
    console.log(`Starting from subscriber preference ID: ${startSubscriberId}`);
    query = { _id: { $gt: startSubscriberId } };
  }

  let hasMore = true;
  let skip = 0;

  /**
   * Promise to handle the processing of the current batch.
   *
   * This promise is only awaited after the batch becomes full, enabling the batch
   * refill to occur in the background while the previous batch is being processed.
   */
  let processingPromise: Promise<void> | null = null;

  while (hasMore) {
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
      .limit(BATCH_SIZE)
      .read('secondaryPreferred');

    if (batch.length > 0) {
      if (processingPromise) {
        await processingPromise;
      }
      processingPromise = processSubscriberBatch(batch as unknown as SubscriberPreferenceEntity[], upsertPreferences);
      skip += BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  // Ensure the last batch is processed
  if (processingPromise) {
    await processingPromise;
  }

  console.log('end subscriber preference migration');
}

// Call the function with optional starting IDs
preferenceCentralization(process.argv[2], process.argv[3]);
