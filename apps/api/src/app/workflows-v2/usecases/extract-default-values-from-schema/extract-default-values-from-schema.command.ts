import { BaseCommand } from '@novu/application-generic';
import { type JSONSchemaDto } from '@novu/shared';

export class ExtractDefaultValuesFromSchemaCommand extends BaseCommand {
  jsonSchemaDto?: JSONSchemaDto;
}
