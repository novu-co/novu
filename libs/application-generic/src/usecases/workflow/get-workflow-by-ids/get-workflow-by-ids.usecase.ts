import { Injectable, NotFoundException } from '@nestjs/common';

import {
  NotificationTemplateEntity,
  NotificationTemplateRepository,
} from '@novu/dal';

import { GetWorkflowByIdsCommand } from './get-workflow-by-ids.command';

@Injectable()
export class GetWorkflowByIdsUseCase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
  ) {}
  async execute(
    command: GetWorkflowByIdsCommand,
  ): Promise<NotificationTemplateEntity> {
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

    return workflowEntity;
  }
}
