import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum, JSONSchemaDto } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { flattenObjectValues } from '../../util/utils';
import { pathsToObject } from '../../util/path-to-object';
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { BuildPayloadSchemaCommand } from './build-payload-schema.command';
import { transformMailyContentToLiquid } from '../generate-preview/transform-maily-content-to-liquid';
import { isStringTipTapNode } from '../../util/tip-tap.util';

@Injectable()
export class BuildPayloadSchema {
  constructor(private readonly controlValuesRepository: ControlValuesRepository) {}

  @InstrumentUsecase()
  async execute(command: BuildPayloadSchemaCommand): Promise<JSONSchemaDto> {
    const controlValues = await this.getControlValues(command);
    const sanitizedControlValues = await this.sanitizeControlValues(controlValues);

    return this.buildVariablesSchema(sanitizedControlValues);
  }

  private async getControlValues(command: BuildPayloadSchemaCommand) {
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

    return controlValues.flat();
  }

  @Instrument()
  private async sanitizeControlValues(controlValues: Record<string, unknown>[]): Promise<string[]> {
    const allVariables: string[] = [];

    for (const controlValue of controlValues) {
      const processedControlValue = await this.sanitizeControlValue(controlValue);
      const controlValuesString = flattenObjectValues(processedControlValue).join(' ');
      const templateVariables = extractLiquidTemplateVariables(controlValuesString);
      allVariables.push(...templateVariables.validVariables.map((variable) => variable.name));
    }

    return [...new Set(allVariables)];
  }

  @Instrument()
  private async sanitizeControlValue(controlValue: Record<string, unknown>): Promise<Record<string, unknown>> {
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

  private async buildVariablesSchema(variables: string[]) {
    const variablesObject = pathsToObject(variables, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    }).payload;

    const schema: JSONSchemaDto = {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: true,
    };

    for (const [key, value] of Object.entries(variablesObject)) {
      if (schema.properties && schema.required) {
        schema.properties[key] = { type: 'string', default: value };
        schema.required.push(key);
      }
    }

    return schema;
  }
}
