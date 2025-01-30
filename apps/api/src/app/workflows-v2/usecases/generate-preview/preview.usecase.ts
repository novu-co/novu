import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { captureException } from '@sentry/node';

import { ChannelTypeEnum, GeneratePreviewResponseDto, JobStatusEnum, WorkflowOriginEnum } from '@novu/shared';
import {
  GetWorkflowByIdsCommand,
  GetWorkflowByIdsUseCase,
  Instrument,
  InstrumentUsecase,
  PinoLogger,
} from '@novu/application-generic';
import { PreviewStep, PreviewStepCommand } from '../../../bridge/usecases/preview-step';
import { FrameworkPreviousStepsOutputState } from '../../../bridge/usecases/preview-step/preview-step.command';
import { BuildStepDataUsecase } from '../build-step-data';
import { PreviewCommand } from './preview.command';
import { ExtractVariablesCommand } from '../extract-variables/extract-variables.command';
import { ExtractVariables } from '../extract-variables/extract-variables.usecase';
import { Variable } from '../../util/template-parser/liquid-parser';
import { buildVariables } from '../../util/build-variables';
import { keysToObject, multiplyArrayItems } from '../../util/utils';
import { buildVariablesSchema } from '../../util/create-schema';
import { isObjectMailyJSONContent } from '../../../environments-v1/usecases/output-renderers/maily-to-liquid/wrap-maily-in-liquid.command';
import { createPreviewStrategy } from './strategies/preview-strategy';

const LOG_CONTEXT = 'GeneratePreviewUsecase';

@Injectable()
export class PreviewUsecase {
  constructor(
    private previewStepUsecase: PreviewStep,
    private buildStepDataUsecase: BuildStepDataUsecase,
    private getWorkflowByIdsUseCase: GetWorkflowByIdsUseCase,
    private extractVariables: ExtractVariables,
    private readonly logger: PinoLogger
  ) {}

  @InstrumentUsecase()
  async execute(command: PreviewCommand): Promise<GeneratePreviewResponseDto> {
    try {
      const {
        stepData,
        controlValues: initialControlValues,
        variableSchema,
        workflow,
      } = await this.initializePreviewContext(command);
      const commandVariablesExample = command.generatePreviewRequestDto.previewPayload;
      const strategy = createPreviewStrategy(workflow.origin || WorkflowOriginEnum.EXTERNAL, this.logger);

      const sanitizedValidatedControls = strategy.sanitizeControlValues(initialControlValues, stepData);

      let previewTemplateData = {
        variablesExample: {},
        controlValues: {},
      };

      for (const [controlKey, controlValue] of Object.entries(sanitizedValidatedControls || {})) {
        const variables = buildVariables(variableSchema, controlValue, this.logger);
        const processedControlValues = this.replaceInvalidLiquidOutput(controlValue, variables.invalidVariables);
        const showIfVariables: string[] = this.findShowIfVariables(processedControlValues);
        const validVariableNames = variables.validVariables.map((variable) => variable.name);
        const variablesExampleResult = keysToObject(validVariableNames, showIfVariables);

        // multiply array items by 3 for preview example purposes
        const multipliedVariablesExampleResult = multiplyArrayItems(variablesExampleResult, 3);

        previewTemplateData = {
          variablesExample: _.merge(previewTemplateData.variablesExample, multipliedVariablesExampleResult),
          controlValues: {
            ...previewTemplateData.controlValues,
            [controlKey]: isObjectMailyJSONContent(processedControlValues)
              ? JSON.stringify(processedControlValues)
              : processedControlValues,
          },
        };
      }

      const mergedVariablesExample = strategy.mergeVariablesExample(
        workflow,
        previewTemplateData,
        commandVariablesExample
      );

      const executeOutput = await this.previewStepUsecase.execute(
        PreviewStepCommand.create({
          payload: (mergedVariablesExample.payload as Record<string, unknown>) || {},
          subscriber: (mergedVariablesExample.subscriber as Record<string, unknown>) || {},
          controls: previewTemplateData.controlValues || {},
          environmentId: command.user.environmentId,
          organizationId: command.user.organizationId,
          stepId: stepData.stepId,
          userId: command.user._id,
          workflowId: stepData.workflowId,
          workflowOrigin: stepData.origin,
          state: buildState(mergedVariablesExample.steps as Record<string, unknown>),
        })
      );

      return {
        result: {
          preview: executeOutput.outputs as any,
          type: stepData.type as unknown as ChannelTypeEnum,
        },
        previewPayloadExample: mergedVariablesExample,
      };
    } catch (error) {
      this.logger.error(
        {
          err: error,
          workflowIdOrInternalId: command.workflowIdOrInternalId,
          stepIdOrInternalId: command.stepIdOrInternalId,
        },
        `Unexpected error while generating preview`,
        LOG_CONTEXT
      );
      if (process.env.SENTRY_DSN) {
        captureException(error);
      }

      return {
        result: {
          preview: {},
          type: undefined,
        },
        previewPayloadExample: {},
      } as any;
    }
  }

  /**
   * Extracts showIf variables from TipTap nodes to transform template variables
   * (e.g. {{payload.foo}}) into true - for preview purposes
   */
  private findShowIfVariables(processedControlValues: Record<string, unknown>) {
    const showIfVariables: string[] = [];
    if (typeof processedControlValues === 'string') {
      try {
        const parsed = JSON.parse(processedControlValues);
        const extractShowIfKeys = (node: any) => {
          if (node?.attrs?.showIfKey) {
            const key = node.attrs.showIfKey;
            showIfVariables.push(key);
          }
          if (node.content) {
            node.content.forEach((child: any) => extractShowIfKeys(child));
          }
        };
        extractShowIfKeys(parsed);
      } catch (e) {
        // If parsing fails, continue with empty showIfVariables
      }
    }

    return showIfVariables;
  }

  private async initializePreviewContext(command: PreviewCommand) {
    const stepData = await this.buildStepDataUsecase.execute({
      workflowIdOrInternalId: command.workflowIdOrInternalId,
      stepIdOrInternalId: command.stepIdOrInternalId,
      user: command.user,
    });
    const controlValues = command.generatePreviewRequestDto.controlValues || stepData.controls.values || {};
    const workflow = await this.getWorkflowByIdsUseCase.execute(
      GetWorkflowByIdsCommand.create({
        workflowIdOrInternalId: command.workflowIdOrInternalId,
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
      })
    );
    const variableSchema = await this.buildVariablesSchema(stepData.variables, command, controlValues);

    return { stepData, controlValues, variableSchema, workflow };
  }

  @Instrument()
  private async buildVariablesSchema(
    variables: Record<string, unknown>,
    command: PreviewCommand,
    controlValues: Record<string, unknown>
  ) {
    const { payload } = await this.extractVariables.execute(
      ExtractVariablesCommand.create({
        environmentId: command.user.environmentId,
        organizationId: command.user.organizationId,
        userId: command.user._id,
        workflowId: command.workflowIdOrInternalId,
        controlValues,
      })
    );
    const payloadSchema = buildVariablesSchema(payload);

    if (Object.keys(payloadSchema).length === 0) {
      return variables;
    }

    return _.merge(variables, { properties: { payload: payloadSchema } });
  }

  private replaceInvalidLiquidOutput(controlValues: unknown, invalidVariables: Variable[]): Record<string, unknown> {
    const INVALID_VARIABLE_REPLACEMENT = '';

    try {
      let controlValuesString = JSON.stringify(controlValues);

      for (const invalidVariable of invalidVariables) {
        if (!controlValuesString.includes(invalidVariable.output)) {
          continue;
        }

        controlValuesString = replaceAll(controlValuesString, invalidVariable.output, INVALID_VARIABLE_REPLACEMENT);
      }

      return JSON.parse(controlValuesString) as Record<string, unknown>;
    } catch (error) {
      return controlValues as Record<string, unknown>;
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

/**
 * Replaces all occurrences of a search string with a replacement string.
 */
export function replaceAll(text: string, searchValue: string, replaceValue: string): string {
  return _.replace(text, new RegExp(_.escapeRegExp(searchValue), 'g'), replaceValue);
}
