import { Injectable } from '@nestjs/common';
import {
  ChangeRepository,
  ControlValuesRepository,
  DalException,
  MessageTemplateRepository,
} from '@novu/dal';
import { ChangeEntityTypeEnum, isBridgeWorkflow } from '@novu/shared';

import { DeleteMessageTemplateCommand } from './delete-message-template.command';
import { CreateChange, CreateChangeCommand } from '../../create-change';
import { ApiException } from '../../../utils/exceptions';

@Injectable()
export class DeleteMessageTemplate {
  constructor(
    private messageTemplateRepository: MessageTemplateRepository,
    private createChange: CreateChange,
    private changeRepository: ChangeRepository,
    private controlValuesRepository: ControlValuesRepository,
  ) {}

  async execute(command: DeleteMessageTemplateCommand): Promise<boolean> {
    try {
      await this.messageTemplateRepository.withTransaction(async () => {
        await this.controlValuesRepository.delete({
          _environmentId: command.environmentId,
          _stepId: command.messageTemplateId,
        });

        await this.messageTemplateRepository.delete({
          _environmentId: command.environmentId,
          _id: command.messageTemplateId,
        });

        if (!isBridgeWorkflow(command.workflowType)) {
          const changeId = await this.changeRepository.getChangeId(
            command.environmentId,
            ChangeEntityTypeEnum.MESSAGE_TEMPLATE,
            command.messageTemplateId,
          );

          const deletedMessageTemplate =
            await this.messageTemplateRepository.findDeleted({
              _environmentId: command.environmentId,
              _id: command.messageTemplateId,
            });

          await this.createChange.execute(
            CreateChangeCommand.create({
              changeId,
              organizationId: command.organizationId,
              environmentId: command.environmentId,
              userId: command.userId,
              item: deletedMessageTemplate[0],
              type: ChangeEntityTypeEnum.MESSAGE_TEMPLATE,
              parentChangeId: command.parentChangeId,
            }),
          );
        }
      });

      return true;
    } catch (error) {
      if (error instanceof DalException) {
        throw new ApiException(error.message);
      }
      throw error;
    }
  }
}
