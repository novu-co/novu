import { Injectable } from '@nestjs/common';

import { NotificationTemplateEntity } from '@novu/dal';
import { WorkflowResponseDto } from '@novu/shared';
import {
  GetPreferences,
  GetPreferencesCommand,
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
} from '@novu/application-generic';

import { GetWorkflowCommand } from './get-workflow.command';
import { toResponseWorkflowDto } from '../../mappers/notification-template-mapper';

@Injectable()
export class GetWorkflowUseCase {
  constructor(
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private getPreferencesUseCase: GetPreferences
  ) {}
  async execute(command: GetWorkflowCommand): Promise<WorkflowResponseDto> {
    const workflowEntity: NotificationTemplateEntity = await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        identifierOrInternalId: command.identifierOrInternalId,
      })
    );

    const preferences = await this.getPreferencesUseCase.safeExecute(
      GetPreferencesCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        templateId: workflowEntity._id,
      })
    );

    return toResponseWorkflowDto(workflowEntity, preferences);
  }
}
