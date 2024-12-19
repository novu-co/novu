import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum, JSONSchemaDto } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { flattenObjectValues } from '../../util/utils';
import { pathsToObject } from '../../util/path-to-object';
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';
import { BuildPayloadSchemaCommand } from './build-payload-schema.command';
import { transformMailyContentToLiquid } from '../generate-preview/transform-maily-content-to-liquid';
import { isStringTipTapNode } from '../../util/tip-tap.util';

@Injectable()
export class BuildPayloadSchema {
  constructor(private readonly controlValuesRepository: ControlValuesRepository) {}

  @InstrumentUsecase()
  async execute(command: BuildPayloadSchemaCommand): Promise<JSONSchemaDto> {
    const controlValues = await this.buildControlValues(command);

    if (!controlValues.length) {
      return {
        type: 'object',
        properties: {},
        additionalProperties: true,
      };
    }

    const templateVars = await this.processControlValues(controlValues);
    if (templateVars.length === 0) {
      return {
        type: 'object',
        properties: {},
        additionalProperties: true,
      };
    }

    const variablesExample = pathsToObject(templateVars, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    }).payload;

    return convertJsonToSchemaWithDefaults(variablesExample);
  }

  private async buildControlValues(command: BuildPayloadSchemaCommand) {
    let controlValues = command.controlValues ? [command.controlValues] : [];

    if (!controlValues.length) {
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

    return controlValues;
  }

  @Instrument()
  private async processControlValues(controlValues: Record<string, unknown>[]): Promise<string[]> {
    const allVariables: string[] = [];

    for (const controlValue of controlValues) {
      const processedControlValue = await this.processControlValue(controlValue);
      const controlValuesString = flattenObjectValues(processedControlValue).join(' ');
      const templateVariables = extractLiquidTemplateVariables(controlValuesString);
      allVariables.push(...templateVariables.validVariables.map((variable) => variable.name));
    }

    return [...new Set(allVariables)];
  }

  @Instrument()
  private async processControlValue(controlValue: Record<string, unknown>): Promise<Record<string, unknown>> {
    const processedValue: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(controlValue)) {
      if (isStringTipTapNode(value)) {
        processedValue[key] = transformMailyContentToLiquid(JSON.parse(value));
      } else {
        processedValue[key] = value;
      }
    }

    return processedValue;
  }
}
