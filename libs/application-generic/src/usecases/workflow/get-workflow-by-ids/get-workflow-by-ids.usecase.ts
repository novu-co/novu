import { Injectable, NotFoundException } from '@nestjs/common';

import {
  NotificationTemplateEntity,
  NotificationTemplateRepository,
} from '@novu/dal';

import { GetWorkflowByIdsCommand } from './get-workflow-by-ids.command';
import { isValidShortId } from '../../../utils';

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
    }

    if (workflowEntity) {
      return workflowEntity;
    }

    if (isValidShortId(command.identifierOrInternalId, 6)) {
      workflowEntity = await this.notificationTemplateRepository.findOne({
        shortId: command.identifierOrInternalId,
        _environmentId: command.environmentId,
      });
    }

    if (workflowEntity) {
      return workflowEntity;
    }

    workflowEntity =
      await this.notificationTemplateRepository.findByTriggerIdentifier(
        command.environmentId,
        command.identifierOrInternalId,
      );

    if (workflowEntity) {
      return workflowEntity;
    }

    throw new NotFoundException({
      message: 'Workflow cannot be found',
      workflowId: command.identifierOrInternalId,
    });
  }
}
