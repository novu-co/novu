import { Injectable } from '@nestjs/common';
import { RulesLogic, AdditionalOperation } from 'json-logic-js';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';

import { flattenObjectValues, keysToObject } from '../../util/utils';
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { ExtractVariablesCommand } from './extract-variables.command';
import { isStringTipTapNode } from '../../util/tip-tap.util';
import { HydrateEmailSchemaUseCase } from '../../../environments-v1/usecases/output-renderers/hydrate-email-schema.usecase';
import { extractFieldsFromRules, isValidRule } from '../../../shared/services/query-parser/query-parser.service';

@Injectable()
export class ExtractVariables {
  constructor(
    private readonly controlValuesRepository: ControlValuesRepository,
    private readonly hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase
  ) {}

  @InstrumentUsecase()
  async execute(command: ExtractVariablesCommand): Promise<Record<string, unknown>> {
    const controlValues = await this.getControlValues(command);
    const extractedVariables = await this.extractAllVariables(controlValues);

    return keysToObject(extractedVariables);
  }

  private async getControlValues(command: ExtractVariablesCommand) {
    let controlValues = command.controlValues ? [command.controlValues] : [];

    if (!controlValues.length && command.workflowId) {
      controlValues = (
        await this.controlValuesRepository.find(
          {
            _environmentId: command.environmentId,
            _organizationId: command.organizationId,
            _workflowId: command.workflowId,
            level: ControlValuesLevelEnum.STEP_CONTROLS,
            controls: { $ne: null },
          },
          {
            controls: 1,
            _id: 0,
          }
        )
      ).map((item) => item.controls);
    }

    return controlValues.flat();
  }

  @Instrument()
  private async extractAllVariables(controlValues: Record<string, unknown>[]): Promise<string[]> {
    const allVariables: string[] = [];

    for (const controlValue of controlValues) {
      const processedControlValue = await this.extractVariables(controlValue);
      const controlValuesString = flattenObjectValues(processedControlValue).join(' ');
      const templateVariables = extractLiquidTemplateVariables(controlValuesString);
      allVariables.push(...templateVariables.validVariables.map((variable) => variable.name));
    }

    return [...new Set(allVariables)];
  }

  @Instrument()
  private async extractVariables(controlValue: Record<string, unknown>): Promise<Record<string, unknown>> {
    const processedValue: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(controlValue)) {
      if (isStringTipTapNode(value)) {
        processedValue[key] = this.hydrateEmailSchemaUseCase.execute({ emailEditor: value });
      } else if (key === 'skip' && isValidRule(value as RulesLogic<AdditionalOperation>)) {
        const fields = extractFieldsFromRules(value as RulesLogic<AdditionalOperation>)
          .filter((field) => field.startsWith('payload.') || field.startsWith('subscriber.data.'))
          .map((field) => `{{${field}}}`);

        processedValue[key] = {
          rules: value,
          fields,
        };
      } else {
        processedValue[key] = value;
      }
    }

    return processedValue;
  }
}
