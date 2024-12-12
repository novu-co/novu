import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkflowResponseDto } from '@novu/shared';
import { NotificationTemplateRepository } from '@novu/dal';
import { PatchWorkflowCommand } from './patch-workflow.command';
import { GetWorkflowUseCase } from '../get-workflow';

@Injectable()
export class PatchWorkflowUsecase {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    private getWorkflowUseCase: GetWorkflowUseCase
  ) {}

  // NOTICE: The TODOS in this usecase explore a different way to fetch and update a resource, leveraging model classes
  async execute(command: PatchWorkflowCommand): Promise<WorkflowResponseDto> {
    // TODO: Return a Mongoose model
    const workflow = await this.notificationTemplateRepository.findOne({
      _id: command.workflowIdOrInternalId,
      _environmentId: command.user.environmentId,
    });

    if (!workflow) {
      throw new NotFoundException({
        message: 'Workflow cannot be found',
        workflowId: command.workflowIdOrInternalId,
      });
    }

    if (typeof command.active === 'boolean') {
      workflow.active = command.active;
    }

    // TODO: Update the workflow using the Mongoose model.save()
    await this.notificationTemplateRepository.update(
      {
        _id: workflow._id,
        _environmentId: command.user.environmentId,
      },
      workflow
    );

    /*
     * TODO: Convert to a serializer that also enriches the workflow with necessary data from other collections
     * such as preferences, message templates, etc...
     */
    return await this.getWorkflowUseCase.execute({
      workflowIdOrInternalId: command.workflowIdOrInternalId,
      user: command.user,
    });
  }
}
