import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum, JSONSchemaDto } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { flattenObjectValues, keysToObject } from '../../util/utils';
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { BuildPayloadSchemaCommand } from './build-payload-schema.command';
import { isStringTipTapNode } from '../../util/tip-tap.util';
import { HydrateEmailSchemaUseCase } from '../../../environments-v1/usecases/output-renderers/hydrate-email-schema.usecase';

@Injectable()
export class BuildPayloadSchema {
  constructor(
    private readonly controlValuesRepository: ControlValuesRepository,
    private readonly hydrateEmailSchemaUseCase: HydrateEmailSchemaUseCase
  ) {}

  @InstrumentUsecase()
  async execute(command: BuildPayloadSchemaCommand): Promise<JSONSchemaDto> {
    const controlValues = await this.getControlValues(command);
    const extractedVariables = await this.extractAllVariables(controlValues);

    return this.buildVariablesSchema(extractedVariables);
  }

  private async getControlValues(command: BuildPayloadSchemaCommand) {
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
      } else {
        processedValue[key] = value;
      }
    }

    return processedValue;
  }

  private async buildVariablesSchema(variables: string[]) {
    const { payload } = keysToObject(variables);

    const schema: JSONSchemaDto = {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: true,
    };

    if (payload) {
      for (const [key, value] of Object.entries(payload)) {
        if (schema.properties && schema.required) {
          schema.properties[key] = determineSchemaType(value);
          schema.required.push(key);
        }
      }
    }

    return schema;
  }
}

function determineSchemaType(value: unknown): JSONSchemaDto {
  if (value === null) {
    return { type: 'null' };
  }

  if (Array.isArray(value)) {
    return {
      type: 'array',
      items: value.length > 0 ? determineSchemaType(value[0]) : { type: 'null' },
    };
  }

  switch (typeof value) {
    case 'string':
      return { type: 'string', default: value };
    case 'number':
      return { type: 'number', default: value };
    case 'boolean':
      return { type: 'boolean', default: value };
    case 'object':
      return {
        type: 'object',
        properties: Object.entries(value).reduce(
          (acc, [key, val]) => {
            acc[key] = determineSchemaType(val);

            return acc;
          },
          {} as { [key: string]: JSONSchemaDto }
        ),
        required: Object.keys(value),
      };

    default:
      return { type: 'null' };
  }
}
