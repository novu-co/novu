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
    const preferenceSettings =
      GetPreferences.mapWorkflowPreferencesToChannelPreferences(
        workflowPreferences.preferences,
      );

    return {
      ...workflowEntity,
      preferenceSettings,
      userPreferences: workflowPreferences.source.USER_WORKFLOW,
      defaultPreferences: workflowPreferences.source.WORKFLOW_RESOURCE,
    };
  }
}
