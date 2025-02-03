import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { addBreadcrumb } from '@sentry/node';
import { randomBytes } from 'crypto';
import { merge } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import {
  buildNotificationTemplateIdentifierKey,
  CachedEntity,
  ExecuteBridgeRequest,
  ExecuteBridgeRequestCommand,
  ExecuteBridgeRequestDto,
  Instrument,
  InstrumentUsecase,
  IWorkflowDataDto,
  StorageHelperService,
  WorkflowQueueService,
} from '@novu/application-generic';
import {
  EnvironmentEntity,
  EnvironmentRepository,
  NotificationTemplateEntity,
  NotificationTemplateRepository,
  TenantEntity,
  TenantRepository,
  WorkflowOverrideEntity,
  WorkflowOverrideRepository,
} from '@novu/dal';
import { DiscoverWorkflowOutput, GetActionEnum } from '@novu/framework/internal';
import { ReservedVariablesMap, TriggerContextTypeEnum, TriggerEventStatusEnum, WorkflowOriginEnum } from '@novu/shared';

import { ApiException } from '../../../shared/exceptions/api.exception';
import { VerifyPayload, VerifyPayloadCommand } from '../verify-payload';
import {
  ParseEventRequestBroadcastCommand,
  ParseEventRequestCommand,
  ParseEventRequestMulticastCommand,
} from './parse-event-request.command';

const LOG_CONTEXT = 'ParseEventRequest';

@Injectable()
export class ParseEventRequest {
  constructor(
    private notificationTemplateRepository: NotificationTemplateRepository,
    private environmentRepository: EnvironmentRepository,
    private verifyPayload: VerifyPayload,
    private storageHelperService: StorageHelperService,
    private workflowQueueService: WorkflowQueueService,
    private tenantRepository: TenantRepository,
    private workflowOverrideRepository: WorkflowOverrideRepository,
    private executeBridgeRequest: ExecuteBridgeRequest,
    protected moduleRef: ModuleRef
  ) {}

  @InstrumentUsecase()
  public async execute(command: ParseEventRequestCommand) {
    const transactionId = command.transactionId || uuidv4();

    const { environment, statelessWorkflowAllowed } = await this.isStatelessWorkflowAllowed(
      command.environmentId,
      command.bridgeUrl
    );

    if (environment && statelessWorkflowAllowed) {
      const discoveredWorkflow = await this.queryDiscoverWorkflow(command);

      if (!discoveredWorkflow) {
        throw new UnprocessableEntityException('workflow_not_found');
      }

      return await this.dispatchEvent(command, transactionId, discoveredWorkflow);
    }

    const template = await this.getNotificationTemplateByTriggerIdentifier({
      environmentId: command.environmentId,
      triggerIdentifier: command.identifier,
    });

    if (!template) {
      throw new UnprocessableEntityException('workflow_not_found');
    }

    const reservedVariablesTypes = this.getReservedVariablesTypes(template);
    this.validateTriggerContext(command, reservedVariablesTypes);

    let tenant: TenantEntity | null = null;
    if (command.tenant) {
      tenant = await this.tenantRepository.findOne({
        _environmentId: command.environmentId,
        identifier: typeof command.tenant === 'string' ? command.tenant : command.tenant.identifier,
      });

      if (!tenant) {
        return {
          acknowledged: true,
          status: TriggerEventStatusEnum.TENANT_MISSING,
        };
      }
    }

    let workflowOverride: WorkflowOverrideEntity | null = null;
    if (tenant) {
      workflowOverride = await this.workflowOverrideRepository.findOne({
        _environmentId: command.environmentId,
        _organizationId: command.organizationId,
        _workflowId: template._id,
        _tenantId: tenant._id,
      });
    }

    const inactiveWorkflow = !workflowOverride && !template.active;
    const inactiveWorkflowOverride = workflowOverride && !workflowOverride.active;

    if (inactiveWorkflowOverride || inactiveWorkflow) {
      const message = workflowOverride ? 'Workflow is not active by workflow override' : 'Workflow is not active';
      Logger.log(message, LOG_CONTEXT);

      return {
        acknowledged: true,
        status: TriggerEventStatusEnum.NOT_ACTIVE,
      };
    }

    if (!template.steps?.length) {
      return {
        acknowledged: true,
        status: TriggerEventStatusEnum.NO_WORKFLOW_STEPS,
      };
    }

    if (!template.steps?.some((step) => step.active)) {
      return {
        acknowledged: true,
        status: TriggerEventStatusEnum.NO_WORKFLOW_ACTIVE_STEPS,
      };
    }

    addBreadcrumb({
      message: 'Sending trigger',
      data: {
        triggerIdentifier: command.identifier,
      },
    });

    // Modify Attachment Key Name, Upload attachments to Storage Provider and Remove file from payload
    if (command.payload && Array.isArray(command.payload.attachments)) {
      this.modifyAttachments(command);
      await this.storageHelperService.uploadAttachments(command.payload.attachments);
      // eslint-disable-next-line no-param-reassign
      command.payload.attachments = command.payload.attachments.map(({ file, ...attachment }) => attachment);
    }

    const defaultPayload = this.verifyPayload.execute(
      VerifyPayloadCommand.create({
        payload: command.payload,
        template,
      })
    );
    // eslint-disable-next-line no-param-reassign
    command.payload = merge({}, defaultPayload, command.payload);

    const result = await this.dispatchEvent(command, transactionId);

    return result;
  }

  private async queryDiscoverWorkflow(command: ParseEventRequestCommand): Promise<DiscoverWorkflowOutput | null> {
    if (!command.bridgeUrl) {
      return null;
    }

    const discover = (await this.executeBridgeRequest.execute(
      ExecuteBridgeRequestCommand.create({
        statelessBridgeUrl: command.bridgeUrl,
        environmentId: command.environmentId,
        action: GetActionEnum.DISCOVER,
        workflowOrigin: WorkflowOriginEnum.EXTERNAL,
      })
    )) as ExecuteBridgeRequestDto<GetActionEnum.DISCOVER>;

    return discover?.workflows?.find((findWorkflow) => findWorkflow.workflowId === command.identifier) || null;
  }

  private async dispatchEvent(
    command: ParseEventRequestMulticastCommand | ParseEventRequestBroadcastCommand,
    transactionId,
    discoveredWorkflow?: DiscoverWorkflowOutput | null
  ) {
    const jobData: IWorkflowDataDto = {
      ...command,
      actor: command.actor,
      transactionId,
      bridgeWorkflow: discoveredWorkflow ?? undefined,
    };

    await this.workflowQueueService.add({ name: transactionId, data: jobData, groupId: command.organizationId });

    return {
      acknowledged: true,
      status: TriggerEventStatusEnum.PROCESSED,
      transactionId,
    };
  }

  private async isStatelessWorkflowAllowed(
    environmentId: string,
    bridgeUrl: string | undefined
  ): Promise<{ environment: EnvironmentEntity | null; statelessWorkflowAllowed: boolean }> {
    if (!bridgeUrl) {
      return { environment: null, statelessWorkflowAllowed: false };
    }

    const environment = await this.environmentRepository.findOne({ _id: environmentId });

    if (!environment) {
      throw new UnprocessableEntityException('Environment not found');
    }

    return { environment, statelessWorkflowAllowed: true };
  }

  @Instrument()
  @CachedEntity({
    builder: (command: { triggerIdentifier: string; environmentId: string }) =>
      buildNotificationTemplateIdentifierKey({
        _environmentId: command.environmentId,
        templateIdentifier: command.triggerIdentifier,
      }),
  })
  private async getNotificationTemplateByTriggerIdentifier(command: {
    triggerIdentifier: string;
    environmentId: string;
  }) {
    return await this.notificationTemplateRepository.findByTriggerIdentifier(
      command.environmentId,
      command.triggerIdentifier
    );
  }

  @Instrument()
  private validateTriggerContext(
    command: ParseEventRequestCommand,
    reservedVariablesTypes: TriggerContextTypeEnum[]
  ): void {
    const invalidKeys: string[] = [];

    for (const reservedVariableType of reservedVariablesTypes) {
      const payload = command[reservedVariableType];
      if (!payload) {
        invalidKeys.push(`${reservedVariableType} object`);
        continue;
      }
      const reservedVariableFields = ReservedVariablesMap[reservedVariableType].map((variable) => variable.name);
      for (const variableName of reservedVariableFields) {
        const variableNameExists = payload[variableName];

        if (!variableNameExists) {
          invalidKeys.push(`${variableName} property of ${reservedVariableType}`);
        }
      }
    }

    if (invalidKeys.length) {
      throw new ApiException(`Trigger is missing: ${invalidKeys.join(', ')}`);
    }
  }

  private modifyAttachments(command: ParseEventRequestCommand): void {
    // eslint-disable-next-line no-param-reassign
    command.payload.attachments = command.payload.attachments.map((attachment) => {
      const randomId = randomBytes(16).toString('hex');

      return {
        ...attachment,
        name: attachment.name,
        file: Buffer.from(attachment.file, 'base64'),
        storagePath: `${command.organizationId}/${command.environmentId}/${randomId}/${attachment.name}`,
      };
    });
  }

  private getReservedVariablesTypes(template: NotificationTemplateEntity): TriggerContextTypeEnum[] {
    const { reservedVariables } = template.triggers[0];

    return reservedVariables?.map((reservedVariable) => reservedVariable.type) || [];
  }
}
