import { Injectable } from '@nestjs/common';

import { GeneratePreviewResponseDto, WorkflowOriginEnum } from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  Instrument,
  InstrumentUsecase,
  PinoLogger,
} from '@novu/application-generic';

import { PreviewStep } from '../../../bridge/usecases/preview-step';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { BuildPayloadSchema } from '../build-payload-schema/build-payload-schema.usecase';
import { GeneralPreviewHandler } from './general-preview';
import { ExternalPreviewHandler } from './external-preview';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

export interface IPreviewHandler {
  preview: (command: GeneratePreviewCommand) => Promise<GeneratePreviewResponseDto>;
}

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private previewStepUsecase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private buildPayloadSchema: BuildPayloadSchema,
    private readonly logger: PinoLogger
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    let previewHandler: IPreviewHandler | null = null;
    const workflow = await this.findWorkflow(command);

    if (workflow.origin === WorkflowOriginEnum.NOVU_CLOUD) {
      previewHandler = new GeneralPreviewHandler(
        this.previewStepUsecase,
        this.buildStepDataUsecase,
        this.getWorkflowByIdsUseCase,
        this.buildPayloadSchema,
        this.logger
      );
    } else {
      previewHandler = new ExternalPreviewHandler(
        this.previewStepUsecase,
        this.buildStepDataUsecase,
        this.getWorkflowByIdsUseCase,
        this.buildPayloadSchema,
        this.logger
      );
    }

    return await previewHandler.preview(command);
  }

  @Instrument()
  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        workflowIdOrInternalId: command.workflowIdOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }
}
