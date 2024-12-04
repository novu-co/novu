import { Injectable } from '@nestjs/common';
import { ControlValuesRepository } from '@novu/dal';
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
    const controlValues = await this.controlValuesRepository.find({
      _environmentId: command.environmentId,
      _organizationId: command.organizationId,
      _workflowId: command.workflowId,
      level: ControlValuesLevelEnum.STEP_CONTROLS,
    });

    if (!controlValues?.length) {
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

  @Instrument()
  private extractTemplateVariables(controlValues: Array<{ controls: unknown | null }>): string[] {
    const flattenedControls = controlValues
      .map((item) => item.controls)
      .filter((control): control is NonNullable<typeof control> => control != null);

    const concatenatedControlValues = flattenedControls.map(flattenObjectValues).flat().join(' ');

    return extractLiquidTemplateVariables(concatenatedControlValues).validVariables;
  }
}
