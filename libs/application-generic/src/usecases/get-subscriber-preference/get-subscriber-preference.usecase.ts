import { Injectable, NotFoundException } from '@nestjs/common';
import {
  NotificationTemplateRepository,
  SubscriberRepository,
  PreferencesRepository,
  PreferencesEntity,
  NotificationTemplateEntity,
} from '@novu/dal';
import {
  ChannelTypeEnum,
  ISubscriberPreferenceResponse,
  PreferencesTypeEnum,
  StepTypeEnum,
} from '@novu/shared';

import { AnalyticsService } from '../../services/analytics.service';
import { GetSubscriberPreferenceCommand } from './get-subscriber-preference.command';
import { InstrumentUsecase } from '../../instrumentation';
import { MergePreferences } from '../merge-preferences/merge-preferences.usecase';
import { GetPreferences } from '../get-preferences';
import {
  filteredPreference,
  overridePreferences,
} from '../get-subscriber-template-preference';

@Injectable()
export class GetSubscriberPreference {
  constructor(
    private subscriberRepository: SubscriberRepository,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private analyticsService: AnalyticsService,
    private preferencesRepository: PreferencesRepository,
  ) {}

  @InstrumentUsecase()
  async execute(
    command: GetSubscriberPreferenceCommand,
  ): Promise<ISubscriberPreferenceResponse[]> {
    const subscriber = await this.subscriberRepository.findBySubscriberId(
      command.environmentId,
      command.subscriberId,
    );
    if (!subscriber) {
      throw new NotFoundException(
        `Subscriber with id: ${command.subscriberId} not found`,
      );
    }

    const workflowList = await this.notificationTemplateRepository.filterActive(
      {
        organizationId: command.organizationId,
        environmentId: command.environmentId,
        tags: command.tags,
      },
    );

    this.analyticsService.mixpanelTrack(
      'Fetch User Preferences - [Notification Center]',
      '',
      {
        _organization: command.organizationId,
        templatesSize: workflowList.length,
      },
    );

    const allPreferences = await this.preferencesRepository.find({
      _environmentId: command.environmentId,
      $or: [
        {
          _subscriberId: command.subscriberId,
          type: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
        },
        {
          _templateId: { $in: workflowList.map((template) => template._id) },
          type: {
            $in: [
              PreferencesTypeEnum.WORKFLOW_RESOURCE,
              PreferencesTypeEnum.USER_WORKFLOW,
            ],
          },
        },
        {
          _subscriberId: command.subscriberId,
          type: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
        },
      ],
    });

    const subscriberGlobalPreference = allPreferences.find(
      (preference) =>
        preference._subscriberId === command.subscriberId &&
        preference.type === PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    );

    const workflowPreferenceSets = allPreferences.reduce<
      Record<string, PreferencesEntity[]>
    >((acc, preference) => {
      const workflowId = preference._templateId;

      // Skip if the preference is not for a workflow
      if (workflowId === undefined) {
        return acc;
      }

      if (!acc[workflowId]) {
        acc[workflowId] = [];
      }
      acc[workflowId].push(preference);

      return acc;
    }, {});

    const mergedPreferences: ISubscriberPreferenceResponse[] = Object.entries(
      workflowPreferenceSets,
    ).map(([workflowId, preferences]) => {
      const merged = MergePreferences.merge([
        ...preferences,
        subscriberGlobalPreference,
      ]);

      const workflow = workflowList.find((wf) => wf._id === workflowId);

      const includedChannels = this.getChannels(
        workflow,
        command.includeInactiveChannels,
      );

      const initialChannels = filteredPreference(
        {
          email: true,
          sms: true,
          in_app: true,
          chat: true,
          push: true,
        },
        includedChannels,
      );

      const { channels, overrides } = overridePreferences(
        {
          template: GetPreferences.mapWorkflowPreferencesToChannelPreferences(
            merged.source.WORKFLOW_RESOURCE,
          ),
          subscriber: GetPreferences.mapWorkflowPreferencesToChannelPreferences(
            merged.preferences,
          ),
          workflowOverride: {},
        },
        initialChannels,
      );

      return {
        preference: {
          channels,
          enabled: true,
          overrides,
        },
        template: {
          ...workflow,
          critical: merged.preferences.all.readOnly,
        },
        type: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
      };
    });

    const nonCriticalWorkflowPreferences = mergedPreferences.filter(
      (preference) => !preference.template.critical,
    );

    return nonCriticalWorkflowPreferences;
  }

  private getChannels(
    template: NotificationTemplateEntity,
    includeInactiveChannels: boolean,
  ): ChannelTypeEnum[] {
    if (includeInactiveChannels) {
      return Object.values(ChannelTypeEnum);
    }

    const activeSteps = template.steps.filter((step) => step.active === true);

    const channels = activeSteps
      .map((item) => item.template.type as StepTypeEnum)
      .reduce<StepTypeEnum[]>((list, channel) => {
        if (list.includes(channel)) {
          return list;
        }
        list.push(channel);

        return list;
      }, []);

    return channels as unknown as ChannelTypeEnum[];
  }
}
