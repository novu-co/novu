import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import {
  ContentIssue,
  JSONSchemaDto,
  StepContentIssueEnum,
  StepIssuesDto,
  UserSessionData,
  StepTypeEnum,
  WorkflowOriginEnum,
  ControlValuesLevelEnum,
} from '@novu/shared';
import {
  InstrumentUsecase,
  TierRestrictionsValidateUsecase,
  TierRestrictionsValidateCommand,
  dashboardSanitizeControlValues,
  PinoLogger,
} from '@novu/application-generic';

import _ from 'lodash';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { buildVariables } from '../../util/build-variables';
import { BuildAvailableVariableSchemaCommand, BuildAvailableVariableSchemaUsecase } from '../build-variable-schema';
import { BuildStepIssuesCommand } from './build-step-issues.command';

@Injectable()
export class BuildStepIssuesUsecase {
  constructor(
    private buildAvailableVariableSchemaUsecase: BuildAvailableVariableSchemaUsecase,
    private controlValuesRepository: ControlValuesRepository,
    private tierRestrictionsValidateUsecase: TierRestrictionsValidateUsecase,
    private logger: PinoLogger
  ) {}

  @InstrumentUsecase()
  async execute(command: BuildStepIssuesCommand): Promise<StepIssuesDto> {
    const {
      workflowOrigin,
      user,
      step: foundPersistedStep,
      workflow: persistedWorkflow,
      stepDto: step,
      controlSchema,
    } = command;

    const variableSchema = await this.buildAvailableVariableSchemaUsecase.execute(
      BuildAvailableVariableSchemaCommand.create({
        environmentId: user.environmentId,
        organizationId: user.organizationId,
        userId: user._id,
        stepInternalId: foundPersistedStep?.stepId,
        workflow: persistedWorkflow,
        ...(step.controlValues ? { optimisticControlValues: step.controlValues } : {}),
      })
    );

    let controlValueLocal = step.controlValues;

    if (!controlValueLocal) {
      controlValueLocal = (
        await this.controlValuesRepository.findOne({
          _environmentId: user.environmentId,
          _organizationId: user.organizationId,
          _workflowId: persistedWorkflow?._id,
          _stepId: foundPersistedStep?._templateId,
          level: ControlValuesLevelEnum.STEP_CONTROLS,
        })
      )?.controls;
    }

    const sanitizedControlValues =
      controlValueLocal && workflowOrigin === WorkflowOriginEnum.NOVU_CLOUD
        ? dashboardSanitizeControlValues(this.logger, controlValueLocal, step.type) || {}
        : this.frameworkSanitizeEmptyStringsToNull(controlValueLocal) || {};

    const controlIssues = this.processControlValuesBySchema(controlSchema, sanitizedControlValues || {});
    const liquidTemplateIssues = this.processControlValuesByLiquid(variableSchema, controlValueLocal || {});
    const customIssues = await this.processControlValuesByRules(user, step.type, sanitizedControlValues || {});
    const customControlIssues = _.isEmpty(customIssues) ? {} : { controls: customIssues };

    return _.merge(controlIssues, liquidTemplateIssues, customControlIssues);
  }

  private processControlValuesByLiquid(
    variableSchema: JSONSchemaDto | undefined,
    controlValues: Record<string, unknown> | null
  ): StepIssuesDto {
    const issues: StepIssuesDto = {};

    function processNestedControlValues(currentValue: unknown, currentPath: string[] = []) {
      if (!currentValue || typeof currentValue !== 'object') {
        const liquidTemplateIssues = buildVariables(variableSchema, currentValue);

        if (liquidTemplateIssues.invalidVariables.length > 0) {
          const controlKey = currentPath.join('.');
          issues.controls = issues.controls || {};

          issues.controls[controlKey] = liquidTemplateIssues.invalidVariables.map((error) => {
            const message = error.message
              ? error.message[0].toUpperCase() + error.message.slice(1).split(' line:')[0]
              : '';

            return {
              message: `${message} variable: ${error.output}`,
              issueType: StepContentIssueEnum.ILLEGAL_VARIABLE_IN_CONTROL_VALUE,
              variableName: error.output,
            };
          });
        }

        return;
      }

      for (const [key, value] of Object.entries(currentValue)) {
        processNestedControlValues(value, [...currentPath, key]);
      }
    }

    processNestedControlValues(controlValues);

    return issues;
  }

  private processControlValuesBySchema(
    controlSchema: JSONSchemaDto | undefined,
    controlValues: Record<string, unknown> | null
  ): StepIssuesDto {
    let issues: StepIssuesDto = {};

    if (!controlSchema || !controlValues) {
      return issues;
    }

    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(controlSchema);
    const isValid = validate(controlValues);
    const errors = validate.errors as null | ErrorObject[];

    if (!isValid && errors && errors?.length !== 0 && controlValues) {
      issues = {
        controls: errors.reduce(
          (acc, error) => {
            const path = this.getErrorPath(error);
            if (!acc[path]) {
              acc[path] = [];
            }
            acc[path].push({
              message: this.mapAjvErrorToMessage(error),
              issueType: this.mapAjvErrorToIssueType(error),
              variableName: path,
            });

            return acc;
          },
          {} as Record<string, ContentIssue[]>
        ),
      };

      return issues;
    }

    return issues;
  }

  private async processControlValuesByRules(
    user: UserSessionData,
    stepType: StepTypeEnum,
    controlValues: Record<string, unknown> | null
  ): Promise<StepIssuesDto> {
    const restrictionsErrors = await this.tierRestrictionsValidateUsecase.execute(
      TierRestrictionsValidateCommand.create({
        amount: controlValues?.amount as number | undefined,
        unit: controlValues?.unit as string | undefined,
        cron: controlValues?.cron as string | undefined,
        organizationId: user.organizationId,
        stepType,
      })
    );

    if (!restrictionsErrors) {
      return {};
    }

    const result: Record<string, ContentIssue[]> = {};
    for (const restrictionsError of restrictionsErrors) {
      result[restrictionsError.controlKey] = [
        {
          issueType: StepContentIssueEnum.TIER_LIMIT_EXCEEDED,
          message: restrictionsError.message,
        },
      ];
    }

    return result;
  }

  private getErrorPath(error: ErrorObject): string {
    const path = error.instancePath.substring(1);
    const { missingProperty } = error.params;

    if (!path || path.trim().length === 0) {
      return missingProperty;
    }

    const fullPath = missingProperty ? `${path}/${missingProperty}` : path;

    return fullPath?.replace(/\//g, '.');
  }

  private frameworkSanitizeEmptyStringsToNull(
    obj: Record<string, unknown> | undefined | null
  ): Record<string, unknown> | undefined | null {
    if (typeof obj !== 'object' || obj === null || obj === undefined) return obj;

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (typeof value === 'string' && value.trim() === '') {
          return [key, null];
        }
        if (typeof value === 'object') {
          return [key, this.frameworkSanitizeEmptyStringsToNull(value as Record<string, unknown>)];
        }

        return [key, value];
      })
    );
  }

  private mapAjvErrorToIssueType(error: ErrorObject): StepContentIssueEnum {
    switch (error.keyword) {
      case 'required':
        return StepContentIssueEnum.MISSING_VALUE;
      case 'type':
        return StepContentIssueEnum.MISSING_VALUE;
      default:
        return StepContentIssueEnum.MISSING_VALUE;
    }
  }

  private mapAjvErrorToMessage(error: ErrorObject<string, Record<string, unknown>, unknown>): string {
    if (error.keyword === 'required') {
      return `${_.capitalize(error.params.missingProperty)} is required`;
    }
    if (
      error.keyword === 'pattern' &&
      error.message?.includes('must match pattern') &&
      error.message?.includes('mailto') &&
      error.message?.includes('https')
    ) {
      return `Invalid URL format. Must be a valid absolute URL, path starting with /, or {{variable}}`;
    }

    return error.message || 'Invalid value';
  }
}
