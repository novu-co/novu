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
  private extractTemplateVariables(controlValues: Record<string, unknown>[]): string[] {
    const controlValuesString = controlValues.map(flattenObjectValues).flat().join(' ');

    return extractLiquidTemplateVariables(controlValuesString).validVariables.map((variable) => variable.name);
  }
}
