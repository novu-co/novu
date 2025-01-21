import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum, JSONSchemaDto } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { keysToObject } from '../../util/utils';
import { BuildPayloadSchemaCommand } from './build-payload-schema.command';
import { buildVariables } from '../../util/build-variables';

@Injectable()
export class BuildPayloadSchema {
  constructor(private readonly controlValuesRepository: ControlValuesRepository) {}

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

    // get just the actual control "values", not entire objects
    return controlValues.flat().flatMap((obj) => Object.values(obj));
  }

  /**
   * @example
   * controlValues = [ "John {{name}}", "Address {{address}} {{address}}", "nothing", 123, true ]
   * returns = [ "name", "address" ]
   */
  @Instrument()
  private async extractAllVariables(controlValues: unknown[]): Promise<string[]> {
    const allVariables: string[] = [];

    for (const controlValue of controlValues) {
      const templateVariables = buildVariables(undefined, controlValue);
      allVariables.push(...templateVariables.validVariables.map((variable) => variable.name));
    }

    return [...new Set(allVariables)];
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
