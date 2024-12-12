import { BaseCommand } from '@novu/application-generic';
import { JSONSchemaDto } from '@novu/shared';

export class ExtractDefaultValuesFromSchemaCommand extends BaseCommand {
  jsonSchemaDto?: JSONSchemaDto;
  controlValues: Record<string, unknown>;
}
