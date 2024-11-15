import { Injectable } from '@nestjs/common';
import { UserSessionData, WorkflowResponseDto } from '@novu/shared';
import { NotificationTemplateEntity, NotificationTemplateRepository } from '@novu/dal';
import { GetWorkflowByIdsUseCase } from '@novu/application-generic';
import { PostProcessWorkflowUpdate } from '../post-process-workflow-update';
import { PatchWorkflowCommand } from './patch-workflow.command';
import { GetWorkflowUseCase } from '../get-workflow';

@Injectable()
export class PatchWorkflowUsecase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private postProcessWorkflowUpdate: PostProcessWorkflowUpdate,
    private getWorkflowUseCase: GetWorkflowUseCase
  ) {}

  async execute(command: PatchWorkflowCommand): Promise<WorkflowResponseDto> {
    const persistedWorkflow = await this.fetchWorkflow(command);
    let transientWorkflow = this.patchWorkflowFields(persistedWorkflow, command);

    transientWorkflow = await this.postProcessWorkflowUpdate.execute({
      workflow: transientWorkflow,
      user: command.user,
    });
    await this.persistWorkflow(transientWorkflow, command.user);

    return await this.getWorkflowUseCase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      user: command.user,
    });
  }

  private patchWorkflowFields(persistedWorkflow, command: PatchWorkflowCommand) {
    const transientWorkflow = { ...persistedWorkflow };
    if (command.active !== undefined) {
      // @ts-ignore
      transientWorkflow.active = command.active;
    }

    return transientWorkflow;
  }

  private async persistWorkflow(
    workflowWithIssues: Partial<NotificationTemplateEntity>,
    userSessionData: UserSessionData
  ) {
    await this.notificationTemplateRepository.update(
      {
        _id: workflowWithIssues._id,
        _environmentId: userSessionData.environmentId,
      },
      {
        ...workflowWithIssues,
      }
    );
  }

  private async fetchWorkflow(command: PatchWorkflowCommand) {
    return await this.getWorkflowByIdsUseCase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
      userId: command.user._id,
    });
  }
}
