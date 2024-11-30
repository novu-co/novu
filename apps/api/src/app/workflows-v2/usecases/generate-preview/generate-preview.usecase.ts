import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import _ from 'lodash';
import {
  ChannelTypeEnum,
  GeneratePreviewResponseDto,
  JobStatusEnum,
  JSONSchemaDto,
  PreviewPayload,
  StepDataDto,
  WorkflowOriginEnum,
} from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  WorkflowInternalResponseDto,
  Instrument,
  InstrumentUsecase,
} from '@novu/application-generic';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { GeneratePreviewCommand } from './generate-preview.command';
import { extractTemplateVars } from '../../util/template-variables/extract-template-variables';
import { pathsToObject } from '../../util/path-to-object';

@Injectable()
export class GeneratePreviewUsecase {
  constructor(
    private legacyPreviewStepUseCase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase
  ) {}

  @InstrumentUsecase()
  async execute(command: GeneratePreviewCommand): Promise<GeneratePreviewResponseDto> {
    const { previewPayload: commandVariablesExample, controlValues: commandControlValues } =
      command.generatePreviewRequestDto;
    const stepData = await this.getStepData(command);
    const workflow = await this.findWorkflow(command);

    const variablesExample = this.buildVariablesExample(
      workflow,
      stepData,
      commandVariablesExample,
      commandControlValues
    );
    const executeOutput = await this.executePreviewUsecase(
      command,
      stepData,
      variablesExample,
      commandControlValues || {}
    );

    return {
      result: {
        preview: executeOutput.outputs as any,
        type: stepData.type as unknown as ChannelTypeEnum,
      },
      previewPayloadExample: variablesExample,
    } as GeneratePreviewResponseDto;
  }

  @Instrument()
  private buildVariablesExample(
    workflow: WorkflowInternalResponseDto,
    stepData: StepDataDto,
    commandVariablesExample?: PreviewPayload,
    commandControlValues?: Record<string, unknown>
  ) {
    const variablesExample = this.generateVariablesExample(stepData, commandControlValues);

    if (workflow.origin === WorkflowOriginEnum.EXTERNAL) {
      variablesExample.payload = this.generateSamplePayload(workflow.payloadSchema);
    }

    return _.merge(variablesExample, commandVariablesExample as Record<string, unknown>);
  }

  @Instrument()
  private generateVariablesExample(stepData: StepDataDto, commandControlValues?: Record<string, unknown>) {
    const controlValues = Object.values(commandControlValues || stepData.controls.values).join('');
    const variablesExample = pathsToObject(extractTemplateVars(controlValues), {
      valuePrefix: '{{',
      valueSuffix: '}}',
    });

    return variablesExample;
  }

  @Instrument()
  private async findWorkflow(command: GeneratePreviewCommand) {
    return await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        identifierOrInternalId: command.identifierOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
  }

  /**
   * Generates a payload based solely on the schema.
   * Supports nested schemas and applies defaults where defined.
   * @param JSONSchemaDto - Defining the structure. example:
   *  {
   *    firstName: { type: 'string', default: 'John' },
   *    lastName: { type: 'string' }
   *  }
   * @returns - Generated payload. example: { firstName: 'John', lastName: '{{payload.lastName}}' }
   */
  @Instrument()
  private generateSamplePayload(schema: JSONSchemaDto, path = 'payload', depth = 0): Record<string, unknown> {
    const MAX_DEPTH = 10;
    if (depth >= MAX_DEPTH) {
      throw new BadRequestException({
        message: 'Schema has surpassed the maximum allowed depth. Please specify a more shallow payload schema.',
        maxDepth: MAX_DEPTH,
      });
    }

    if (Object.values(schema.properties || {}).length === 0) {
      return {};
    }

    if (schema.type !== 'object' || !schema.properties) {
      throw new BadRequestException({
        message: 'Schema must define an object with properties.',
      });
    }

    return Object.entries(schema.properties).reduce((acc, [key, definition]) => {
      if (typeof definition === 'boolean') {
        return acc;
      }

      const currentPath = `${path}.${key}`;

      if (definition.default) {
        acc[key] = definition.default;
      } else if (definition.type === 'object' && definition.properties) {
        acc[key] = this.generateSamplePayload(definition, currentPath, depth + 1);
      } else {
        acc[key] = `{{${currentPath}}}`;
      }

      return acc;
    }, {});
  }

  @Instrument()
  private async getStepData(command: GeneratePreviewCommand) {
    return await this.buildStepDataUsecase.execute({
      identifierOrInternalId: command.identifierOrInternalId,
      stepId: command.stepDatabaseId,
      user: command.user,
    });
  }

  private isFrameworkError(obj: any): obj is FrameworkError {
    return typeof obj === 'object' && obj.status === '400' && obj.name === 'BridgeRequestError';
  }

  @Instrument()
  private async executePreviewUsecase(
    command: GeneratePreviewCommand,
    stepData: StepDataDto,
    hydratedPayload: PreviewPayload,
    updatedControlValues: Record<string, unknown>
  ) {
    const state = buildState(hydratedPayload.steps);
    try {
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
    } catch (error) {
      if (this.isFrameworkError(error)) {
        throw new GeneratePreviewError(error);
      } else {
        throw error;
      }
    }
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

export class GeneratePreviewError extends InternalServerErrorException {
  constructor(error: FrameworkError) {
    super({
      message: `GeneratePreviewError: Original Message:`,
      frameworkMessage: error.response.message,
      code: error.response.code,
      data: error.response.data,
    });
  }
}

class FrameworkError {
  response: {
    message: string;
    code: string;
    data: unknown;
  };
  status: number;
  options: Record<string, unknown>;
  message: string;
  name: string;
}
