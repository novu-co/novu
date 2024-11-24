import { PreferencesEntity } from '@novu/dal';
import { PreferencesTypeEnum, WorkflowPreferences } from '@novu/shared';
import { deepMerge } from '../../utils';
import { GetPreferencesResponseDto } from '../get-preferences';

/**
 * Merge preferences for a subscriber.
 *
 * The order of precedence is:
 * 1. Workflow resource preferences
 * 2. Workflow user preferences
 * 3. Subscriber global preferences
 * 4. Subscriber workflow preferences
 *
 * If a workflow has the readOnly flag set to true, the subscriber preferences are ignored.
 *
 * If the workflow does not have the readOnly flag set to true, the subscriber preferences are merged with the workflow preferences.
 *
 * If the subscriber has no preferences, the workflow preferences are returned.
 */
export class MergePreferences {
  public static merge(items: PreferencesEntity[]): GetPreferencesResponseDto {
    const workflowResourcePreferences =
      this.getWorkflowResourcePreferences(items);
    const workflowUserPreferences = this.getWorkflowUserPreferences(items);

    const workflowPreferences = deepMerge(
      [workflowResourcePreferences, workflowUserPreferences]
        .filter((preference) => preference !== undefined)
        .map((item) => item.preferences),
    ) as WorkflowPreferences;

    const subscriberGlobalPreferences =
      this.getSubscriberGlobalPreferences(items);
    const subscriberWorkflowPreferences =
      this.getSubscriberWorkflowPreferences(items);

    const subscriberPreferences = deepMerge(
      [subscriberGlobalPreferences, subscriberWorkflowPreferences]
        .filter((preference) => preference !== undefined)
        .map((item) => item.preferences),
    );

    /**
     * Order is important here because we like the workflowPreferences (that comes from the bridge)
     * to be overridden by any other preferences and then we have preferences defined in dashboard and
     * then subscribers global preferences and the once that should be used if it says other then anything before it
     * we use subscribers workflow preferences
     */
    const preferencesEntities = [
      workflowResourcePreferences,
      workflowUserPreferences,
      subscriberGlobalPreferences,
      subscriberWorkflowPreferences,
    ];
    const source = Object.values(PreferencesTypeEnum).reduce(
      (acc, type) => {
        const preference = items.find((item) => item.type === type);
        if (preference) {
          acc[type] = preference.preferences as WorkflowPreferences;
        } else {
          acc[type] = null;
        }

        return acc;
      },
      {} as GetPreferencesResponseDto['source'],
    );
    const preferences = preferencesEntities
      .filter((preference) => preference !== undefined)
      .map((item) => item.preferences);

    // ensure we don't merge on an empty list
    if (preferences.length === 0) {
      return { preferences: undefined, type: undefined, source };
    }

    const readOnlyFlag = workflowPreferences?.all?.readOnly;

    // Determine the most specific preference applied
    let mostSpecificPreference: PreferencesTypeEnum | undefined;
    if (subscriberWorkflowPreferences && !readOnlyFlag) {
      mostSpecificPreference = PreferencesTypeEnum.SUBSCRIBER_WORKFLOW;
    } else if (subscriberGlobalPreferences && !readOnlyFlag) {
      mostSpecificPreference = PreferencesTypeEnum.SUBSCRIBER_GLOBAL;
    } else if (workflowUserPreferences) {
      mostSpecificPreference = PreferencesTypeEnum.USER_WORKFLOW;
    } else if (workflowResourcePreferences) {
      mostSpecificPreference = PreferencesTypeEnum.WORKFLOW_RESOURCE;
    }

    // If workflowPreferences have readOnly flag set to true, disregard subscriber preferences
    if (readOnlyFlag) {
      return {
        preferences: workflowPreferences,
        type: mostSpecificPreference,
        source,
      };
    }

    /**
     * Order is (almost exactly) reversed of that above because 'readOnly' should be prioritized
     * by the Dashboard (userPreferences) the most.
     */
    const orderedPreferencesForReadOnly = [
      subscriberWorkflowPreferences,
      subscriberGlobalPreferences,
      workflowResourcePreferences,
      workflowUserPreferences,
    ]
      .filter((preference) => preference !== undefined)
      .map((item) => item.preferences);

    const readOnlyPreferences = orderedPreferencesForReadOnly.map(
      ({ all }) => ({
        all: { readOnly: all?.readOnly || false },
      }),
    ) as WorkflowPreferences[];

    const readOnlyPreference = deepMerge([...readOnlyPreferences]);

    if (Object.keys(subscriberPreferences).length === 0) {
      return {
        preferences: workflowPreferences,
        type: mostSpecificPreference,
        source,
      };
    }
    // if the workflow should be readonly, we return the resource preferences default value for workflow.
    if (readOnlyPreference?.all?.readOnly) {
      subscriberPreferences.all.enabled = workflowPreferences?.all?.enabled;
    }

    // making sure we respond with correct readonly values.
    const mergedPreferences = deepMerge([
      workflowPreferences,
      subscriberPreferences,
      readOnlyPreference,
    ]) as WorkflowPreferences;

    return {
      preferences: mergedPreferences,
      type: mostSpecificPreference,
      source,
    };
  }

  private static getSubscriberWorkflowPreferences(
    items: PreferencesEntity[],
  ): PreferencesEntity | undefined {
    return items.find(
      (item) => item.type === PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    );
  }

  private static getSubscriberGlobalPreferences(
    items: PreferencesEntity[],
  ): PreferencesEntity | undefined {
    return items.find(
      (item) => item.type === PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    );
  }

  private static getWorkflowUserPreferences(
    items: PreferencesEntity[],
  ): PreferencesEntity | undefined {
    return items.find(
      (item) => item.type === PreferencesTypeEnum.USER_WORKFLOW,
    );
  }

  private static getWorkflowResourcePreferences(
    items: PreferencesEntity[],
  ): PreferencesEntity | undefined {
    return items.find(
      (item) => item.type === PreferencesTypeEnum.WORKFLOW_RESOURCE,
    );
  }
}
