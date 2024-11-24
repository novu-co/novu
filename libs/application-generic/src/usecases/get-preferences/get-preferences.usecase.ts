import { BadRequestException, Injectable } from '@nestjs/common';
import { PreferencesEntity, PreferencesRepository } from '@novu/dal';
import {
  buildWorkflowPreferences,
  IPreferenceChannels,
  PreferencesTypeEnum,
  WorkflowPreferences,
  WorkflowPreferencesPartial,
} from '@novu/shared';
import { deepMerge } from '../../utils';
import { GetPreferencesCommand } from './get-preferences.command';
import { GetPreferencesResponseDto } from './get-preferences.dto';
import { InstrumentUsecase } from '../../instrumentation';
import { MergePreferences } from '../merge-preferences/merge-preferences.usecase';

class PreferencesNotFoundException extends BadRequestException {
  constructor(featureFlagCommand: GetPreferencesCommand) {
    super({ message: 'Preferences not found', ...featureFlagCommand });
  }
}

@Injectable()
export class GetPreferences {
  constructor(private preferencesRepository: PreferencesRepository) {}

  @InstrumentUsecase()
  async execute(
    command: GetPreferencesCommand,
  ): Promise<GetPreferencesResponseDto> {
    const items = await this.getPreferencesFromDb(command);

    if (items.length === 0) {
      throw new PreferencesNotFoundException(command);
    }

    const mergedPreferences = MergePreferences.merge(items);

    if (!mergedPreferences.preferences) {
      throw new PreferencesNotFoundException(command);
    }

    return mergedPreferences;
  }

  /** Get only simple, channel-level enablement flags */
  public async getPreferenceChannels(command: {
    environmentId: string;
    organizationId: string;
    subscriberId: string;
    templateId?: string;
  }): Promise<IPreferenceChannels | undefined> {
    const result = await this.safeExecute(command);

    if (!result) {
      return undefined;
    }

    return GetPreferences.mapWorkflowPreferencesToChannelPreferences(
      result.preferences,
    );
  }

  public async safeExecute(
    command: GetPreferencesCommand,
  ): Promise<GetPreferencesResponseDto> {
    try {
      return await this.execute(
        GetPreferencesCommand.create({
          environmentId: command.environmentId,
          organizationId: command.organizationId,
          subscriberId: command.subscriberId,
          templateId: command.templateId,
        }),
      );
    } catch (e) {
      // If we cant find preferences lets return undefined instead of throwing it up to caller to make it easier for caller to handle.
      if ((e as Error).name === PreferencesNotFoundException.name) {
        return undefined;
      }
      throw e;
    }
  }

  /** Transform WorkflowPreferences into IPreferenceChannels */
  public static mapWorkflowPreferencesToChannelPreferences(
    workflowPreferences: WorkflowPreferencesPartial,
  ): IPreferenceChannels {
    const builtPreferences = buildWorkflowPreferences(workflowPreferences);

    const mappedPreferences = Object.entries(
      builtPreferences.channels ?? {},
    ).reduce(
      (acc, [channel, preference]) => ({
        ...acc,
        [channel]: preference.enabled,
      }),
      {} as IPreferenceChannels,
    );

    return mappedPreferences;
  }

  private async getPreferencesFromDb(
    command: GetPreferencesCommand,
  ): Promise<PreferencesEntity[]> {
    const items: PreferencesEntity[] = [];

    /*
     * Fetch the Workflow Preferences. This includes:
     * - Workflow Resource Preferences - the Code-defined Workflow Preferences
     * - User Workflow Preferences - the Dashboard-defined Workflow Preferences
     */
    if (command.templateId) {
      const workflowPreferences = await this.preferencesRepository.find({
        _templateId: command.templateId,
        _environmentId: command.environmentId,
        type: {
          $in: [
            PreferencesTypeEnum.WORKFLOW_RESOURCE,
            PreferencesTypeEnum.USER_WORKFLOW,
          ],
        },
      });

      items.push(...workflowPreferences);
    }

    // Fetch the Subscriber Global Preference.
    if (command.subscriberId) {
      const subscriberGlobalPreference = await this.preferencesRepository.find({
        _subscriberId: command.subscriberId,
        _environmentId: command.environmentId,
        type: PreferencesTypeEnum.SUBSCRIBER_GLOBAL,
      });

      items.push(...subscriberGlobalPreference);
    }

    // Fetch the Subscriber Workflow Preference.
    if (command.subscriberId && command.templateId) {
      const subscriberWorkflowPreference =
        await this.preferencesRepository.find({
          _subscriberId: command.subscriberId,
          _templateId: command.templateId,
          _environmentId: command.environmentId,
          type: PreferencesTypeEnum.SUBSCRIBER_WORKFLOW,
        });

      items.push(...subscriberWorkflowPreference);
    }

    return items;
  }
}
