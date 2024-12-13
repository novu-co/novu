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
import { Instrument, InstrumentUsecase } from '../../../instrumentation';

@Injectable()
export class GetWorkflowByIdsUseCase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    @Inject(forwardRef(() => GetPreferences))
    private getPreferences: GetPreferences,
  ) {}

  @InstrumentUsecase()
  async execute(
    command: GetWorkflowByIdsCommand,
  ): Promise<WorkflowInternalResponseDto> {
    const workflowEntity = await this.getDbWorkflow(command);

    const workflowPreferences = await this.getWorkflowPreferences(
      command,
      workflowEntity,
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

  @Instrument()
  private async getDbWorkflow(command: GetWorkflowByIdsCommand) {
    const isInternalId = NotificationTemplateRepository.isInternalId(
      command.workflowIdOrInternalId,
    );

    let workflowEntity: NotificationTemplateEntity | null;
    if (isInternalId) {
      workflowEntity = await this.notificationTemplateRepository.findById(
        command.workflowIdOrInternalId,
        command.environmentId,
      );
    } else {
      workflowEntity =
        await this.notificationTemplateRepository.findByTriggerIdentifier(
          command.environmentId,
          command.workflowIdOrInternalId,
        );
    }

    if (!workflowEntity) {
      throw new NotFoundException({
        message: 'Workflow cannot be found',
        workflowId: command.workflowIdOrInternalId,
      });
    }

    return workflowEntity;
  }

  @Instrument()
  private async getWorkflowPreferences(
    command: GetWorkflowByIdsCommand,
    workflowEntity: NotificationTemplateEntity,
  ) {
    return await this.getPreferences.safeExecute(
      GetPreferencesCommand.create({
        environmentId: command.environmentId,
        organizationId: command.organizationId,
        templateId: workflowEntity._id,
      }),
    );
  }
}
