import { Injectable } from '@nestjs/common';
import {
  ChannelTypeEnum,
  GeneratePreviewRequestDto,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  PreviewPayload,
  StepDataDto,
} from '@novu/shared';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { StepMissingControlsException } from '../../exceptions/step-not-found-exception';
import { PrepareAndValidateContentUsecase, ValidatedContentResponse } from '../validate-content';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private prepareAndValidateContentUsecase: PrepareAndValidateContentUsecase,
    private buildStepDataUsecase: BuildStepDataUsecase
  ) {}

  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    const dto = command.generatePreviewRequestDto;
    const stepData = await this.getStepData(command);

    const validatedContent: ValidatedContentResponse = await this.getValidatedContent(dto, stepData);
    const executeOutput = await this.executePreviewUsecase(
      command,
      stepData,
      validatedContent.finalPayload,
      validatedContent.finalControlValues
    );

    return {
      issues: validatedContent.issues, // Use the issues from validatedContent
      result: {
        preview: executeOutput.outputs as any,
        type: stepData.type as unknown as ChannelTypeEnum,
      },
      previewPayloadExample: validatedContent.finalPayload,
    };
  }

  private async getValidatedContent(dto: GeneratePreviewRequestDto, stepData: StepDataDto) {
    if (!stepData.controls?.dataSchema) {
      throw new StepMissingControlsException(stepData.stepId, stepData);
    }

    return await this.prepareAndValidateContentUsecase.execute({
      controlValues: dto.controlValues || stepData.controls.values,
      controlDataSchema: stepData.controls.dataSchema,
      variableSchema: stepData.variables,
      previewPayloadFromDto: dto.previewPayload,
    });
  }

  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      identifierOrInternalId: command.workflowId,
      stepId: command.stepDatabaseId,
      user: command.user,
    });
  }

  private async executePreviewUsecase(
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    hydratedPayload: PreviewPayload,
    updatedControlValues: Record<string, unknown>
  ) {
    const state = buildState(hydratedPayload.steps);

    return await this.legacyPreviewStepUseCase.execute(
      PreviewStepCommand.create({
        payload: hydratedPayload.payload || {},
        subscriber: hydratedPayload.subscriber,
        controls: updatedControlValues || {},
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        stepId: stepData.stepId,
        userId: command.user._id,
        workflowId: stepData.workflowId,
        workflowOrigin: stepData.origin,
        state,
      })
    );
  }
}

function buildState(steps: Record<string, unknown> | undefined): FrameworkPreviousStepsOutputState[] {
  const outputArray: FrameworkPreviousStepsOutputState[] = [];
  for (const [stepId, value] of Object.entries(steps || {})) {
    outputArray.push({
      stepId,
      outputs: value as Record<string, unknown>,
      state: {
        status: JobStatusEnum.COMPLETED,
      },
    });
  }

  return outputArray;
}
