import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  NotificationTemplateEntity,
  NotificationTemplateRepository,
} from '@novu/dal';
import {
  buildWorkflowPreferencesFromPreferenceChannels,
  DEFAULT_WORKFLOW_PREFERENCES,
} from '@novu/shared';
import { GetPreferences, GetPreferencesCommand } from '../../get-preferences';

import { GetWorkflowByIdsCommand } from './get-workflow-by-ids.command';
import { WorkflowInternalResponseDto } from './get-workflow-by-ids.dto';

@Injectable()
export class GetWorkflowByIdsUseCase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    @Inject(forwardRef(() => GetPreferences))
    private getPreferences: GetPreferences,
  ) {}
  async execute(
    command: GetWorkflowByIdsCommand,
  ): Promise<WorkflowInternalResponseDto> {
    const isInternalId = NotificationTemplateRepository.isInternalId(
      command.identifierOrInternalId,
    );

    let workflowEntity: NotificationTemplateEntity | null;

    if (isInternalId) {
      workflowEntity = await this.notificationTemplateRepository.findById(
        command.identifierOrInternalId,
        command.environmentId,
      );
    } else {
      workflowEntity =
        await this.notificationTemplateRepository.findByTriggerIdentifier(
          command.environmentId,
          command.identifierOrInternalId,
        );
    }

    if (!workflowEntity) {
      throw new NotFoundException({
        message: 'Workflow cannot be found',
        workflowId: command.identifierOrInternalId,
      });
    }

    const workflowPreferences = await this.getPreferences.safeExecute(
      GetPreferencesCommand.create({
        environmentId: command.environmentId,
        organizationId: command.organizationId,
        templateId: workflowEntity._id,
      }),
    );
    /**
     * @deprecated - use `userPreferences` and `defaultPreferences` instead
     */
    const preferenceSettings = workflowPreferences
      ? GetPreferences.mapWorkflowPreferencesToChannelPreferences(
          workflowPreferences.preferences,
        )
      : workflowEntity.preferenceSettings;
    const userPreferences = workflowPreferences
      ? workflowPreferences.source.USER_WORKFLOW
      : buildWorkflowPreferencesFromPreferenceChannels(
          workflowEntity.critical,
          workflowEntity.preferenceSettings,
        );
    const defaultPreferences = workflowPreferences
      ? workflowPreferences.source.WORKFLOW_RESOURCE
      : DEFAULT_WORKFLOW_PREFERENCES;

    return {
      ...workflowEntity,
      preferenceSettings,
      userPreferences,
      defaultPreferences,
    };
  }
}
