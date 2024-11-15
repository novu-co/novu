/* eslint-disable no-param-reassign */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PatchStepFieldEnum, StepDataDto, UserSessionData } from '@novu/shared';
import { NotificationStepEntity, NotificationTemplateEntity, NotificationTemplateRepository } from '@novu/dal';
import {
  GetWorkflowByIdsUseCase,
  UpsertControlValuesCommand,
  UpsertControlValuesUseCase,
} from '@novu/application-generic';
import { PatchStepDataCommand } from './patch-step-data.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { PostProcessWorkflowUpdate } from '../post-process-workflow-update';

type ValidNotificationWorkflow = {
  currentStep: NonNullable<NotificationStepEntity>;
  workflow: NotificationTemplateEntity;
};
@Injectable()
export class PatchStepDataUsecase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private notificationTemplateRepository: NotificationTemplateRepository,
    private upsertControlValuesUseCase: UpsertControlValuesUseCase,
    private postProcessWorkflowUpdate: PostProcessWorkflowUpdate
  ) {}

  async execute(command: PatchStepDataCommand): Promise<StepDataDto> {
    const persistedItems = await this.loadPersistedItems(command);
    if (command.fieldsToUpdate.includes(PatchStepFieldEnum.NAME)) {
      await this.updateName(persistedItems, command);
    }

    if (command.fieldsToUpdate.includes(PatchStepFieldEnum.CONTROL_VALUES)) {
      await this.updateControlValues(persistedItems, command);
    }
    const updatedWorkflow = await this.postProcessWorkflowUpdate.execute({
      workflow: persistedItems.workflow,
      user: command.user,
    });
    await this.persistWorkflow(updatedWorkflow, command.user);

    return await this.buildStepDataUsecase.execute({ ...command });
  }

  private async loadPersistedItems(command: PatchStepDataCommand) {
    const workflow = await this.fetchWorkflow(command);

    const { currentStep } = await this.findStepWithSameMemoryPointer(command, workflow);

    return { workflow, currentStep };
  }

  private async updateName(persistedItems: ValidNotificationWorkflow, command: PatchStepDataCommand) {
    persistedItems.currentStep.name = command.name;
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

  private async fetchWorkflow(command: PatchStepDataCommand) {
    return await this.getWorkflowByIdsUseCase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      environmentId: command.user.environmentId,
      organizationId: command.user.organizationId,
      userId: command.user._id,
    });
  }

  private async findStepWithSameMemoryPointer(command: PatchStepDataCommand, workflow: NotificationTemplateEntity) {
    const currentStep = workflow.steps.find(
      (stepItem) => stepItem._id === command.stepId || stepItem.stepId === command.stepId
    );

    if (!currentStep) {
      throw new BadRequestException({
        message: 'No step found',
        stepId: command.stepId,
        workflowId: command.identifierOrInternalId,
      });
    }

    return { currentStep };
  }
  private async updateControlValues(persistedItems: ValidNotificationWorkflow, command: PatchStepDataCommand) {
    return await this.upsertControlValuesUseCase.execute(
      UpsertControlValuesCommand.create({
        organizationId: command.user.organizationId,
        environmentId: command.user.environmentId,
        notificationStepEntity: persistedItems.currentStep,
        workflowId: persistedItems.workflow._id,
        newControlValues: command.controlValues || {},
      })
    );
  }
}
