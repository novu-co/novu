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
import { Instrument, InstrumentUsecase } from '../../instrumentation';
import { MergePreferences } from '../merge-preferences/merge-preferences.usecase';
import { GetPreferences, PreferenceSet } from '../get-preferences';
import {
  filteredPreference,
  overridePreferences,
} from '../get-subscriber-template-preference';
import { MergePreferencesCommand } from '../merge-preferences/merge-preferences.command';
import { mapTemplateConfiguration } from '../get-subscriber-template-preference/get-subscriber-template-preference.usecase';

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
    const workflowIds = workflowList.map((wf) => wf._id);

    const [
      workflowResourcePreferences,
      workflowUserPreferences,
      subscriberWorkflowPreferences,
      subscriberGlobalPreference,
    ] = await Promise.all([
      this.getWorkflowResourcePreference(workflowIds, command.environmentId),
      this.getWorkflowUserPreference(workflowIds, command.environmentId),
      this.getSubscriberWorkflowPreference(
        command.subscriberId,
        workflowIds,
        command.environmentId,
      ),
      this.getSubscriberGlobalPreference(
        command.subscriberId,
        command.environmentId,
      ),
    ]);

    const allWorkflowPreferences = [
      ...workflowResourcePreferences,
      ...workflowUserPreferences,
      ...subscriberWorkflowPreferences,
    ];

    const workflowPreferenceSets = allWorkflowPreferences.reduce<
      Record<string, PreferenceSet>
    >((acc, preference) => {
      const workflowId = preference._templateId;

      // Skip if the preference is not for a workflow
      if (workflowId === undefined) {
        return acc;
      }

      if (!acc[workflowId]) {
        acc[workflowId] = {
          workflowResourcePreference: undefined,
          workflowUserPreference: undefined,
          subscriberWorkflowPreference: undefined,
        };
      }
      switch (preference.type) {
        case PreferencesTypeEnum.WORKFLOW_RESOURCE:
          acc[workflowId].workflowResourcePreference =
            preference as PreferenceSet['workflowResourcePreference'];
          break;
        case PreferencesTypeEnum.USER_WORKFLOW:
          acc[workflowId].workflowUserPreference =
            preference as PreferenceSet['workflowUserPreference'];
          break;
        case PreferencesTypeEnum.SUBSCRIBER_WORKFLOW:
          acc[workflowId].subscriberWorkflowPreference = preference;
          break;
        default:
      }

      return acc;
    }, {});

    const mergedPreferences: ISubscriberPreferenceResponse[] = workflowList.map(
      (workflow) => {
        const preferences = workflowPreferenceSets[workflow._id];
        const mergeCommand = MergePreferencesCommand.create({
          workflowResourcePreference: preferences.workflowResourcePreference,
          workflowUserPreference: preferences.workflowUserPreference,
          subscriberWorkflowPreference:
            preferences.subscriberWorkflowPreference,
          ...(subscriberGlobalPreference ? { subscriberGlobalPreference } : {}),
        });
        const merged = MergePreferences.execute(mergeCommand);

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
            subscriber:
              GetPreferences.mapWorkflowPreferencesToChannelPreferences(
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
          template: mapTemplateConfiguration({
            ...workflow,
            critical: merged.preferences.all.readOnly,
          }),
          type: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
        };
      },
    );

    const nonCriticalWorkflowPreferences = mergedPreferences.filter(
      (preference) => !preference.template.critical,
    );

    return nonCriticalWorkflowPreferences;
  }

  @Instrument()
  private async getWorkflowResourcePreference(
    workflowIds: string[],
    environmentId: string,
  ): Promise<PreferenceSet['workflowResourcePreference'][]> {
    return (await this.preferencesRepository.find({
      _templateId: { $in: workflowIds },
      _environmentId: environmentId,
      type: PreferencesTypeEnum.WORKFLOW_RESOURCE,
    })) as PreferenceSet['workflowResourcePreference'][];
  }

  @Instrument()
  private async getWorkflowUserPreference(
    workflowIds: string[],
    environmentId: string,
  ): Promise<PreferenceSet['workflowUserPreference'][]> {
    return (await this.preferencesRepository.find({
      _templateId: { $in: workflowIds },
      _environmentId: environmentId,
      type: PreferencesTypeEnum.USER_WORKFLOW,
    })) as PreferenceSet['workflowUserPreference'][];
  }

  @Instrument()
  private async getSubscriberWorkflowPreference(
    subscriberId: string,
    workflowIds: string[],
    environmentId: string,
  ): Promise<PreferenceSet['subscriberWorkflowPreference'][]> {
    return await this.preferencesRepository.find({
      _subscriberId: subscriberId,
      _templateId: { $in: workflowIds },
      _environmentId: environmentId,
      type: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
    });
  }

  @Instrument()
  private async getSubscriberGlobalPreference(
    subscriberId: string,
    environmentId: string,
  ): Promise<PreferenceSet['subscriberGlobalPreference']> {
    return await this.preferencesRepository.findOne({
      _subscriberId: subscriberId,
      _environmentId: environmentId,
      type: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
    });
  }

  private getChannels(
    workflow: NotificationTemplateEntity,
    includeInactiveChannels: boolean,
  ): ChannelTypeEnum[] {
    if (includeInactiveChannels) {
      return Object.values(ChannelTypeEnum);
    }

    const activeSteps = workflow.steps.filter((step) => step.active === true);

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
