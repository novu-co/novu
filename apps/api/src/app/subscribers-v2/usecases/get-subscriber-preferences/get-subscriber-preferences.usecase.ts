import { Injectable } from '@nestjs/common';
import {
  GetSubscriberGlobalPreference,
  GetSubscriberGlobalPreferenceCommand,
  GetSubscriberPreference,
  GetSubscriberPreferenceCommand,
} from '@novu/application-generic';
import { IGetPreferencesResponseDto, ISubscriberPreferenceResponse } from '@novu/shared';
import { GetSubscriberPreferencesCommand } from './get-subscriber-preferences.command';

@Injectable()
export class GetSubscriberPreferences {
  constructor(
    private getSubscriberGlobalPreference: GetSubscriberGlobalPreference,
    private getSubscriberPreference: GetSubscriberPreference
  ) {}

  async execute(command: GetSubscriberPreferencesCommand): Promise<IGetPreferencesResponseDto> {
    try {
      const globalPreference = await this.fetchGlobalPreference(command);
      const workflowPreferences = await this.fetchWorkflowPreferences(command);

      return {
        global: globalPreference,
        workflows: workflowPreferences,
      };
    } catch (error) {
      throw new Error(`Failed to get preferences: ${error.message}`);
    }
  }

  private async fetchGlobalPreference(command: GetSubscriberPreferencesCommand) {
    const { preference } = await this.getSubscriberGlobalPreference.execute(
      GetSubscriberGlobalPreferenceCommand.create({
        organizationId: command.organizationId,
        environmentId: command.environmentId,
        subscriberId: command.subscriberId,
        includeInactiveChannels: false,
      })
    );

    return {
      enabled: preference.enabled,
      channels: preference.channels,
    };
  }

  private async fetchWorkflowPreferences(command: GetSubscriberPreferencesCommand) {
    const subscriberWorkflowPreferences = await this.getSubscriberPreference.execute(
      GetSubscriberPreferenceCommand.create({
        environmentId: command.environmentId,
        subscriberId: command.subscriberId,
        organizationId: command.organizationId,
        includeInactiveChannels: false,
      })
    );

    return subscriberWorkflowPreferences.map(this.mapToWorkflowPreference);
  }

  private mapToWorkflowPreference(subscriberWorkflowPreference: ISubscriberPreferenceResponse) {
    const { preference, template } = subscriberWorkflowPreference;

    return {
      enabled: preference.enabled,
      channels: preference.channels,
      overrides: preference.overrides,
      workflow: {
        identifier: template.triggers[0].identifier,
        name: template.name,
      },
    };
  }
}
