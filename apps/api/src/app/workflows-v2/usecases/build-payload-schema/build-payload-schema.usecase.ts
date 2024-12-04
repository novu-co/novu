import { Injectable } from '@nestjs/common';
import { ControlValuesEntity, ControlValuesRepository } from '@novu/dal';
import { ControlValuesLevelEnum, JSONSchemaDto } from '@novu/shared';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { flattenObjectValues } from '../../util/utils';
import { pathsToObject } from '../../util/path-to-object';
import { extractLiquidTemplateVariables } from '../../util/template-parser/liquid-parser';
import { convertJsonToSchemaWithDefaults } from '../../util/jsonToSchema';
import { BuildPayloadSchemaCommand } from './build-payload-schema.command';

@Injectable()
export class BuildPayloadSchema {
  constructor(private readonly controlValuesRepository: ControlValuesRepository) {}

  @InstrumentUsecase()
  async execute(command: BuildPayloadSchemaCommand): Promise<JSONSchemaDto> {
    const controlValues = await this.buildControlValues(command);

    if (!controlValues.length) {
      return {};
    }

    const templateVars = this.extractTemplateVariables(controlValues);
    if (templateVars.length === 0) {
      return {};
    }

    const variablesExample = pathsToObject(templateVars, {
      valuePrefix: '{{',
      valueSuffix: '}}',
    }).payload as Record<string, unknown>;

    return convertJsonToSchemaWithDefaults(variablesExample);
  }

  private async buildControlValues(command: BuildPayloadSchemaCommand) {
    let aggregateControlValues = command.controlValues ? [command.controlValues] : [];

    if (!aggregateControlValues.length) {
      aggregateControlValues = (
        await this.controlValuesRepository.find({
          _environmentId: command.environmentId,
          _organizationId: command.organizationId,
          _workflowId: command.workflowId,
          level: ControlValuesLevelEnum.STEP_CONTROLS,
        })
      )
        .map((item) => item.controls)
        .filter((control): control is NonNullable<typeof control> => control != null);
    }

    return aggregateControlValues;
  }

  @Instrument()
  private extractTemplateVariables(aggregateControlValues: Record<string, unknown>[]): string[] {
    const concatenatedControlValues = aggregateControlValues.map(flattenObjectValues).flat().join(' ');

    return extractLiquidTemplateVariables(concatenatedControlValues).validVariables;
  }
}
