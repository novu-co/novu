import { Injectable } from '@nestjs/common';
import _ from 'lodash';

import { createMockObjectFromSchema, GeneratePreviewResponseDto, PreviewPayload, StepResponseDto } from '@novu/shared';
import { GetWorkflowByIdsUseCase, PinoLogger, WorkflowInternalResponseDto } from '@novu/application-generic';

import { PreviewStep } from '../../../bridge/usecases/preview-step';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { BuildPayloadSchema } from '../build-payload-schema/build-payload-schema.usecase';
import { BasePreviewHandler } from './base-preview';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

@Injectable()
export class ExternalPreviewHandler extends BasePreviewHandler {
  constructor(
    protected previewStepUsecase: PreviewStep,
    protected buildStepDataUsecase: BuildStepDataUsecase,
    protected getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    protected buildPayloadSchema: BuildPayloadSchema,
    protected readonly logger: PinoLogger
  ) {
    super(previewStepUsecase, buildStepDataUsecase, getWorkflowByIdsUseCase, buildPayloadSchema, logger);
  }
  async preview(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    return super.preview(command);
  }

  /**
   * External workflows handle their own control value validation and sanitization
   * since they are defined programmatically rather than through the dashboard
   */
  protected sanitizeControlValues = (
    controlValues: Record<string, unknown>,
    stepData: StepResponseDto
  ): Record<string, unknown> => {
    return controlValues;
  };

  /**
   * Overrides template data with stored schema to match external workflow structure
   */
  protected mergeVariablesExample(
    previewTemplateData: { variablesExample: {}; controlValues: {} },
    commandVariablesExample: PreviewPayload | undefined,
    workflow: WorkflowInternalResponseDto
  ) {
    let finalVariablesExample = {};
    const payloadMockBySchema = createMockObjectFromSchema({
      type: 'object',
      properties: { payload: workflow.payloadSchema },
    });

    finalVariablesExample = { ...previewTemplateData.variablesExample, ...payloadMockBySchema };

    return _.merge(finalVariablesExample, commandVariablesExample || {});
  }
}
