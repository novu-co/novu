// Define the command interface

import { BaseCommand } from '@novu/application-generic';
import { FullPayloadForRender } from './render-command';

export class ExpandEmailEditorSchemaCommand extends BaseCommand {
  body: string;
  fullPayloadForRender: FullPayloadForRender;
}
