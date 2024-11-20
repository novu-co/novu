import { Injectable } from '@nestjs/common';

import {
  ControlValuesRepository,
  MessageTemplateRepository,
  NotificationTemplateEntity,
  NotificationTemplateRepository,
  PreferencesRepository,
} from '@novu/dal';
import { PreferencesTypeEnum, WorkflowOriginEnum } from '@novu/shared';

import { DeleteWorkflowCommand } from './delete-workflow.command';
import { InvalidateCacheService } from '../../../services/cache/invalidate-cache.service';
import { GetWorkflowByIdsUseCase } from '../get-workflow-by-ids/get-workflow-by-ids.usecase';
import { GetWorkflowByIdsCommand } from '../get-workflow-by-ids/get-workflow-by-ids.command';
import {
  buildNotificationTemplateIdentifierKey,
  buildNotificationTemplateKey,
} from '../../../services/cache/key-builders';
import {
  DeletePreferencesUseCase,
  DeletePreferencesCommand,
} from '../../delete-preferences';

@Injectable()
export class DeleteWorkflowUseCase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    private messageTemplateRepository: MessageTemplateRepository,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private preferencesRepository: PreferencesRepository,
    private invalidateCache: InvalidateCacheService,
    private controlValuesRepository: ControlValuesRepository,
    private deletePreferencesUsecase: DeletePreferencesUseCase,
  ) {}

  async execute(command: DeleteWorkflowCommand): Promise<void> {
    const workflowEntity = await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        ...command,
        identifierOrInternalId: command.identifierOrInternalId,
      }),
    );

    await this.invalidateCacheForWorkflow(workflowEntity, command);

    await this.deleteRelatedEntities(command, workflowEntity);
  }

  private async deleteRelatedEntities(
    command: DeleteWorkflowCommand,
    workflow: NotificationTemplateEntity,
  ) {
    await this.notificationTemplateRepository.withTransaction(async () => {
      await this.controlValuesRepository.deleteMany({
        _environmentId: command.environmentId,
        _organizationId: command.organizationId,
        _workflowId: workflow._id,
      });

      if (workflow.steps.length > 0) {
        for (const step of workflow.steps) {
          await this.messageTemplateRepository.deleteById({
            _id: step._templateId,
            _environmentId: command.environmentId,
          });
        }
      }

      await this.deletePreferencesUsecase.execute(
        DeletePreferencesCommand.create({
          templateId: workflow._id,
          environmentId: command.environmentId,
          organizationId: command.organizationId,
          userId: command.userId,
          type: PreferencesTypeEnum.USER_WORKFLOW,
        }),
      );
      await this.deletePreferencesUsecase.execute(
        DeletePreferencesCommand.create({
          templateId: workflow._id,
          environmentId: command.environmentId,
          organizationId: command.organizationId,
          userId: command.userId,
          type: PreferencesTypeEnum.WORKFLOW_RESOURCE,
        }),
      );

      await this.notificationTemplateRepository.delete({
        _id: workflow._id,
        _organizationId: command.organizationId,
        _environmentId: command.environmentId,
      });
    });
  }

  private async invalidateCacheForWorkflow(
    workflow: NotificationTemplateEntity,
    command: DeleteWorkflowCommand,
  ) {
    await this.invalidateCache.invalidateByKey({
      key: buildNotificationTemplateKey({
        _id: workflow._id,
        _environmentId: command.environmentId,
      }),
    });

    await this.invalidateCache.invalidateByKey({
      key: buildNotificationTemplateIdentifierKey({
        templateIdentifier: workflow.triggers[0].identifier,
        _environmentId: command.environmentId,
      }),
    });
  }

  private isNovuCloud(workflow: NotificationTemplateEntity) {
    return (
      workflow.origin === WorkflowOriginEnum.NOVU_CLOUD ||
      workflow.origin === WorkflowOriginEnum.NOVU_CLOUD_V1
    );
  }
}
